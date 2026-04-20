from agents import function_tool
from utils.google_calendar import create_event, delete_event
import datetime
import sqlite3
from db.database import get_connection
from datetime import timedelta
from dateparser.date import DateDataParser
import dateparser
from utils.email import send_email

@function_tool
def get_current_datetime():
    """Returns the current date and time. Use this to calculate 'tomorrow' or 'next week'."""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


@function_tool
def parse_appointment_datetime(user_input: str):

    parsed = dateparser.parse(
        user_input,
        settings={
            "PREFER_DATES_FROM": "future",
            "RELATIVE_BASE": datetime.datetime.now()
        }
    )

    if not parsed:
        return "INVALID"

    return {
        "appointment_date": parsed.strftime("%Y-%m-%d"),
        "appointment_time": parsed.strftime("%H:%M")
    }


def get_doctor_id(doctor_name: str):
    """
    Returns doctor_id for a given doctor_name.
    Used for mapping user input to internal system IDs.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT doctor_id
        FROM doctors
        WHERE doctor_name = ?
    """, (doctor_name,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return "DOCTOR_NOT_FOUND"

    return row[0]

@function_tool
def get_doctor_information(doctor_name: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT doctor_name, specialization, available_days
        FROM doctors
        WHERE doctor_name = ?
    """, (doctor_name,))

    result = cursor.fetchone()
    conn.close()

    if not result:
        return "DOCTOR_NOT_FOUND"

    return {
        "doctor_name": result[0],
        "specialization": result[1],
        "available_days": result[2]
    }


def get_doctor_availability(doctor_id: str):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT available_days
        FROM doctors
        WHERE doctor_id = ?
    """, (doctor_id,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return "DOCTOR_NOT_FOUND"

    return row[0]  


def is_slot_taken(doctor_id: str, date: str, time: str):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 1 FROM appointments
        WHERE doctor_id = ?
        AND appointment_date = ?
        AND appointment_time = ?
    """, (doctor_id, date, time))

    result = cursor.fetchone()
    conn.close()

    return result is not None

@function_tool
def suggest_available_slots(doctor_name: str, date: str):
    """Suggests free slots for a doctor on a specific date (YYYY-MM-DD)."""

    all_slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"]

    try:
        day_name = datetime.datetime.strptime(date, "%Y-%m-%d").strftime("%A")
    except ValueError:
        return "Invalid date format. Use YYYY-MM-DD."

    doctor_id=get_doctor_id(doctor_name)

    available_days = get_doctor_availability(doctor_id)

    if available_days == "DOCTOR_NOT_FOUND":
        return f"Doctor not found."

    # Normalize days
    available_days_list = [day.strip().lower() for day in available_days.split(",")]
    if day_name.lower() not in available_days_list:
        return f"Doctor does not work on {day_name}s."

    #Filter slots
    free_slots = [
        slot for slot in all_slots
        if not is_slot_taken(doctor_id, date, slot)
    ]

    if not free_slots:
        return f"No available slots on {date}."

    return f"Available slots on {date}: {', '.join(free_slots)}"

@function_tool
def book_appointment(patient_number: str, doctor_name: str, date: str, time: str):
    """Books an appointment. 'time' should be HH:MM format."""
    
    doctor_id=get_doctor_id(doctor_name)
    # --- MISSING LOGIC 2: Double-Check (Race Condition) ---
    # Always check if the slot is still taken right before booking
    if is_slot_taken(doctor_id, date, time):
        return "ERROR: This slot was just taken by someone else. Please pick another."

    # --- MISSING LOGIC 3: Timezone and End-Time ---
    # Google Calendar needs a start and an end.
    start_dt = datetime.datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    end_dt = start_dt + timedelta(minutes=30) # Assuming 30 min appointments
    
    # Convert to ISO format (e.g., 2024-05-20T09:00:00)
    iso_start = start_dt.isoformat()
    iso_end = end_dt.isoformat()

    # 1. Save to DB

    # 2. Create Google Calendar event
    # Ensure your create_event function handles the 'Z' (UTC) or offset
    event = create_event(
        summary=f"{doctor_name} / Patient Number: {patient_number}",
        description=f"Automated booking for patient {patient_number}",
        start_time=iso_start,
        end_time=iso_end
    )
    event_id = event["event_id"]

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO appointments (patient_number, doctor_id, appointment_date, appointment_time, event_id)
        VALUES (?, ?, ?, ?,?)
    """, (patient_number, doctor_id, date,time,event_id))
    conn.commit()
    try:
        cursor.execute("SELECT email, patient_name FROM patients WHERE patient_number = ?", (patient_number,))
        row = cursor.fetchone()
        if row and row[0]:
            patient_email = row[0]
            patient_name = row[1] or ""
            subject = "Appointment Confirmed"
            from utils.email import send_templated_email
            context = {
                "patient_name": patient_name,
                "patient_number": patient_number,
                "doctor_name": doctor_name,
                "date": date,
                "time": time,
                "plain": f"Your appointment is confirmed for {date} at {time}."
            }
            send_templated_email(patient_email, subject, "appointment_confirmed.html", context)
    except Exception:
        pass

    conn.close()

    return f"Success! Appointment confirmed for {date} at {time}."

@function_tool
def cancel_appointment_by_id(appointment_id: int):
    """
    Cancels appointment using appointment_id.
    Also deletes event from Google Calendar.
    """

    conn = get_connection()
    cursor = conn.cursor()

    # 1. Get event_id + status + patient_number
    cursor.execute("""
        SELECT event_id, status, patient_number
        FROM appointments
        WHERE appointment_id = ?
    """, (appointment_id,))

    row = cursor.fetchone()

    if not row:
        conn.close()
        return "Appointment not found."

    event_id, status, patient_number = row

    if status == "cancelled":
        conn.close()
        return "Appointment already cancelled."

    # 2. Update DB
    cursor.execute("""
        UPDATE appointments
        SET status = 'cancelled'
        WHERE appointment_id = ?
    """, (appointment_id,))

    conn.commit()
    # Try to get patient email and notify
    try:
        cursor.execute("SELECT email, patient_name FROM patients WHERE patient_number = ?", (patient_number,))
        prow = cursor.fetchone()
        if prow and prow[0]:
            patient_email = prow[0]
            patient_name = prow[1] or ""
            subject = "Appointment Cancelled"
            from utils.email import send_templated_email
            context = {
                "patient_name": patient_name,
                "patient_number": patient_number,
                "appointment_id": appointment_id,
                "plain": f"Your appointment (ID: {appointment_id}) has been cancelled."
            }
            send_templated_email(patient_email, subject, "appointment_cancelled.html", context)
    except Exception:
        pass

    conn.close()

    # 3. Call Google delete function
    if event_id:
        success = delete_event(event_id)

        if not success:
            return "Appointment cancelled, but failed to delete from Google Calendar."

    return "Appointment cancelled successfully."

@function_tool
def reschedule_appointment(appointment_id: int, new_date: str, new_time: str):
    """
    Reschedules an existing appointment:
    - Checks if appointment exists
    - Checks if new slot is available
    - Deletes old Google Calendar event
    - Creates new event
    - Updates DB
    """

    import datetime
    from datetime import timedelta

    conn = get_connection()
    cursor = conn.cursor()

    # 1. Get existing appointment
    cursor.execute("""
        SELECT patient_number, doctor_id, appointment_date, appointment_time, event_id, status
        FROM appointments
        WHERE appointment_id = ?
    """, (appointment_id,))
    
    appointment = cursor.fetchone()

    if not appointment:
        conn.close()
        return "Appointment not found."

    patient_number, doctor_id, old_date, old_time, old_event_id, status = appointment

    if status == "cancelled":
        conn.close()
        return "Cannot reschedule a cancelled appointment."

    # 2. Check if new slot is available
    if is_slot_taken(doctor_id, new_date, new_time):
        conn.close()
        return "Selected new slot is already taken. Please choose another."

    # 3. Delete old Google Calendar event
    if old_event_id:
        delete_event(old_event_id)

    # 4. Create new event
    start_dt = datetime.datetime.strptime(f"{new_date} {new_time}", "%Y-%m-%d %H:%M")
    end_dt = start_dt + timedelta(minutes=30)

    iso_start = start_dt.isoformat()
    iso_end = end_dt.isoformat()

    cursor.execute("""
        SELECT doctor_name
        FROM doctors
        WHERE doctor_id = ?
    """, (doctor_id,))

    row = cursor.fetchone()
    doctor_name = row[0]

    event = create_event(
        summary=f"{doctor_name} / Patient Number: {patient_number}",
        description="Rescheduled appointment",
        start_time=iso_start,
        end_time=iso_end
    )

    event_id = event["event_id"]

    # 5. Update DB
    cursor.execute("""
        UPDATE appointments
        SET appointment_date = ?, 
            appointment_time = ?, 
            event_id = ?
        WHERE appointment_id = ?
    """, (new_date, new_time, event_id, appointment_id))

    conn.commit()
    # Notify patient about reschedule (best-effort)
    try:
        from utils.email import send_templated_email
        cursor.execute("SELECT email, patient_name FROM patients WHERE patient_number = ?", (patient_number,))
        prow = cursor.fetchone()
        if prow and prow[0]:
            patient_email = prow[0]
            patient_name = prow[1] or ""
            subject = "Appointment Rescheduled"
            context = {
                "patient_name": patient_name,
                "new_date": new_date,
                "new_time": new_time,
                "appointment_id": appointment_id,
                "plain": f"Your appointment has been rescheduled to {new_date} at {new_time}."
            }
            send_templated_email(patient_email, subject, "appointment_rescheduled.html", context)
    except Exception:
        pass

    conn.close()

    return f"Appointment rescheduled to {new_date} at {new_time}."
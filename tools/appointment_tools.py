from agents import function_tool
from utils.google_calendar import create_event
import datetime
import sqlite3
from db.database import get_connection
from datetime import timedelta

@function_tool
def get_current_datetime():
    """Returns the current date and time. Use this to calculate 'tomorrow' or 'next week'."""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@function_tool
def get_doctor_availability(doctor_name: str):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT available_days
        FROM doctors
        WHERE doctor_name = ?
    """, (doctor_name,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return "DOCTOR_NOT_FOUND"

    return row[0]  # e.g. "Monday,Wednesday,Friday"

@function_tool
def is_slot_taken(doctor_name: str, date: str, time: str):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 1 FROM appointments
        WHERE doctor_name = ?
        AND date = ?
        AND time = ?
    """, (doctor_name, date, time))

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

    available_days = get_doctor_availability(doctor_name)
    if available_days == "DOCTOR_NOT_FOUND":
        return f"Doctor {doctor_name} not found."

    if day_name not in available_days.split(","):
        return f"Dr. {doctor_name} does not work on {day_name}s."

    # Filter slots
    free_slots = [slot for slot in all_slots if not is_slot_taken(doctor_name, date, slot)]
    
    if not free_slots:
        return f"No available slots for Dr. {doctor_name} on {date}."
    
    return free_slots


@function_tool
def book_appointment(patient_number: str, doctor_name: str, date: str, time: str):
    """Books an appointment. 'time' should be HH:MM format."""
    
    # --- MISSING LOGIC 2: Double-Check (Race Condition) ---
    # Always check if the slot is still taken right before booking
    if is_slot_taken(doctor_name, date, time):
        return "ERROR: This slot was just taken by someone else. Please pick another."

    # --- MISSING LOGIC 3: Timezone and End-Time ---
    # Google Calendar needs a start and an end.
    start_dt = datetime.datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    end_dt = start_dt + timedelta(minutes=30) # Assuming 30 min appointments
    
    # Convert to ISO format (e.g., 2024-05-20T09:00:00)
    iso_start = start_dt.isoformat()
    iso_end = end_dt.isoformat()

    # 1. Save to DB
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO appointments (patient_number, doctor_name, date, time)
        VALUES (?, ?, ?, ?)
    """, (patient_number, doctor_name, date, time))
    conn.commit()
    conn.close()

    # 2. Create Google Calendar event
    # Ensure your create_event function handles the 'Z' (UTC) or offset
    event_link = create_event(
        summary=f"Dr. {doctor_name} / Patient {patient_number}",
        description=f"Automated booking for patient {patient_number}",
        start_time=iso_start,
        end_time=iso_end
    )

    return f"Success! Appointment confirmed for {date} at {time}. Link: {event_link}"
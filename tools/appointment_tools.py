from agents import function_tool
from utils.google_calendar import create_event
import datetime
import sqlite3
from db.database import get_connection

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

    all_slots = [
        "09:00", "09:30",
        "10:00", "10:30",
        "11:00",
        "14:00", "14:30",
        "15:00"
    ]

    # Get weekday
    day_name = datetime.datetime.strptime(date, "%Y-%m-%d").strftime("%A")

    available_days = get_doctor_availability(doctor_name)

    if available_days == "DOCTOR_NOT_FOUND":
        return []

    available_days = available_days.split(",")

    # If doctor not working that day
    if day_name not in available_days:
        return []

    # Filter free slots
    free_slots = []

    for slot in all_slots:
        if not is_slot_taken(doctor_name, date, slot):
            free_slots.append(slot)

    return free_slots


@function_tool
def book_appointment(patient_number: str, doctor_name: str, date: str, time: str):

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
    start_time = f"{date}T{time}:00"
    end_time = f"{date}T{time}:00"

    event_link = create_event(
        summary=f"Appointment {patient_number}",
        description=f"Doctor: {doctor_name}",
        start_time=start_time,
        end_time=end_time
    )

    return f"""
Appointment confirmed!
Patient: {patient_number}
Doctor: {doctor_name}
Date: {date}
Time: {time}
Calendar: {event_link}
"""
import sqlite3
import re
from agents import function_tool
from db.database import get_connection


# CREATE PATIENT
@function_tool
def create_patient(patient_name: str, contact: str, cnic: str, address: str, email: str, gender: str):
    """
    Create a new patient in the database after validation.
    """

    conn = get_connection()
    cursor = conn.cursor()

    # Check duplicate CNIC
    cursor.execute("SELECT patient_number, patient_name FROM patients WHERE cnic = ?", (cnic,))
    existing = cursor.fetchone()

    if existing:
        conn.close()
        return {
            "status": "exists",
            "message": f"Patient already exists: {existing[1]} ({existing[0]})"
        }

    # Generate patient number
    cursor.execute("SELECT patient_number FROM patients")
    rows = cursor.fetchall()

    max_num = 0
    for row in rows:
        match = re.search(r"\d+", row[0])
        if match:
            max_num = max(max_num, int(match.group()))

    patient_number = f"P{max_num + 1:03d}"

    # Insert patient
    cursor.execute("""
        INSERT INTO patients (
            patient_number, patient_name, contact, cnic, address, email, gender
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (patient_number, patient_name, contact, cnic, address, email, gender))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": "Patient created successfully",
        "patient_number": patient_number
    }


# CHECK PATIENT EXISTENCE
@function_tool
def check_patient_existence(patient_number: str):
    """
    Check if patient exists using patient_number.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT patient_name, cnic FROM patients WHERE patient_number = ?",
        (patient_number,)
    )

    result = cursor.fetchone()
    conn.close()

    if result:
        return {
            "exists": True,
            "patient_name": result[0],
            "cnic": result[1]
        }

    return {
        "exists": False,
        "message": "Patient not found"
    }


# GET PATIENT INFO
@function_tool
def get_patient_info(patient_number: str):
    """
    Fetch full patient details.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT patient_number, patient_name, contact, cnic, address, email, gender
        FROM patients
        WHERE patient_number = ?
    """, (patient_number,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            "status": "not_found",
            "message": "Patient does not exist"
        }

    return {
        "status": "success",
        "data": {
            "patient_number": row[0],
            "patient_name": row[1],
            "contact": row[2],
            "cnic": row[3],
            "address": row[4],
            "email": row[5],
            "gender": row[6]
        }
    }

@function_tool
def get_patient_appointments(patient_number: str):
    """
    Returns all active appointments for a patient.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT appointment_id, doctor_id, appointment_date, appointment_time, status
        FROM appointments
        WHERE patient_number = ?
        AND status = 'scheduled'
        ORDER BY appointment_date, appointment_time
    """, (patient_number,))

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return "No active appointments found."

    result = []
    for r in rows:
        result.append({
            "appointment_id": r[0],
            "doctor_id": r[1],
            "date": r[2],
            "time": r[3],
            "status": r[4]
        })

    return result
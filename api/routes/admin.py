from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from db.database import get_connection

router = APIRouter()

# DTOs
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

class Patient(BaseModel):
    patient_number: str
    patient_name: str
    contact: Optional[str] = None
    cnic: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None

class Doctor(BaseModel):
    doctor_id: str
    doctor_name: str
    specialization: str
    email: Optional[str] = None
    phone: Optional[str] = None
    available_days: Optional[str] = None

class Appointment(BaseModel):
    appointment_id: Optional[int] = None
    patient_number: str
    doctor_id: str
    appointment_date: str
    appointment_time: str
    status: str = 'scheduled'
    event_id: Optional[str] = None

# Admin Auth
@router.post("/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    if req.email == "admin@medicare.com" and req.password == "admin123":
        return {"access_token": "fake-jwt-token-for-demo", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Ensure fake token middleware locally is fine for now but not critical
def get_db():
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# --- Patients CRUD ---
@router.get("/patients", response_model=List[Patient])
def get_patients(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM patients")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/patients", response_model=Patient)
def create_patient(patient: Patient, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute(
            """INSERT INTO patients (patient_number, patient_name, contact, cnic, address, email, gender)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (patient.patient_number, patient.patient_name, patient.contact, patient.cnic, patient.address, patient.email, patient.gender)
        )
        db.commit()
        return patient
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Patient already exists")

@router.delete("/patients/{patient_number}")
def delete_patient(patient_number: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM patients WHERE patient_number = ?", (patient_number,))
    db.commit()
    return {"status": "deleted"}

# --- Doctors CRUD ---
@router.get("/doctors", response_model=List[Doctor])
def get_doctors(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM doctors")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/doctors", response_model=Doctor)
def create_doctor(doctor: Doctor, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute(
            """INSERT INTO doctors (doctor_id, doctor_name, specialization, email, phone, available_days)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (doctor.doctor_id, doctor.doctor_name, doctor.specialization, doctor.email, doctor.phone, doctor.available_days)
        )
        db.commit()
        return doctor
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Doctor already exists")

@router.delete("/doctors/{doctor_id}")
def delete_doctor(doctor_id: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM doctors WHERE doctor_id = ?", (doctor_id,))
    db.commit()
    return {"status": "deleted"}

# --- Appointments CRUD ---
@router.get("/appointments", response_model=List[dict])
def get_appointments(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    # join to get names
    cursor.execute('''
        SELECT a.*, p.patient_name, d.doctor_name 
        FROM appointments a
        JOIN patients p ON a.patient_number = p.patient_number
        JOIN doctors d ON a.doctor_id = d.doctor_id
    ''')
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM appointments WHERE appointment_id = ?", (appointment_id,))
    db.commit()
    return {"status": "deleted"}


# --- Analytics ---
@router.get("/analytics")
def get_analytics(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM patients")
    total_patients = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM doctors")
    total_doctors = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM appointments")
    total_appointments = cursor.fetchone()[0]
    
    cursor.execute("SELECT status, COUNT(*) FROM appointments GROUP BY status")
    status_distribution = {row[0]: row[1] for row in cursor.fetchall()}
    
    return {
        "metrics": [
            {"label": "Total Patients", "value": total_patients},
            {"label": "Total Doctors", "value": total_doctors},
            {"label": "Total Appointments", "value": total_appointments}
        ],
        "appointment_status_distribution": status_distribution
    }

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from db.database import get_connection
import jwt
import datetime
import hashlib
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.email import send_templated_email, send_email

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

SECRET_KEY = "medicare-super-secret-key-12345"
ALGORITHM = "HS256"

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Ensure fake token middleware locally is fine for now but not critical
def get_db():
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Admin Auth
@router.post("/auth/login", response_model=LoginResponse)
def login(req: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM admins WHERE email = ?", (req.email,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    admin = dict(row)
    hashed_pass = hashlib.sha256(req.password.encode()).hexdigest()
    if hashed_pass != admin["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(data={"sub": admin["email"], "name": admin["name"]})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Patients CRUD ---
@router.get("/patients", response_model=List[Patient])
def get_patients(db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM patients")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/patients", response_model=Patient)
def create_patient(patient: Patient, db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
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

@router.put("/patients/{patient_number}", response_model=Patient)
def update_patient(patient_number: str, patient: Patient, db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    cursor = db.cursor()
    cursor.execute(
        """UPDATE patients 
           SET patient_name=?, contact=?, cnic=?, address=?, email=?, gender=? 
           WHERE patient_number=?""",
        (patient.patient_name, patient.contact, patient.cnic, patient.address, patient.email, patient.gender, patient_number)
    )
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    if patient.email:
        send_email(patient.email, "Profile Updated", f"Hi {patient.patient_name},\n\nYour profile has been updated by the hospital administration.")
    return patient

@router.delete("/patients/{patient_number}")
def delete_patient(patient_number: str, db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM patients WHERE patient_number = ?", (patient_number,))
    db.commit()
    return {"status": "deleted"}

# --- Doctors CRUD ---
@router.get("/doctors", response_model=List[Doctor])
def get_doctors(db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM doctors")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/doctors", response_model=Doctor)
def create_doctor(doctor: Doctor, db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
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

@router.put("/doctors/{doctor_id}", response_model=Doctor)
def update_doctor(doctor_id: str, doctor: Doctor, db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    cursor = db.cursor()
    cursor.execute(
        """UPDATE doctors 
           SET doctor_name=?, specialization=?, email=?, phone=?, available_days=? 
           WHERE doctor_id=?""",
        (doctor.doctor_name, doctor.specialization, doctor.email, doctor.phone, doctor.available_days, doctor_id)
    )
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    if doctor.email:
        send_email(doctor.email, "Profile Updated", f"Hi Dr. {doctor.doctor_name},\n\nYour profile has been updated by the hospital administration.")
    return doctor

@router.delete("/doctors/{doctor_id}")
def delete_doctor(doctor_id: str, db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM doctors WHERE doctor_id = ?", (doctor_id,))
    db.commit()
    return {"status": "deleted"}

class AppointmentUpdate(BaseModel):
    doctor_id: Optional[str] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    status: Optional[str] = None

# --- Appointments CRUD ---
@router.get("/appointments", response_model=List[dict])
def get_appointments(db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
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

@router.put("/appointments/{appointment_id}")
def update_appointment(appointment_id: int, appt_update: AppointmentUpdate, db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    cursor = db.cursor()
    # Fetch existing
    cursor.execute('''
        SELECT a.*, p.patient_name, p.email as patient_email, d.doctor_name 
        FROM appointments a
        JOIN patients p ON a.patient_number = p.patient_number
        JOIN doctors d ON a.doctor_id = d.doctor_id
        WHERE a.appointment_id = ?
    ''', (appointment_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    existing = dict(row)
    
    new_doc = appt_update.doctor_id or existing['doctor_id']
    new_date = appt_update.appointment_date or existing['appointment_date']
    new_time = appt_update.appointment_time or existing['appointment_time']
    new_status = appt_update.status or existing['status']
    
    cursor.execute('''
        UPDATE appointments
        SET doctor_id = ?, appointment_date = ?, appointment_time = ?, status = ?
        WHERE appointment_id = ?
    ''', (new_doc, new_date, new_time, new_status, appointment_id))
    db.commit()
    
    if existing['patient_email']:
        if existing['status'] != 'cancelled' and new_status == 'cancelled':
            send_templated_email(
                existing['patient_email'],
                "Appointment Cancelled",
                "appointment_cancelled.html",
                {
                    "patient_name": existing['patient_name'],
                    "doctor_name": existing['doctor_name'],
                    "date": existing['appointment_date'],
                    "time": existing['appointment_time'],
                    "appointment_id": appointment_id
                }
            )
        elif existing['appointment_date'] != new_date or existing['appointment_time'] != new_time:
            send_templated_email(
                existing['patient_email'],
                "Appointment Rescheduled",
                "appointment_rescheduled.html",
                {
                    "patient_name": existing['patient_name'],
                    "doctor_name": existing['doctor_name'], # Note: simplified if doc changes
                    "new_date": new_date,
                    "new_time": new_time,
                    "date": new_date,
                    "time": new_time,
                    "appointment_id": appointment_id
                }
            )
            
    return {"status": "updated"}

@router.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM appointments WHERE appointment_id = ?", (appointment_id,))
    db.commit()
    return {"status": "deleted"}


# --- Analytics ---
@router.get("/analytics")
def get_analytics(db: sqlite3.Connection = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
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

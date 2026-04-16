from db.database import get_connection
import random


def seed_data():
    conn = get_connection()
    cursor = conn.cursor()

    # =========================
    # DOCTORS (20)
    # =========================
    specializations = [
        "Cardiologist", "Dermatologist", "Neurologist", "Gynecologist",
        "Orthopedic", "Pediatrician", "ENT Specialist", "Psychiatrist",
        "General Physician", "Radiologist"
    ]

    doctors = []

    for i in range(1, 21):
        doctors.append((
            f"D{i:03d}",
            f"Dr. Doctor {i}",
            random.choice(specializations),
            f"doctor{i}@hospital.com",
            f"0300{i:07d}"[:11],
            "Mon-Fri"
        ))

    cursor.executemany("""
        INSERT OR IGNORE INTO doctors (
            doctor_id, doctor_name, specialization, email, phone, available_days
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, doctors)

    # =========================
    # PATIENTS (20)
    # =========================
    patients = []

    for i in range(1, 21):
        patients.append((
            f"P{i:03d}",
            f"Patient {i}",
            f"0310{i:07d}"[:11],
            f"12345-12345{i:02d}-1",
            f"City {i}",
            f"patient{i}@mail.com",
            "Male" if i % 2 == 0 else "Female"
        ))

    cursor.executemany("""
        INSERT OR IGNORE INTO patients (
            patient_number, patient_name, contact, cnic, address, email, gender
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, patients)

    # =========================
    # APPOINTMENTS (20)
    # =========================
    appointments = []

    for i in range(1, 21):
        appointments.append((
            f"P{i:03d}",  # patient
            f"D{random.randint(1,20):03d}",  # random doctor
            f"2026-05-{(i % 28) + 1:02d}",  # date
            f"{9 + (i % 8)}:00",  # time between 9–16
            "scheduled"
        ))

    cursor.executemany("""
        INSERT OR IGNORE INTO appointments (
            patient_number, doctor_id, appointment_date, appointment_time, status
        )
        VALUES (?, ?, ?, ?, ?)
    """, appointments)

    conn.commit()
    conn.close()

    print("20 Patients, 20 Doctors, 20 Appointments inserted!")


if __name__ == "__main__":
    seed_data()
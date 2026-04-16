from db.database import get_connection

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("PRAGMA foreign_keys = ON")

    # PATIENT TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            patient_number TEXT PRIMARY KEY,
            patient_name TEXT NOT NULL,
            contact TEXT,
            cnic TEXT UNIQUE,
            address TEXT,
            email TEXT,
            gender TEXT
        )
    """)

    # DOCTOR TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS doctors (
            doctor_id TEXT PRIMARY KEY,
            doctor_name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            available_days TEXT
        )
    """)

    # APPOINTMENT TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_number TEXT NOT NULL,
            doctor_id TEXT NOT NULL,
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            status TEXT DEFAULT 'scheduled',
            FOREIGN KEY (patient_number) REFERENCES patients(patient_number),
            FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
        )
    """)

    conn.commit()
    conn.close()
from db.database import get_connection
import random


def seed_data():
    conn = get_connection()
    cursor = conn.cursor()

    # =========================
    # PATIENTS (20 RECORDS)
    # =========================
    patients = [
        ("P001", "Ali Ahmed", "03001234561", "12345-1234567-1", "Lahore", "ali1@gmail.com", "Male"),
        ("P002", "Sara Khan", "03001234562", "12345-1234567-2", "Karachi", "sara2@gmail.com", "Female"),
        ("P003", "Usman Tariq", "03001234563", "12345-1234567-3", "Islamabad", "usman3@gmail.com", "Male"),
        ("P004", "Ayesha Malik", "03001234564", "12345-1234567-4", "Lahore", "ayesha4@gmail.com", "Female"),
        ("P005", "Hassan Raza", "03001234565", "12345-1234567-5", "Faisalabad", "hassan5@gmail.com", "Male"),
        ("P006", "Fatima Noor", "03001234566", "12345-1234567-6", "Multan", "fatima6@gmail.com", "Female"),
        ("P007", "Bilal Ahmed", "03001234567", "12345-1234567-7", "Rawalpindi", "bilal7@gmail.com", "Male"),
        ("P008", "Zainab Ali", "03001234568", "12345-1234567-8", "Karachi", "zainab8@gmail.com", "Female"),
        ("P009", "Omar Farooq", "03001234569", "12345-1234567-9", "Lahore", "omar9@gmail.com", "Male"),
        ("P010", "Mariam Aslam", "03001234570", "12345-1234567-0", "Islamabad", "mariam10@gmail.com", "Female"),
        ("P011", "Saad Hassan", "03001234571", "12345-1234568-1", "Sialkot", "saad11@gmail.com", "Male"),
        ("P012", "Amina Shah", "03001234572", "12345-1234568-2", "Lahore", "amina12@gmail.com", "Female"),
        ("P013", "Hamza Ali", "03001234573", "12345-1234568-3", "Karachi", "hamza13@gmail.com", "Male"),
        ("P014", "Noor Fatima", "03001234574", "12345-1234568-4", "Multan", "noor14@gmail.com", "Female"),
        ("P015", "Usman Ghani", "03001234575", "12345-1234568-5", "Lahore", "usman15@gmail.com", "Male"),
        ("P016", "Hira Khan", "03001234576", "12345-1234568-6", "Islamabad", "hira16@gmail.com", "Female"),
        ("P017", "Abdullah Khan", "03001234577", "12345-1234568-7", "Rawalpindi", "abdullah17@gmail.com", "Male"),
        ("P018", "Sana Javed", "03001234578", "12345-1234568-8", "Karachi", "sana18@gmail.com", "Female"),
        ("P019", "Zeeshan Ali", "03001234579", "12345-1234568-9", "Lahore", "zeeshan19@gmail.com", "Male"),
        ("P020", "Iqra Noor", "03001234580", "12345-1234569-0", "Faisalabad", "iqra20@gmail.com", "Female"),
    ]

    cursor.executemany("""
        INSERT INTO patients 
        (patient_number, patient_name, contact, cnic, address, email, gender)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, patients)

    # =========================
    # DOCTORS (10 RECORDS)
    # =========================
    doctors = [
        ("D001", "Dr Ahmed", "Cardiologist", "dr.ahmed@hospital.com", "03001111111", "Monday,Wednesday,Friday"),
        ("D002", "Dr Ayesha", "Dermatologist", "dr.ayesha@hospital.com", "03002222222", "Tuesday,Thursday"),
        ("D003", "Dr Usman", "Neurologist", "dr.usman@hospital.com", "03003333333", "Monday,Thursday"),
        ("D004", "Dr Sara", "Gynecologist", "dr.sara@hospital.com", "03004444444", "Tuesday,Friday"),
        ("D005", "Dr Bilal", "Orthopedic", "dr.bilal@hospital.com", "03005555555", "Monday,Wednesday"),
        ("D006", "Dr Fatima", "Pediatrician", "dr.fatima@hospital.com", "03006666666", "Wednesday,Friday"),
        ("D007", "Dr Hassan", "ENT Specialist", "dr.hassan@hospital.com", "03007777777", "Tuesday,Thursday"),
        ("D008", "Dr Amina", "General Physician", "dr.amina@hospital.com", "03008888888", "Monday,Tuesday,Friday"),
        ("D009", "Dr Omar", "Psychiatrist", "dr.omar@hospital.com", "03009999999", "Wednesday,Thursday"),
        ("D010", "Dr Hira", "Radiologist", "dr.hira@hospital.com", "03001010101", "Monday,Friday"),
    ]

    cursor.executemany("""
        INSERT INTO doctors 
        (doctor_id, doctor_name, specialization, email, phone, available_days)
        VALUES (?, ?, ?, ?, ?, ?)
    """, doctors)

    # =========================
    # APPOINTMENTS (EMPTY INITIALLY)
    # =========================
    cursor.execute("""
        INSERT INTO appointments 
        (patient_number, doctor_id, appointment_date, appointment_time, status)
        VALUES (?, ?, ?, ?, ?)
    """, ("P001", "D001", "2026-04-20", "10:00", "scheduled"))

    conn.commit()
    conn.close()

    print("Database seeded successfully!")


if __name__ == "__main__":
    seed_data()
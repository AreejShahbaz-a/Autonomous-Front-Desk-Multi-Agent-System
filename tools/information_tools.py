from agents import function_tool
from db.database import get_connection
from pathlib import Path
from pypdf import PdfReader


# LOAD PDF CONTENT
pdf_path = Path("rag/hospital_info.pdf")

reader = PdfReader(pdf_path)

HOSPITAL_TEXT = ""

for page in reader.pages:
    HOSPITAL_TEXT += page.extract_text() + "\n"


# RAG TOOL
@function_tool
def retrieve_hospital_info(query: str) -> str:
    """
    Retrieves hospital information from PDF content.
    """

    return HOSPITAL_TEXT

# DOCTOR TOOL
@function_tool
def get_all_doctors() -> str:
    """
    Fetch all doctors with specialization and availability.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT doctor_name, specialization, available_days
        FROM doctors
    """)

    results = cursor.fetchall()
    conn.close()

    if not results:
        return "No doctors found."

    response = []
    for row in results:
        response.append(
            f"{row['doctor_name']} - {row['specialization']} (Available: {row['available_days']})"
        )

    return "\n".join(response)
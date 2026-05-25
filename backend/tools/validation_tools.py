import re
from agents import function_tool

# CNIC VALIDATION TOOL
@function_tool
def validate_cnic(cnic: str):
    """
    Validates Pakistani CNIC format:
    xxxxx-xxxxxxx-x
    """

    pattern = r"^\d{5}-\d{7}-\d{1}$"

    if re.match(pattern, cnic):
        return {
            "status": "valid",
            "message": "CNIC format is valid"
        }

    return {
        "status": "invalid",
        "message": "CNIC must be in format xxxxx-xxxxxxx-x"
    }


# EMAIL VALIDATION TOOL
@function_tool
def validate_email(email: str):
    """
    Validates email format
    """

    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if re.match(pattern, email):
        return {
            "status": "valid",
            "message": "Email format is valid"
        }

    return {
        "status": "invalid",
        "message": "Invalid email format"
    }


# PHONE VALIDATION TOOL
@function_tool
def validate_phone(phone: str):
    """
    Validates Pakistani phone numbers:
    - +92XXXXXXXXXX
    - 03XXXXXXXXX
    """

    phone = phone.strip().replace(" ", "")

    pattern = r"^(?:\+92\d{10}|03\d{9})$"

    if re.match(pattern, phone):
        return {
            "status": "valid",
            "message": "Phone number is valid"
        }

    return {
        "status": "invalid",
        "message": "Phone must be +92XXXXXXXXXX or 03XXXXXXXXX"
    }
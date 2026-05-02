#!/usr/bin/env python3
"""Simple test script to send a plain or templated email.

Examples:
  python scripts/send_test_email.py recipient@example.com
  python scripts/send_test_email.py recipient@example.com --template welcome
  python scripts/send_test_email.py recipient@example.com --template appointment_confirmed
"""
from dotenv import load_dotenv
load_dotenv()

import sys
from pathlib import Path

# Ensure repo root is on sys.path so `config` and `utils` can be imported
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import argparse
from config import settings
from utils.email import send_email, send_templated_email


def main():
    parser = argparse.ArgumentParser(description="Send a test email via configured SMTP")
    parser.add_argument("to", help="Recipient email address")
    parser.add_argument("--template", help="Template name (welcome, appointment_confirmed, appointment_rescheduled, appointment_cancelled)")
    parser.add_argument("--subject", help="Override email subject")
    args = parser.parse_args()

    to = args.to

    if args.template:
        tpl_name = f"{args.template}.html"
        subject = args.subject or f"Test - {args.template.replace('_', ' ').title()}"
        # Provide reasonable example context used by templates
        context = {
            "patient_name": "Test User",
            "patient_number": "P999",
            "doctor_name": "Dr. Demo",
            "date": "2026-04-21",
            "time": "09:00",
            "appointment_id": "EVT-TEST-123",
            "new_date": "2026-04-22",
            "new_time": "10:00",
            "plain": subject
        }
        ok = send_templated_email(to, subject, tpl_name, context)
    else:
        subject = args.subject or "Test email from Front Desk"
        body = "This is a plain text test email from the front-desk application."
        ok = send_email(to, subject, body)

    print("OK" if ok else "FAILED")


if __name__ == "__main__":
    main()

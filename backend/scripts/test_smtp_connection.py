#!/usr/bin/env python3
"""Diagnose SMTP connection and login using config/settings environment variables.
Run after filling .env to see detailed error output.
"""
from dotenv import load_dotenv
load_dotenv()

import sys
from pathlib import Path
import traceback

# Ensure repo root is importable
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import smtplib
from config import settings


def main():
    print("SMTP settings (sensitive values hidden):")
    print(f"HOST={settings.EMAIL_HOST}")
    print(f"PORT={settings.EMAIL_PORT}")
    print(f"USER={'set' if settings.EMAIL_HOST_USER else 'NOT SET'}")
    print(f"USE_TLS={settings.EMAIL_USE_TLS}")

    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print("ERROR: EMAIL_HOST_USER or EMAIL_HOST_PASSWORD is not set in environment (.env).")
        return

    try:
        print("Connecting to SMTP server...")
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=20)
        server.set_debuglevel(1)
        if settings.EMAIL_USE_TLS:
            print("Starting TLS...")
            server.starttls()
        print("Logging in...")
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        print("Login successful — SMTP connection OK.")
        server.quit()
    except Exception:
        print("SMTP connection/login failed. Exception traceback:")
        traceback.print_exc()


if __name__ == '__main__':
    main()

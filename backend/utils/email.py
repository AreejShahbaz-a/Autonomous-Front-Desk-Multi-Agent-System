import smtplib
from email.message import EmailMessage
from typing import Optional
from config import settings
from pathlib import Path
import os


def send_email(to_email: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    """
    Send an email using SMTP settings from config.settings.
    Returns True on success, False on failure.
    """
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        return False

    msg = EmailMessage()
    msg["From"] = settings.EMAIL_FROM or settings.EMAIL_HOST_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    if html:
        msg.add_alternative(html, subtype="html")

    try:
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=20)
        if settings.EMAIL_USE_TLS:
            server.starttls()
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception:
        return False


def render_template(template_name: str, **context) -> str:
    """Load an HTML template from utils/email_templates and format it with context."""
    base = Path(__file__).resolve().parent / "email_templates"
    tpl_path = base / template_name
    if not tpl_path.exists():
        return ""
    content = tpl_path.read_text(encoding="utf-8")
    try:
        return content.format(**context)
    except Exception as e:
        print(f"Error rendering template: {e}")
        return content


def send_templated_email(to_email: str, subject: str, template_name: str, context: dict) -> bool:
    """Render template and send as HTML (with a plaintext fallback)."""
    html = render_template(template_name, **context)
    # Plain text fallback: strip tags simply for safety (very small fallback)
    plain = context.get("plain", subject)
    return send_email(to_email, subject, plain, html)

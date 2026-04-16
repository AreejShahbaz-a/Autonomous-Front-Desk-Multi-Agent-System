import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar']

SERVICE_ACCOUNT_FILE = 'gen-lang-client-0509919519-61db2146b864.json'


def get_calendar_service():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )

    service = build('calendar', 'v3', credentials=credentials)
    return service

def create_event(summary, description, start_time, end_time):
    service = get_calendar_service()

    event = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': start_time,
            'timeZone': 'Asia/Karachi',
        },
        'end': {
            'dateTime': end_time,
            'timeZone': 'Asia/Karachi',
        },
    }

    event = service.events().insert(
        calendarId='primary',
        body=event
    ).execute()

    return event.get('htmlLink')
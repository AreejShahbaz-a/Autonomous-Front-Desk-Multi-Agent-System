import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/calendar']

SERVICE_ACCOUNT_FILE = 'gen-lang-client-0509919519-61db2146b864.json'

calendar_id = '72d30452035a9c7c731328a42530e4272b088a79d8a59c3072006c0f86241385@group.calendar.google.com'


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
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': end_time,
            'timeZone': 'UTC',
        },
    }

    event = service.events().insert(
        calendarId= calendar_id,
        body=event
    ).execute()

    return {
        "event_id": event.get("id"),
        "htmlLink": event.get("htmlLink")
    }

def delete_event(event_id: str):
    """
    Deletes an event from Google Calendar using event_id.
    Returns True if successful, False otherwise.
    """

    try:
        service = get_calendar_service()

        service.events().delete(
            calendarId= calendar_id,
            eventId=event_id
        ).execute()

        return True

    except Exception as e:
        print("Error deleting event:", str(e))
        return False 
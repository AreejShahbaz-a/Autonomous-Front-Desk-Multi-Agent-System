from agents import SQLiteSession

def get_session(session_id: str):
    """
    Returns a reusable SQLite session for a user/conversation.
    """
    return SQLiteSession(session_id)
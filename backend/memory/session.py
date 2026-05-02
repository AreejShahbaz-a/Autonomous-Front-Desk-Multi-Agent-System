from agents import SQLiteSession

_sessions = {}

def get_session(session_id: str):
    """
    Returns a reusable SQLite session for a user/conversation.
    """
    if session_id not in _sessions:
        _sessions[session_id] = SQLiteSession(session_id)
    return _sessions[session_id]
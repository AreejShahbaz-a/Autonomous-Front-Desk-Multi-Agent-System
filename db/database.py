import sqlite3
from pathlib import Path

DB_PATH = Path("data/hospital.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row  # enables column-name access
    return conn
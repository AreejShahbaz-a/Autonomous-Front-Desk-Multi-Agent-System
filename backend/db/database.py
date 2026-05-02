import sqlite3
from pathlib import Path

# Place the database in the repository's top-level `data/` directory
BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "data" / "hospital.db"


def get_connection():
    # Ensure the parent directory exists so SQLite can create the file
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row  # enables column-name access
    return conn
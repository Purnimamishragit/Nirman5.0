import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "database" / "hospital.db"
SCHEMA_PATH = BASE_DIR / "database" / "schema.sql"
SEED_PATH = BASE_DIR / "database" / "seed.sql"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# Backwards-compatible names
def get_db_connection():
    return get_connection()


def dict_from_row(row):
    return dict(row)


def init_database():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = get_connection()
    cur = conn.cursor()

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        cur.executescript(f.read())

    if SEED_PATH.exists():
        with open(SEED_PATH, "r", encoding="utf-8") as f:
            cur.executescript(f.read())

    conn.commit()
    conn.close()

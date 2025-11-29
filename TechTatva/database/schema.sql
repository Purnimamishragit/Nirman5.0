-- HRRTS Database Schema
-- SQLite Database Structure

CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    specialities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER NOT NULL,
    beds_available INTEGER DEFAULT 0,
    icu_available INTEGER DEFAULT 0,
    oxygen_cylinders INTEGER DEFAULT 0,
    blood_units INTEGER DEFAULT 0,
    doctors_available INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users_to_notify (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    hospital_id INTEGER NOT NULL,
    resource_type TEXT NOT NULL,
    threshold INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hospital_id ON resources(hospital_id);
CREATE INDEX IF NOT EXISTS idx_notify_hospital ON users_to_notify(hospital_id);
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
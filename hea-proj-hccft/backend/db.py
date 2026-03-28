import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(__file__), '..', 'database', 'hea.db')

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # Beds table
    c.execute('''CREATE TABLE IF NOT EXISTS beds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bed_number TEXT NOT NULL UNIQUE,
        ward TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        patient_id INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # Patients table
    c.execute('''CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        condition TEXT,
        priority TEXT DEFAULT 'normal',
        ward TEXT,
        bed_number TEXT,
        admitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        discharged_at TIMESTAMP,
        bed_id INTEGER
    )''')

    # Resources table (ventilators, OT rooms, etc.)
    c.execute('''CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        total INTEGER DEFAULT 0,
        available INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # Audit log table
    c.execute('''CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        details TEXT,
        performed_by TEXT DEFAULT 'system',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # Staff table
    c.execute('''CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        ward TEXT,
        shift TEXT,
        on_duty INTEGER DEFAULT 1
    )''')

    # Nearby Hospitals table
    c.execute('''CREATE TABLE IF NOT EXISTS nearby_hospitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        distance_km REAL,
        latitude REAL,
        longitude REAL,
        phone TEXT,
        type TEXT,
        rating REAL,
        total_beds INTEGER DEFAULT 0,
        available_beds INTEGER DEFAULT 0,
        icu_total INTEGER DEFAULT 0,
        icu_available INTEGER DEFAULT 0,
        emergency_total INTEGER DEFAULT 0,
        emergency_available INTEGER DEFAULT 0,
        general_total INTEGER DEFAULT 0,
        general_available INTEGER DEFAULT 0,
        has_ambulance INTEGER DEFAULT 0,
        is_open_24h INTEGER DEFAULT 0,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    conn.commit()

    # Seed initial data if empty
    _seed_data(conn)
    conn.close()

def _seed_data(conn):
    c = conn.cursor()

    # Seed beds (only if empty)
    c.execute("SELECT COUNT(*) FROM beds")
    if c.fetchone()[0] == 0:
        wards = [
            ("General", "general", 20),
            ("ICU", "icu", 8),
            ("Emergency", "emergency", 10),
            ("Pediatric", "pediatric", 12),
            ("Maternity", "maternity", 8),
        ]
        for ward_name, ward_code, count in wards:
            for i in range(1, count + 1):
                bed_num = f"{ward_code.upper()}-{i:03d}"
                # Make some occupied for demo
                status = "occupied" if i % 3 == 0 else "available"
                c.execute(
                    "INSERT INTO beds (bed_number, ward, type, status) VALUES (?, ?, ?, ?)",
                    (bed_num, ward_name, ward_code, status)
                )

    # Seed resources
    c.execute("SELECT COUNT(*) FROM resources")
    if c.fetchone()[0] == 0:
        resources = [
            ("Ventilators", "equipment", 20, 14),
            ("OT Rooms", "facility", 6, 4),
            ("ICU Monitors", "equipment", 15, 9),
            ("Wheelchairs", "equipment", 30, 22),
            ("Oxygen Cylinders", "supply", 50, 38),
        ]
        for name, cat, total, avail in resources:
            c.execute(
                "INSERT INTO resources (name, category, total, available) VALUES (?, ?, ?, ?)",
                (name, cat, total, avail)
            )

    # Seed staff
    c.execute("SELECT COUNT(*) FROM staff")
    if c.fetchone()[0] == 0:
        staff = [
            ("Dr. Priya Sharma", "Doctor", "ICU", "Morning"),
            ("Dr. Rahul Verma", "Doctor", "Emergency", "Morning"),
            ("Nurse Meena Rao", "Nurse", "General", "Morning"),
            ("Nurse Suresh Kumar", "Nurse", "ICU", "Night"),
            ("Dr. Anjali Singh", "Doctor", "Pediatric", "Afternoon"),
        ]
        for name, role, ward, shift in staff:
            c.execute(
                "INSERT INTO staff (name, role, ward, shift) VALUES (?, ?, ?, ?)",
                (name, role, ward, shift)
            )

    # Seed nearby hospitals
    c.execute("SELECT COUNT(*) FROM nearby_hospitals")
    if c.fetchone()[0] == 0:
        nearby = [
            ("Apollo Hospital",        "MG Road, Sector 15",       1.2, 28.5414, 77.2942, "+91 98765 43210", "Multi-Specialty", 4.7, 200, 142, 30, 18, 25, 16, 100, 78, 1, 1),
            ("Fortis Medical Centre",  "NH-48, Gurugram",          2.8, 28.4552, 77.0706, "+91 98765 43211", "Super-Specialty", 4.5, 350, 210, 50, 32, 40, 28, 180, 120, 1, 1),
            ("Max Super Speciality",   "Saket, New Delhi",         4.5, 28.5284, 77.2188, "+91 98765 43212", "Super-Specialty", 4.8, 500, 315, 80, 52, 60, 38, 250, 165, 1, 1),
            ("Medanta Hospital",       "CH Baktawar Singh Rd",     6.1, 28.4367, 77.0396, "+91 98765 43213", "Multi-Specialty", 4.6, 450, 280, 70, 45, 50, 30, 220, 145, 1, 1),
            ("AIIMS Trauma Centre",    "Ring Road, New Delhi",     8.3, 28.5672, 77.2100, "+91 98765 43214", "Government",      4.9, 800, 420, 120, 65, 100, 55, 400, 210, 1, 1),
            ("Safdarjung Hospital",    "Ansari Nagar, New Delhi",  9.7, 28.5658, 77.2081, "+91 98765 43215", "Government",      4.3, 600, 340, 90, 48, 70, 42, 300, 180, 1, 1),
            ("BLK-Max Hospital",       "Pusa Road, New Delhi",     5.4, 28.6433, 77.1857, "+91 98765 43216", "Multi-Specialty", 4.4, 300, 185, 45, 28, 35, 22, 150, 95, 1, 1),
            ("Sir Ganga Ram Hospital", "Rajinder Nagar, Delhi",    7.2, 28.6385, 77.1895, "+91 98765 43217", "Multi-Specialty", 4.6, 400, 250, 60, 38, 45, 30, 200, 132, 1, 1),
        ]
        for h in nearby:
            c.execute(
                """INSERT INTO nearby_hospitals 
                (name, address, distance_km, latitude, longitude, phone, type, rating, 
                 total_beds, available_beds, icu_total, icu_available, 
                 emergency_total, emergency_available, general_total, general_available,
                 has_ambulance, is_open_24h)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                h
            )

    # Seed patients (only if empty)
    c.execute("SELECT COUNT(*) FROM patients")
    if c.fetchone()[0] == 0:
        pts = [
            ("Aarav Mehta", 45, "Male", "Cardiac Arrest", "critical", "ICU"),
            ("Sanya Kapoor", 28, "Female", "Post-Op Recovery", "normal", "General"),
            ("Ishaan Goyal", 62, "Male", "Severe Pneumonia", "urgent", "Emergency"),
            ("Kiara Advani", 34, "Female", "Early Labor", "normal", "Maternity"),
            ("Rohan Joshi", 12, "Male", "Asthmatic Attack", "urgent", "Pediatric")
        ]
        for name, age, gender, cond, prio, ward in pts:
            # Get an available bed in that ward
            bed = c.execute("SELECT id, bed_number FROM beds WHERE ward = ? AND status = 'available' LIMIT 1", (ward,)).fetchone()
            if bed:
                # Insert patient
                c.execute("INSERT INTO patients (name, age, gender, condition, priority, ward, bed_number) VALUES (?,?,?,?,?,?,?)",
                          (name, age, gender, cond, prio, ward, bed['bed_number']))
                pid = c.lastrowid
                # Occupy bed
                c.execute("UPDATE beds SET status = 'occupied', patient_id = ? WHERE id = ?", (pid, bed['id']))

    conn.commit()

from backend.database import get_db_connection, dict_from_row


class Hospital:
    @staticmethod
    def get_all_with_resources():
        conn = get_db_connection()
        cur = conn.cursor()

        rows = cur.execute(
            """
            SELECT h.id,
                   h.name,
                   h.address,
                   h.latitude,
                   h.longitude,
                   h.phone,
                   h.specialities,

                   r.beds_available,
                   r.icu_available AS icu_beds_available,
                   r.oxygen_cylinders AS ventilators_available,
                   r.blood_units,
                   r.doctors_available,
                   r.last_updated

            FROM hospitals h
            LEFT JOIN resources r ON h.id = r.hospital_id
            ORDER BY h.name
            """
        ).fetchall()

        conn.close()
        return [dict_from_row(row) for row in rows]

    @staticmethod
    def search(query: str):
        conn = get_db_connection()
        cur = conn.cursor()
        like = f"%{query}%"

        rows = cur.execute(
            """
            SELECT h.id,
                   h.name,
                   h.address,
                   h.latitude,
                   h.longitude,
                   h.phone,
                   h.specialities,

                   r.beds_available,
                   r.icu_available AS icu_beds_available,
                   r.oxygen_cylinders AS ventilators_available,
                   r.blood_units,
                   r.doctors_available,
                   r.last_updated

            FROM hospitals h
            LEFT JOIN resources r ON h.id = r.hospital_id
            WHERE h.name LIKE ?
               OR h.address LIKE ?
               OR h.phone LIKE ?
               OR h.specialities LIKE ?
            ORDER BY h.name
            """,
            (like, like, like, like),
        ).fetchall()

        conn.close()
        return [dict_from_row(row) for row in rows]

    @staticmethod
    def get_by_id(hospital_id: int):
        conn = get_db_connection()
        cur = conn.cursor()

        row = cur.execute(
            """
            SELECT h.id,
                   h.name,
                   h.address,
                   h.latitude,
                   h.longitude,
                   h.phone,
                   h.specialities,

                   r.beds_available,
                   r.icu_available AS icu_beds_available,
                   r.oxygen_cylinders AS ventilators_available,
                   r.blood_units,
                   r.doctors_available,
                   r.last_updated

            FROM hospitals h
            LEFT JOIN resources r ON h.id = r.hospital_id
            WHERE h.id = ?
            """,
            (hospital_id,),
        ).fetchone()

        conn.close()
        return dict_from_row(row) if row else None

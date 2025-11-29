from backend.database import get_db_connection, dict_from_row


class Resource:
    @staticmethod
    def get_by_hospital(hospital_id: int):
        conn = get_db_connection()
        cur = conn.cursor()

        row = cur.execute(
            """
            SELECT id,
                   hospital_id,
                   beds_available,
                   icu_beds_available,
                   ventilators_available,
                   last_updated
            FROM resources
            WHERE hospital_id = ?
            """,
            (hospital_id,),
        ).fetchone()

        conn.close()
        return dict_from_row(row) if row else None

    @staticmethod
    def update_resources(hospital_id: int, beds: int, icu_beds: int, ventilators: int):
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO resources (hospital_id, beds_available, icu_beds_available, ventilators_available)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(hospital_id) DO UPDATE SET
                beds_available = excluded.beds_available,
                icu_beds_available = excluded.icu_beds_available,
                ventilators_available = excluded.ventilators_available,
                last_updated = CURRENT_TIMESTAMP
            """,
            (hospital_id, beds, icu_beds, ventilators),
        )

        conn.commit()
        conn.close()

import bcrypt
from backend.database import get_db_connection, dict_from_row

class Auth:
    @staticmethod
    def hash_password(password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def verify_password(password, password_hash):
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    @staticmethod
    def authenticate_admin(username, password):
        conn = get_db_connection()
        cursor = conn.execute('SELECT * FROM admin_users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()
        
        if user and Auth.verify_password(password, user['password_hash']):
            return dict_from_row(user)
        return None
    
    @staticmethod
    def get_admin_by_id(admin_id):
        conn = get_db_connection()
        cursor = conn.execute('SELECT * FROM admin_users WHERE id = ?', (admin_id,))
        user = cursor.fetchone()
        conn.close()
        return dict_from_row(user) if user else None
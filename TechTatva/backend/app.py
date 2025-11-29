import os
import sys
from pathlib import Path

# Add project root (TechTatva) to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from database import init_database
from routes.hospitals import hospitals_bp
from routes.admin import admin_bp
from routes.alerts import alerts_bp
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = os.urandom(24)

CORS(

    app,

    supports_credentials=True,

    origins=[

        "http://localhost:3000",

        "http://127.0.0.1:3000",

    ],

)

app.register_blueprint(hospitals_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(alerts_bp)


@app.route("/")
def index():
    return {
        "success": True,
        "message": "Hospital Resource Real-Time System API",
        "version": "1.0",
        "endpoints": {
            "public": [
                "GET /api/hospitals",
                "GET /api/hospital/<id>",
                "POST /api/notify",
            ],
            "admin": [
                "POST /api/admin/login",
                "POST /api/admin/logout",
                "POST /api/admin/update",
                "GET /api/admin/status",
            ],
        },
    }


@app.route("/health")
def health():
    return {"status": "healthy"}, 200


if __name__ == "__main__":
    print("🔄 Initializing database...")
    init_database()

    print("🚀 Starting HRRTS Backend Server...")
    print("📡 API available at: http://127.0.0.1:5000")

    app.run(debug=True, host="0.0.0.0", port=5000)

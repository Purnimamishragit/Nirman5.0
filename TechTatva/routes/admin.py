from flask import Blueprint, jsonify, request
from models.hospital_model import Hospital
from models.resource_model import Resource

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/api/admin/status", methods=["GET"])
def admin_status():
    return jsonify({"success": True, "message": "Admin API is running"}), 200


@admin_bp.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    # Placeholder login – replace with DB check if needed
    if username == "admin" and password == "admin":
        return jsonify({"success": True, "message": "Login successful"}), 200

    return jsonify({"success": False, "error": "Invalid credentials"}), 401


@admin_bp.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    return jsonify({"success": True, "message": "Logout successful"}), 200


@admin_bp.route("/api/admin/update", methods=["POST"])
def admin_update():
    data = request.get_json() or {}
    hospital_id = data.get("hospital_id")
    resources = data.get("resources", {})

    if not hospital_id:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "hospital_id is required",
                }
            ),
            400,
        )

    # Example usage of Resource model if you want:
    beds = int(resources.get("beds_available", 0))
    icu_beds = int(resources.get("icu_beds_available", 0))
    ventilators = int(resources.get("ventilators_available", 0))

    Resource.update_resources(hospital_id, beds, icu_beds, ventilators)

    return (
        jsonify(
            {
                "success": True,
                "message": "Resources updated",
                "hospital_id": hospital_id,
            }
        ),
        200,
    )

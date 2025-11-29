from flask import Blueprint, jsonify, request
from utils.emailer import Emailer

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("/api/notify", methods=["POST"])
def send_alert():
    data = request.get_json() or {}
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")

    if not email or not subject or not message:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "email, subject and message are required",
                }
            ),
            400,
        )

    try:
        # Adjust method/params if your Emailer is different
        Emailer.send_email(to=email, subject=subject, body=message)
        return jsonify({"success": True, "message": "Notification sent"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

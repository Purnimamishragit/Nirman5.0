from flask import Blueprint, jsonify, request
from models.hospital_model import Hospital
from models.resource_model import Resource

hospitals_bp = Blueprint("hospitals", __name__)


@hospitals_bp.route("/api/hospitals", methods=["GET"])
def get_hospitals():
    try:
        search_query = request.args.get("search", "")

        if search_query:
            hospitals = Hospital.search(search_query)
        else:
            hospitals = Hospital.get_all_with_resources()

        return (
            jsonify(
                {
                    "success": True,
                    "data": hospitals,
                    "count": len(hospitals),
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@hospitals_bp.route("/api/hospital/<int:hospital_id>", methods=["GET"])
def get_hospital(hospital_id):
    try:
        hospital = Hospital.get_by_id(hospital_id)

        if not hospital:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Hospital not found",
                    }
                ),
                404,
            )

        return jsonify({"success": True, "data": hospital}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

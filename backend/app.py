"""
Customer Churn Prediction - Flask Backend
AI Provider : Groq (llama-3.3-70b-versatile) — fast, free, JSON-mode
ML Model    : RandomForestClassifier (50 one-hot encoded features)

Routes:
  GET  /              → health check
  GET  /test-ai       → verify Groq connectivity
  POST /chat          → Groq NLP extraction (returns structured JSON)
  POST /predict       → RandomForest prediction
  POST /explain       → Groq business explanation
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# ─── Load .env ───────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# ─── App setup ───────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ─── Groq client setup ───────────────────────────────────────────────────────
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_AVAILABLE = False
groq_client    = None

# Model for extraction (accurate, great JSON adherence)
GROQ_CHAT_MODEL    = "llama-3.3-70b-versatile"
# Model for explanation (fast, lower cost)
GROQ_EXPLAIN_MODEL = "llama3-8b-8192"

try:
    if GROQ_API_KEY:
        groq_client    = Groq(api_key=GROQ_API_KEY)
        GROQ_AVAILABLE = True
        print("[INFO] Groq client initialised successfully.")
    else:
        print("[WARN] GROQ_API_KEY not set. Add it to backend/.env")
except Exception as e:
    print(f"[WARN] Groq init failed: {e}")

# ─── Load ML model ───────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

print("[INFO] RandomForest model loaded.")

# ─── Feature columns (exact training order — 50 features) ────────────────────
FEATURE_COLUMNS = [
    "SeniorCitizen", "MonthlyCharges", "TotalCharges",
    "gender_Female", "gender_Male",
    "Partner_No", "Partner_Yes",
    "Dependents_No", "Dependents_Yes",
    "PhoneService_No", "PhoneService_Yes",
    "MultipleLines_No", "MultipleLines_No phone service", "MultipleLines_Yes",
    "InternetService_DSL", "InternetService_Fiber optic", "InternetService_No",
    "OnlineSecurity_No", "OnlineSecurity_No internet service", "OnlineSecurity_Yes",
    "OnlineBackup_No", "OnlineBackup_No internet service", "OnlineBackup_Yes",
    "DeviceProtection_No", "DeviceProtection_No internet service", "DeviceProtection_Yes",
    "TechSupport_No", "TechSupport_No internet service", "TechSupport_Yes",
    "StreamingTV_No", "StreamingTV_No internet service", "StreamingTV_Yes",
    "StreamingMovies_No", "StreamingMovies_No internet service", "StreamingMovies_Yes",
    "Contract_Month-to-month", "Contract_One year", "Contract_Two year",
    "PaperlessBilling_No", "PaperlessBilling_Yes",
    "PaymentMethod_Bank transfer (automatic)", "PaymentMethod_Credit card (automatic)",
    "PaymentMethod_Electronic check", "PaymentMethod_Mailed check",
    "tenure_group_1 - 12", "tenure_group_13 - 24", "tenure_group_25 - 36",
    "tenure_group_37 - 48", "tenure_group_49 - 60", "tenure_group_61 - 72",
]

# ─── Field definitions ────────────────────────────────────────────────────────

# Chat will keep asking until ALL of these are filled
REQUIRED_FIELDS = [
    "gender", "SeniorCitizen", "Partner", "Dependents",
    "tenure", "PhoneService", "InternetService",
    "Contract", "PaymentMethod", "MonthlyCharges",
]

# Auto-defaulted — never asked from user
FIELD_DEFAULTS = {
    "TotalCharges":     None,   # auto = tenure × MonthlyCharges
    "MultipleLines":    None,   # auto from PhoneService
    "OnlineSecurity":   "No",
    "OnlineBackup":     "No",
    "DeviceProtection": "No",
    "TechSupport":      "No",
    "StreamingTV":      "No",
    "StreamingMovies":  "No",
    "PaperlessBilling": "No",
}

# ─── Groq system prompt for JSON extraction ───────────────────────────────────
EXTRACTION_SYSTEM_PROMPT = """\
You are a data extractor for a telecom customer churn prediction system.
Extract customer information from the user message and return ONLY a JSON object.

REQUIRED FIELDS (collect all 10 — ask if missing):
1.  gender:          "Male" or "Female"
2.  SeniorCitizen:   0 (No) or 1 (Yes)
3.  Partner:         "Yes" or "No"
4.  Dependents:      "Yes" or "No"
5.  tenure:          integer 0–72 (months). Convert "1 year"→12, "2 years"→24, etc.
6.  PhoneService:    "Yes" or "No"
7.  InternetService: "DSL", "Fiber optic", or "No"
8.  Contract:        "Month-to-month", "One year", or "Two year"
9.  PaymentMethod:   "Electronic check", "Mailed check", "Bank transfer (automatic)", or "Credit card (automatic)"
10. MonthlyCharges:  decimal number

OPTIONAL FIELDS (extract if mentioned, else leave null):
- TotalCharges, MultipleLines, OnlineSecurity, OnlineBackup, DeviceProtection,
  TechSupport, StreamingTV, StreamingMovies, PaperlessBilling

RULES:
- Merge new info from the user message into the current accumulated data.
- Never guess required fields — ask for missing ones.
- If all 10 required fields are filled → set "complete": true.
- If fields are missing → set "complete": false, list missing in "missing_required",
  write a SHORT friendly message asking ONLY for those fields.
- Return ONLY the JSON object below, no other text.

RESPONSE SCHEMA:
{
  "data": {
    "gender": null, "SeniorCitizen": null, "Partner": null, "Dependents": null,
    "tenure": null, "PhoneService": null, "MultipleLines": null,
    "InternetService": null, "OnlineSecurity": null, "OnlineBackup": null,
    "DeviceProtection": null, "TechSupport": null, "StreamingTV": null,
    "StreamingMovies": null, "Contract": null, "PaperlessBilling": null,
    "PaymentMethod": null, "MonthlyCharges": null, "TotalCharges": null
  },
  "complete": false,
  "missing_required": [],
  "message": ""
}"""


# ─── Helper: apply smart defaults ────────────────────────────────────────────
def apply_defaults(data: dict) -> dict:
    """Fill every null/missing optional field with a smart default."""
    d = dict(data)

    # Auto-calculate TotalCharges
    if not d.get("TotalCharges"):
        try:
            d["TotalCharges"] = round(
                float(d.get("tenure") or 1) * float(d.get("MonthlyCharges") or 0), 2
            )
        except (TypeError, ValueError):
            d["TotalCharges"] = 0.0

    # Logical: PhoneService → MultipleLines
    if not d.get("MultipleLines"):
        d["MultipleLines"] = (
            "No phone service" if d.get("PhoneService") == "No" else "No"
        )

    # Logical: InternetService → add-ons
    no_internet = d.get("InternetService") == "No"
    for addon in ["OnlineSecurity", "OnlineBackup", "DeviceProtection",
                  "TechSupport", "StreamingTV", "StreamingMovies"]:
        if not d.get(addon):
            d[addon] = "No internet service" if no_internet else "No"

    # Remaining simple defaults
    for field, default in FIELD_DEFAULTS.items():
        if d.get(field) is None and default is not None:
            d[field] = default

    # Ensure SeniorCitizen is int
    try:
        d["SeniorCitizen"] = int(d.get("SeniorCitizen") or 0)
    except (TypeError, ValueError):
        d["SeniorCitizen"] = 0

    return d


# ─── Helper: encode features ─────────────────────────────────────────────────
def get_tenure_group(tenure: int) -> str:
    if 1 <= tenure <= 12:    return "1 - 12"
    elif 13 <= tenure <= 24: return "13 - 24"
    elif 25 <= tenure <= 36: return "25 - 36"
    elif 37 <= tenure <= 48: return "37 - 48"
    elif 49 <= tenure <= 60: return "49 - 60"
    else:                    return "61 - 72"


def encode_input(data: dict) -> pd.DataFrame:
    """Convert a complete customer dict (no nulls) to the 50-feature vector."""
    features = {col: 0 for col in FEATURE_COLUMNS}

    features["SeniorCitizen"]  = int(data.get("SeniorCitizen", 0))
    features["MonthlyCharges"] = float(data.get("MonthlyCharges", 0))
    features["TotalCharges"]   = float(data.get("TotalCharges", 0))

    gender = str(data.get("gender", "Male"))
    features["gender_Female" if gender == "Female" else "gender_Male"] = 1

    features["Partner_Yes"    if data.get("Partner") == "Yes"    else "Partner_No"]    = 1
    features["Dependents_Yes" if data.get("Dependents") == "Yes" else "Dependents_No"] = 1

    phone = str(data.get("PhoneService", "No"))
    ml    = str(data.get("MultipleLines", "No"))
    if phone == "Yes":
        features["PhoneService_Yes"] = 1
        features["MultipleLines_Yes" if ml == "Yes" else "MultipleLines_No"] = 1
    else:
        features["PhoneService_No"]               = 1
        features["MultipleLines_No phone service"] = 1

    internet = str(data.get("InternetService", "No"))
    if internet == "DSL":
        features["InternetService_DSL"]         = 1; has_internet = True
    elif internet == "Fiber optic":
        features["InternetService_Fiber optic"] = 1; has_internet = True
    else:
        features["InternetService_No"]          = 1; has_internet = False

    for addon in ["OnlineSecurity", "OnlineBackup", "DeviceProtection",
                  "TechSupport", "StreamingTV", "StreamingMovies"]:
        val = str(data.get(addon, "No"))
        if not has_internet:
            features[f"{addon}_No internet service"] = 1
        elif val == "Yes":
            features[f"{addon}_Yes"] = 1
        else:
            features[f"{addon}_No"]  = 1

    contract = str(data.get("Contract", "Month-to-month"))
    if contract == "One year":   features["Contract_One year"]      = 1
    elif contract == "Two year": features["Contract_Two year"]      = 1
    else:                        features["Contract_Month-to-month"] = 1

    pb = str(data.get("PaperlessBilling", "No"))
    features["PaperlessBilling_Yes" if pb == "Yes" else "PaperlessBilling_No"] = 1

    payment_map = {
        "Bank transfer (automatic)": "PaymentMethod_Bank transfer (automatic)",
        "Credit card (automatic)":   "PaymentMethod_Credit card (automatic)",
        "Electronic check":          "PaymentMethod_Electronic check",
        "Mailed check":              "PaymentMethod_Mailed check",
    }
    feat_key = payment_map.get(str(data.get("PaymentMethod", "")),
                               "PaymentMethod_Electronic check")
    features[feat_key] = 1

    try:
        tenure = int(float(data.get("tenure", 1) or 1))
    except (TypeError, ValueError):
        tenure = 1
    features[f"tenure_group_{get_tenure_group(tenure)}"] = 1

    return pd.DataFrame([[features[col] for col in FEATURE_COLUMNS]],
                        columns=FEATURE_COLUMNS)


# ─── Helper: call Groq with JSON mode ────────────────────────────────────────
def groq_json(system: str, user: str, model: str = GROQ_CHAT_MODEL) -> dict:
    """
    Call Groq and guarantee a parsed JSON dict back.
    Uses response_format=json_object to eliminate parse errors.
    """
    completion = groq_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
        temperature=0.1,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )
    return json.loads(completion.choices[0].message.content)


def groq_text(system: str, user: str, model: str = GROQ_EXPLAIN_MODEL) -> str:
    """Call Groq and return plain text (for explanations)."""
    completion = groq_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
        temperature=0.5,
        max_tokens=300,
    )
    return completion.choices[0].message.content.strip()


# ═══════════════════════════════════════════════════════════════════════════════
#  Routes
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/")
def index():
    return jsonify({
        "status": "ok",
        "message": "Churn Prediction API running.",
        "ai_provider": "Groq",
        "ai_available": GROQ_AVAILABLE,
        "chat_model": GROQ_CHAT_MODEL,
    })


@app.route("/test-ai", methods=["GET"])
def test_ai():
    """Quick diagnostic — verify Groq connectivity."""
    if not GROQ_AVAILABLE:
        return jsonify({"ok": False, "error": "GROQ_API_KEY not set."}), 503
    try:
        result = groq_json(
            system="You are a test assistant. Return JSON only.",
            user='Return {"status": "ok", "message": "Groq is working!"}',
        )
        return jsonify({"ok": True, **result})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    """
    Extract customer features from natural language using Groq.
    Always returns valid JSON — Groq JSON mode eliminates parse errors.
    """
    try:
        payload = request.get_json(force=True) or {}
    except Exception:
        payload = {}

    user_message     = str(payload.get("message", "")).strip()
    accumulated_data = payload.get("accumulated_data") or {}

    if not user_message:
        return jsonify({"error": "Empty message received."}), 400

    if not GROQ_AVAILABLE:
        return jsonify({
            "data":             accumulated_data,
            "complete":         False,
            "missing_required": [],
            "message": "⚠️ AI chat unavailable. Add GROQ_API_KEY to backend/.env",
        }), 200

    user_prompt = f"""CURRENT ACCUMULATED DATA (merge new info into this):
{json.dumps(accumulated_data, indent=2)}

USER MESSAGE:
"{user_message}"

Return the updated JSON following the schema exactly."""

    try:
        result = groq_json(EXTRACTION_SYSTEM_PROMPT, user_prompt)
    except Exception as e:
        return jsonify({
            "data":             accumulated_data,
            "complete":         False,
            "missing_required": [],
            "message": f"⚠️ AI error: {str(e)}",
        }), 200

    # Apply smart defaults when all required fields are present
    if result.get("complete"):
        result["data"] = apply_defaults(result.get("data") or accumulated_data)

    return jsonify(result)


@app.route("/predict", methods=["POST"])
def predict():
    """Apply defaults → encode → predict with RandomForest."""
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"error": "Invalid JSON body"}), 400

    if not data:
        return jsonify({"error": "No JSON payload received"}), 400

    # Fill in any remaining defaults
    data = apply_defaults(data)

    # Validate required fields
    missing = [
        f for f in REQUIRED_FIELDS
        if data.get(f) is None or str(data.get(f)).strip() == ""
    ]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        X = encode_input(data)

        # Safety check
        if X.shape[1] != len(FEATURE_COLUMNS):
            return jsonify({
                "error": f"Feature size mismatch: got {X.shape[1]}, expected {len(FEATURE_COLUMNS)}"
            }), 500

        prediction_raw   = model.predict(X)[0]
        prediction_label = "Yes" if prediction_raw == 1 else "No"
        probability      = None

        if hasattr(model, "predict_proba"):
            proba       = model.predict_proba(X)[0]
            probability = round(float(proba[1]), 4)

        return jsonify({
            "prediction":    prediction_label,
            "probability":   probability,
            "customer_data": data,
        })

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route("/explain", methods=["POST"])
def explain():
    """Generate a concise business explanation using Groq."""
    if not GROQ_AVAILABLE:
        return jsonify({"explanation": "AI explanation unavailable — GROQ_API_KEY not set."}), 200

    try:
        payload     = request.get_json(force=True) or {}
        prediction  = payload.get("prediction", "No")
        probability = float(payload.get("probability") or 0)
        customer    = payload.get("customer_data") or {}
        prob_pct    = round(probability * 100, 1)
        churn_str   = "WILL CHURN" if prediction == "Yes" else "will NOT churn"

        system = "You are a concise telecom business analyst. Give plain English insights, no markdown."
        user   = f"""A customer {churn_str} with {prob_pct}% probability.

Profile: {customer.get('gender')}, Senior={customer.get('SeniorCitizen')}, \
Partner={customer.get('Partner')}, Dependents={customer.get('Dependents')}, \
{customer.get('tenure')} months, {customer.get('Contract')} contract, \
{customer.get('InternetService')} internet, ${customer.get('MonthlyCharges')}/mo, \
Payment: {customer.get('PaymentMethod')}, Security: {customer.get('OnlineSecurity')}.

Write under 120 words:
1. Why likely/unlikely to churn (1 sentence).
2. Two key risk factors.
3. Three numbered retention recommendations."""

        explanation = groq_text(system, user)
        return jsonify({"explanation": explanation})

    except Exception as e:
        return jsonify({"explanation": f"Could not generate explanation: {str(e)}"}), 200


if __name__ == "__main__":
    port  = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(debug=debug, port=port)

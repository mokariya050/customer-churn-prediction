"""
Customer Churn Prediction - Flask Backend
Model: RandomForestClassifier (model_rf) — 50 one-hot encoded features
"""

import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# ─── Load model ─────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# ─── Exact feature order as trained (50 features, Churn excluded) ─────────
FEATURE_COLUMNS = [
    "SeniorCitizen",
    "MonthlyCharges",
    "TotalCharges",
    "gender_Female",
    "gender_Male",
    "Partner_No",
    "Partner_Yes",
    "Dependents_No",
    "Dependents_Yes",
    "PhoneService_No",
    "PhoneService_Yes",
    "MultipleLines_No",
    "MultipleLines_No phone service",
    "MultipleLines_Yes",
    "InternetService_DSL",
    "InternetService_Fiber optic",
    "InternetService_No",
    "OnlineSecurity_No",
    "OnlineSecurity_No internet service",
    "OnlineSecurity_Yes",
    "OnlineBackup_No",
    "OnlineBackup_No internet service",
    "OnlineBackup_Yes",
    "DeviceProtection_No",
    "DeviceProtection_No internet service",
    "DeviceProtection_Yes",
    "TechSupport_No",
    "TechSupport_No internet service",
    "TechSupport_Yes",
    "StreamingTV_No",
    "StreamingTV_No internet service",
    "StreamingTV_Yes",
    "StreamingMovies_No",
    "StreamingMovies_No internet service",
    "StreamingMovies_Yes",
    "Contract_Month-to-month",
    "Contract_One year",
    "Contract_Two year",
    "PaperlessBilling_No",
    "PaperlessBilling_Yes",
    "PaymentMethod_Bank transfer (automatic)",
    "PaymentMethod_Credit card (automatic)",
    "PaymentMethod_Electronic check",
    "PaymentMethod_Mailed check",
    "tenure_group_1 - 12",
    "tenure_group_13 - 24",
    "tenure_group_25 - 36",
    "tenure_group_37 - 48",
    "tenure_group_49 - 60",
    "tenure_group_61 - 72",
]


def get_tenure_group(tenure: int) -> str:
    """Convert raw tenure (months) to the group label used during training."""
    if 1 <= tenure <= 12:
        return "1 - 12"
    elif 13 <= tenure <= 24:
        return "13 - 24"
    elif 25 <= tenure <= 36:
        return "25 - 36"
    elif 37 <= tenure <= 48:
        return "37 - 48"
    elif 49 <= tenure <= 60:
        return "49 - 60"
    else:
        return "61 - 72"


def encode_input(data: dict) -> np.ndarray:
    """
    Convert raw form values into the 50-feature vector required by the model.
    All features are binary (0/1) except SeniorCitizen, MonthlyCharges, TotalCharges.
    """
    # Initialise feature dict to zero
    features = {col: 0 for col in FEATURE_COLUMNS}

    # ── Numeric features ──────────────────────────────────────────────────
    features["SeniorCitizen"] = int(data.get("SeniorCitizen", 0))
    features["MonthlyCharges"] = float(data.get("MonthlyCharges", 0))
    features["TotalCharges"] = float(data.get("TotalCharges", 0))

    # ── gender ────────────────────────────────────────────────────────────
    gender = data.get("gender", "").strip()
    if gender == "Female":
        features["gender_Female"] = 1
    else:
        features["gender_Male"] = 1

    # ── Partner ───────────────────────────────────────────────────────────
    partner = data.get("Partner", "").strip()
    if partner == "Yes":
        features["Partner_Yes"] = 1
    else:
        features["Partner_No"] = 1

    # ── Dependents ────────────────────────────────────────────────────────
    dependents = data.get("Dependents", "").strip()
    if dependents == "Yes":
        features["Dependents_Yes"] = 1
    else:
        features["Dependents_No"] = 1

    # ── PhoneService ──────────────────────────────────────────────────────
    phone = data.get("PhoneService", "").strip()
    if phone == "Yes":
        features["PhoneService_Yes"] = 1
        # MultipleLines: only relevant when phone service is Yes
        ml = data.get("MultipleLines", "No").strip()
        if ml == "Yes":
            features["MultipleLines_Yes"] = 1
        else:
            features["MultipleLines_No"] = 1
    else:
        features["PhoneService_No"] = 1
        features["MultipleLines_No phone service"] = 1

    # ── InternetService ───────────────────────────────────────────────────
    internet = data.get("InternetService", "").strip()
    if internet == "DSL":
        features["InternetService_DSL"] = 1
        has_internet = True
    elif internet == "Fiber optic":
        features["InternetService_Fiber optic"] = 1
        has_internet = True
    else:
        features["InternetService_No"] = 1
        has_internet = False

    # ── Internet-dependent add-ons ────────────────────────────────────────
    internet_addons = [
        ("OnlineSecurity", "OnlineSecurity"),
        ("OnlineBackup", "OnlineBackup"),
        ("DeviceProtection", "DeviceProtection"),
        ("TechSupport", "TechSupport"),
        ("StreamingTV", "StreamingTV"),
        ("StreamingMovies", "StreamingMovies"),
    ]
    for form_key, feat_prefix in internet_addons:
        if not has_internet:
            features[f"{feat_prefix}_No internet service"] = 1
        else:
            val = data.get(form_key, "No").strip()
            if val == "Yes":
                features[f"{feat_prefix}_Yes"] = 1
            else:
                features[f"{feat_prefix}_No"] = 1

    # ── Contract ──────────────────────────────────────────────────────────
    contract = data.get("Contract", "").strip()
    if contract == "One year":
        features["Contract_One year"] = 1
    elif contract == "Two year":
        features["Contract_Two year"] = 1
    else:
        features["Contract_Month-to-month"] = 1

    # ── PaperlessBilling ──────────────────────────────────────────────────
    pb = data.get("PaperlessBilling", "No").strip()
    if pb == "Yes":
        features["PaperlessBilling_Yes"] = 1
    else:
        features["PaperlessBilling_No"] = 1

    # ── PaymentMethod ─────────────────────────────────────────────────────
    payment = data.get("PaymentMethod", "").strip()
    payment_map = {
        "Bank transfer (automatic)": "PaymentMethod_Bank transfer (automatic)",
        "Credit card (automatic)": "PaymentMethod_Credit card (automatic)",
        "Electronic check": "PaymentMethod_Electronic check",
        "Mailed check": "PaymentMethod_Mailed check",
    }
    if payment in payment_map:
        features[payment_map[payment]] = 1

    # ── Tenure group ──────────────────────────────────────────────────────
    tenure = int(data.get("tenure", 1))
    tg = get_tenure_group(tenure)
    features[f"tenure_group_{tg}"] = 1

    # ── Build ordered named DataFrame (avoids sklearn feature-name warning) ──
    vector = pd.DataFrame([[features[col] for col in FEATURE_COLUMNS]],
                          columns=FEATURE_COLUMNS)
    return vector


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON payload received"}), 400

        # Required fields validation
        required = [
            "gender", "SeniorCitizen", "Partner", "Dependents",
            "tenure", "PhoneService", "InternetService",
            "Contract", "MonthlyCharges", "TotalCharges", "PaymentMethod",
        ]
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        # Encode
        X = encode_input(data)

        # Predict
        prediction_raw = model.predict(X)[0]
        prediction_label = "Yes" if prediction_raw == 1 else "No"

        # Probability
        probability = None
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X)[0]
            probability = round(float(proba[1]), 4)  # probability of churn

        response = {
            "prediction": prediction_label,
            "probability": probability,
        }
        return jsonify(response)

    except ValueError as ve:
        return jsonify({"error": f"Invalid value: {str(ve)}"}), 422
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)

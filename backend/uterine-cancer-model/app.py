"""
Uterine Cancer Risk Prediction — Flask API
Port: 5007
Endpoints: /health, /model-info, /predict/uterine
"""

import os
import json
import traceback

import joblib
import numpy as np
import pandas as pd
import shap
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── Gemini LLM Integration ───────────────────────────────────────────────────
from google import genai
from google.genai import types as genai_types

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
_gemini_client = None
if GEMINI_API_KEY:
    _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    print("[INFO]  Gemini API key configured — LLM CDS enabled")
else:
    print("[WARN]  No GEMINI_API_KEY found — using fallback CDS rules")

# ──────────────────────────────────────────────
#  Paths
# ──────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODELS_DIR, "best_model.joblib")
PIPELINE_PATH = os.path.join(MODELS_DIR, "preprocessing_pipeline.joblib")
THRESHOLDS_PATH = os.path.join(MODELS_DIR, "risk_stratification_thresholds.json")

# ──────────────────────────────────────────────
#  Load artefacts at startup
# ──────────────────────────────────────────────

model = joblib.load(MODEL_PATH)
pipeline = joblib.load(PIPELINE_PATH)

with open(THRESHOLDS_PATH, "r") as f:
    thresholds_data = json.load(f)

THRESHOLDS = thresholds_data["thresholds"]          # {"low_upper": 0.56, "high_lower": 0.65}
LOW_UPPER = THRESHOLDS["low_upper"]
HIGH_LOWER = THRESHOLDS["high_lower"]

# ──────────────────────────────────────────────
#  Feature list (exact order the pipeline expects)
# ──────────────────────────────────────────────

EXPECTED_FEATURES = [
    "Age", "BMI", "MenopauseStatus",
    "AbnormalBleeding", "PelvicPain", "VaginalDischarge", "UnexplainedWeightLoss",
    "ThickEndometrium", "CA125_Level",
    "Hypertension", "Diabetes", "FamilyHistoryCancer", "Smoking", "EstrogenTherapy",
    "HistologyType", "Parity", "Gravidity", "HormoneReceptorStatus",
]

NUMERIC_FEATURES = ["Age", "BMI", "ThickEndometrium", "CA125_Level", "Parity", "Gravidity"]
BINARY_FEATURES = [
    "AbnormalBleeding", "PelvicPain", "VaginalDischarge", "UnexplainedWeightLoss",
    "Hypertension", "Diabetes", "FamilyHistoryCancer", "Smoking", "EstrogenTherapy",
]
CATEGORICAL_FEATURES = ["MenopauseStatus", "HistologyType", "HormoneReceptorStatus"]

# ──────────────────────────────────────────────
#  Feature importance (coefficient-based for LR, SHAP fallback)
# ──────────────────────────────────────────────

def _get_transformed_feature_names():
    """Extract feature names after preprocessing (e.g. one-hot encoded columns)."""
    try:
        return list(pipeline.get_feature_names_out())
    except Exception:
        return None


def _compute_shap_explanation(X_raw_df, X_transformed, top_n=5):
    """
    Compute per-prediction feature contributions.

    For linear models (LogisticRegression): uses coefficient × feature_value
    to get exact per-sample contributions — this is equivalent to SHAP for
    linear models and doesn't need a background dataset.

    Falls back to generic SHAP if coefficient extraction fails.
    """
    try:
        feature_names = _get_transformed_feature_names()

        # Prefer coefficient-based per-sample contributions (exact for LR)
        if hasattr(model, "coef_"):
            coefs = model.coef_[0]  # shape: (n_features,)

            # X_transformed may be sparse
            if hasattr(X_transformed, "toarray"):
                x_arr = X_transformed.toarray()[0]
            else:
                x_arr = np.asarray(X_transformed)[0]

            contributions = coefs * x_arr  # per-feature contribution

            if feature_names is None or len(feature_names) != len(contributions):
                feature_names = [f"feature_{i}" for i in range(len(contributions))]

            pairs = list(zip(feature_names, contributions))
        else:
            # Fallback: SHAP
            try:
                explainer = shap.TreeExplainer(model)
            except Exception:
                explainer = shap.LinearExplainer(model, X_transformed)

            sv = explainer.shap_values(X_transformed)
            if isinstance(sv, list):
                sv = sv[1]
            values = sv[0] if sv.ndim == 2 else sv

            if feature_names is None or len(feature_names) != len(values):
                feature_names = [f"feature_{i}" for i in range(len(values))]

            pairs = list(zip(feature_names, values))

        # Sort by |contribution| and take top N
        pairs.sort(key=lambda x: abs(x[1]), reverse=True)
        top = pairs[:top_n]

        # Clean up feature names: remove prefixes like "cont__", "cat__"
        def _clean_name(raw: str) -> str:
            for prefix in ("cont__", "cat__", "bin__", "remainder__"):
                if raw.startswith(prefix):
                    raw = raw[len(prefix):]
            return raw.replace("_", " ")

        return [
            {
                "feature": _clean_name(name),
                "shap_value": round(float(abs(val)), 4),
                "direction": "increases risk" if val > 0 else "decreases risk",
            }
            for name, val in top
        ]
    except Exception as e:
        print(f"[SHAP WARNING] Could not compute feature contributions: {e}")
        traceback.print_exc()
        return []


# ──────────────────────────────────────────────
#  Clinical recommendations engine
# ──────────────────────────────────────────────

def _generate_recommendations(data: dict, risk_tier: str) -> list[str]:
    """Rule-based clinical recommendations per the implementation plan."""
    recs = []

    thick = float(data.get("ThickEndometrium", 0))
    menopause = data.get("MenopauseStatus", "")
    ca125 = float(data.get("CA125_Level", 0))
    bleeding = data.get("AbnormalBleeding", "No")
    age = float(data.get("Age", 0))
    diabetes = data.get("Diabetes", "No")
    estrogen = data.get("EstrogenTherapy", "No")
    bmi = float(data.get("BMI", 0))
    family = data.get("FamilyHistoryCancer", "No")

    # Endometrial thickness rules
    if thick > 4 and menopause == "Postmenopausal":
        recs.append(
            f"Elevated endometrial thickness ({thick} mm) exceeds the 4-5 mm "
            f"postmenopausal threshold — consider endometrial biopsy."
        )
    if thick > 12 and menopause == "Premenopausal":
        recs.append(
            f"Endometrial thickness ({thick} mm) is elevated for a premenopausal "
            f"patient — consider ultrasound follow-up."
        )

    # CA-125
    if ca125 > 35:
        recs.append(
            f"CA-125 level ({ca125} U/mL) is above the reference range (0–35 U/mL) "
            f"— further evaluation warranted."
        )

    # Bleeding
    if bleeding == "Yes" and menopause == "Postmenopausal":
        recs.append(
            "Abnormal uterine bleeding in a postmenopausal patient is a clinical "
            "red flag — gynaecologic workup recommended."
        )
    if bleeding == "Yes" and age > 45:
        recs.append(
            "Abnormal bleeding after age 45 — endometrial evaluation recommended."
        )

    # Comorbidities
    if diabetes == "Yes":
        recs.append(
            "Patient has comorbid diabetes — monitor for metabolic syndrome as an "
            "independent risk factor."
        )

    # HRT
    if estrogen == "Yes" and risk_tier in ("Intermediate", "High"):
        recs.append(
            "Unopposed estrogen therapy in an elevated-risk patient — review HRT "
            "regimen with provider."
        )

    # Obesity
    if bmi > 30:
        recs.append(
            f"Obesity (BMI {bmi}) is an established risk factor for uterine cancer "
            f"— weight management counselling recommended."
        )

    # Family history + high risk
    if family == "Yes" and risk_tier == "High":
        recs.append(
            "Family history of cancer combined with high estimated risk — consider "
            "genetic counselling (Lynch syndrome screening)."
        )

    # General tier-based
    if risk_tier == "High":
        recs.append(
            "High estimated risk — strongly recommend gynaecologic oncology referral."
        )
    elif risk_tier == "Intermediate":
        recs.append(
            "Intermediate estimated risk — recommend clinical follow-up with gynaecologist."
        )
    else:
        recs.append(
            "Low estimated risk — routine screening per clinical guidelines."
        )

    return recs


def _call_gemini(prompt: str, fallback):
    """Call Gemini API with retry. Returns parsed JSON on success, fallback on failure."""
    if not _gemini_client:
        return fallback
    import time
    for attempt in range(3):
        try:
            response = _gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=1024,
                    response_mime_type="application/json",
                    thinking_config=genai_types.ThinkingConfig(thinking_budget=0),
                ),
            )
            result = json.loads(response.text)
            # Validate structure
            if isinstance(fallback, list):
                assert isinstance(result, list) and len(result) > 0
            elif isinstance(fallback, dict):
                assert "summary" in result and "actions" in result
            return result
        except Exception as e:
            err_str = str(e)
            if ("503" in err_str or "429" in err_str or "UNAVAILABLE" in err_str) and attempt < 2:
                print(f"[LLM RETRY] Attempt {attempt+1} failed ({err_str[:80]}), retrying in {2 ** attempt}s...")
                time.sleep(2 ** attempt)
                continue
            print(f"[LLM WARNING] Gemini call failed, using fallback: {e}")
            return fallback


def _generate_llm_cds_uterine(data: dict, risk_tier: str, proba: float, shap_entries: list) -> list[str]:
    """Generate personalised uterine cancer CDS using Gemini LLM."""
    fallback = _generate_recommendations(data, risk_tier)

    # Build SHAP summary
    shap_summary = "; ".join(
        f"{e['feature']} ({e['direction']}, SHAP={e['shap_value']})"
        for e in shap_entries
    ) or "No significant features detected"

    age = data.get("Age", "unknown")
    bmi = data.get("BMI", "unknown")
    menopause = data.get("MenopauseStatus", "unknown")
    bleeding = data.get("AbnormalBleeding", "No")
    thickness = data.get("ThickEndometrium", "unknown")
    ca125 = data.get("CA125_Level", "unknown")
    diabetes = data.get("Diabetes", "No")
    estrogen = data.get("EstrogenTherapy", "No")
    family = data.get("FamilyHistoryCancer", "No")
    smoking = data.get("Smoking", "No")

    prompt = f"""You are a clinical decision support assistant for uterine/endometrial cancer screening.

Patient Profile:
- Age: {age}, BMI: {bmi}, Menopausal Status: {menopause}
- Risk Tier: {risk_tier} (Probability: {proba * 100:.1f}%)
- Abnormal Bleeding: {bleeding}, Endometrial Thickness: {thickness}mm
- CA-125: {ca125} U/mL, Diabetes: {diabetes}, Estrogen Therapy: {estrogen}
- Family History of Cancer: {family}, Smoking: {smoking}
- Key Risk Drivers (SHAP): {shap_summary}

Task:
Provide personalised uterine cancer clinical decision support as a JSON list of recommendation strings.
Follow ESGO/RCOG/ACOG uterine cancer screening guidelines.
Do NOT recommend specific drugs or dosages.
Personalize recommendations based on the patient's specific risk factors and clinical values.
Provide 3–6 actionable recommendations.

Return exactly this JSON format (a JSON array of strings):
[
  "<recommendation 1>",
  "<recommendation 2>",
  "<recommendation 3>"
]"""

    return _call_gemini(prompt, fallback)


# ──────────────────────────────────────────────
#  Risk tier helpers
# ──────────────────────────────────────────────

RISK_COLORS = {
    "Low": "#27ae60",
    "Intermediate": "#f39c12",
    "High": "#e74c3c",
}


def _classify_risk(prob: float) -> str:
    if prob < LOW_UPPER:
        return "Low"
    elif prob >= HIGH_LOWER:
        return "High"
    return "Intermediate"


# ──────────────────────────────────────────────
#  Flask application
# ──────────────────────────────────────────────

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model": "uterine_cancer_lr"})


@app.route("/model-info", methods=["GET"])
def model_info():
    return jsonify({
        "model_name": "Uterine Cancer Risk Estimator",
        "model_type": thresholds_data.get("best_model", "Logistic Regression"),
        "strategy": thresholds_data.get("best_strategy", "Class Weighting"),
        "version": "1.0.0",
        "features": EXPECTED_FEATURES,
        "thresholds": THRESHOLDS,
        "limitations": [
            "Trained on synthetic data — not clinically validated.",
            "Intended as a clinical decision support prototype only.",
            "SHAP explanations are approximate and may vary with background data.",
        ],
    })


@app.route("/predict/uterine", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Empty or invalid JSON body."}), 400

        # ---- validate required fields ----
        missing = [f for f in EXPECTED_FEATURES if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        # ---- build DataFrame in the right column order ----
        row = {feat: data[feat] for feat in EXPECTED_FEATURES}
        df = pd.DataFrame([row])

        # Coerce types
        for col in NUMERIC_FEATURES:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # Convert binary Yes/No → 1/0 (pipeline expects numeric)
        for col in BINARY_FEATURES:
            df[col] = df[col].map({"Yes": 1, "No": 0, 1: 1, 0: 0}).fillna(0).astype(int)

        # ---- preprocess + predict ----
        X_transformed = pipeline.transform(df)
        proba = model.predict_proba(X_transformed)[0][1]
        prediction = int(proba >= 0.5)

        # ---- risk tier ----
        risk_tier = _classify_risk(proba)
        risk_color = RISK_COLORS[risk_tier]

        # ---- SHAP ----
        shap_explanation = _compute_shap_explanation(df, X_transformed, top_n=5)

        # ---- clinical recommendations (LLM-powered with fallback) ----
        recommendations = _generate_llm_cds_uterine(data, risk_tier, proba, shap_explanation)

        # ---- response ----
        return jsonify({
            "prediction": prediction,
            "probability": round(float(proba), 4),
            "risk_tier": risk_tier,
            "risk_color": risk_color,
            "threshold_used": {
                "low_upper": LOW_UPPER,
                "high_lower": HIGH_LOWER,
            },
            "shap_explanation": shap_explanation,
            "clinical_recommendations": recommendations,
            "disclaimer": (
                "This is a CDS prototype using synthetic data. Results are not "
                "clinically validated. Always defer to clinical judgement."
            ),
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ──────────────────────────────────────────────
#  Entry point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  Uterine Cancer Risk Prediction API")
    print(f"  Model   : {thresholds_data.get('best_model', 'LR')}")
    print(f"  Strategy: {thresholds_data.get('best_strategy', 'CW')}")
    print(f"  Low ≤ {LOW_UPPER:.2f}  |  High ≥ {HIGH_LOWER:.2f}")
    print("=" * 60)
    # Hugging Face Spaces requires port 7860
    app.run(host="0.0.0.0", port=7860, debug=False)

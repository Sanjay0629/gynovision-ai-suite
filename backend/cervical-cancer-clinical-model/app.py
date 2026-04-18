import os, json, re
import numpy as np
import pandas as pd
import joblib
import shap
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import RobustScaler

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


# ══════════════════════════════════════════════════════════════════════════════
# Custom transformer classes (must be in __main__ so the pickle can find them)
# ══════════════════════════════════════════════════════════════════════════════

from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.linear_model import BayesianRidge

# Global constants needed for transforms during prediction
RAW_STD_INDICATOR_COLS = [
    "STDs:condylomatosis", "STDs:cervical condylomatosis",
    "STDs:vaginal condylomatosis", "STDs:vulvo-perineal condylomatosis",
    "STDs:syphilis", "STDs:pelvic inflammatory disease",
    "STDs:genital herpes", "STDs:molluscum contagiosum",
    "STDs:AIDS", "STDs:HIV", "STDs:Hepatitis B", "STDs:HPV"
]
STD_DURATION_COLS = [
    "STDs: Time since first diagnosis", "STDs: Time since last diagnosis"
]
STD_COUNT_COLS = ["STDs (number)", "STDs: Number of diagnosis"]

def _sanitize_col(name):
    import re
    return re.sub(r'[^A-Za-z0-9_]+', '_', str(name)).strip('_')


class STDAtomicTransformer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.median_values_ = {}

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        df = X.copy() if isinstance(X, pd.DataFrame) else pd.DataFrame(X)
        raw_std_cols_present = [c for c in RAW_STD_INDICATOR_COLS if c in df.columns]

        if raw_std_cols_present:
            any_std_mask = (df[raw_std_cols_present].fillna(0).max(axis=1) > 0)
        else:
            any_std_mask = pd.Series(False, index=df.index)

        cols_to_impute = [c for c in STD_DURATION_COLS + STD_COUNT_COLS if c in df.columns]
        for col in cols_to_impute:
            df.loc[~any_std_mask, col] = 0
            mask = any_std_mask & df[col].isna()
            if mask.any():
                df.loc[mask, col] = self.median_values_.get(col, 0)

        cols_to_drop = [c for c in raw_std_cols_present + STD_DURATION_COLS if c in df.columns]
        df.drop(columns=cols_to_drop, inplace=True, errors="ignore")
        return df


class MissingnessIndicatorTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, columns=None):
        self.columns = columns or []

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        df = X.copy() if isinstance(X, pd.DataFrame) else pd.DataFrame(X)
        for col in self.columns:
            if col in df.columns:
                df[f"{col}_missing"] = df[col].isna().astype(int)
        return df


class IterativeImputerTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, max_iter=10, random_state=42):
        self.max_iter = max_iter
        self.random_state = random_state
        self.iterative_imputer_ = None
        self.numeric_cols_ = []
        self.mode_values_ = {}

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        df = X.copy() if isinstance(X, pd.DataFrame) else pd.DataFrame(X)
        if self.numeric_cols_ and self.iterative_imputer_ is not None:
            cols_present = [c for c in self.numeric_cols_ if c in df.columns]
            if cols_present:
                imputed = self.iterative_imputer_.transform(df[cols_present])
                df[cols_present] = imputed

        for col, val in self.mode_values_.items():
            if col in df.columns:
                df[col] = df[col].fillna(val)
        return df


class ColumnNameSanitizer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        df = X.copy() if isinstance(X, pd.DataFrame) else pd.DataFrame(X)
        df.columns = [_sanitize_col(c) for c in df.columns]
        return df


class RobustScalerTransformer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.scaler_ = RobustScaler()
        self.numeric_cols_ = []

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        df = X.copy() if isinstance(X, pd.DataFrame) else pd.DataFrame(X)
        if self.numeric_cols_:
            cols_present = [c for c in self.numeric_cols_ if c in df.columns]
            if cols_present:
                scaled = self.scaler_.transform(df[cols_present])
                df[cols_present] = scaled
        return df


# ══════════════════════════════════════════════════════════════════════════════

app = Flask(__name__)
CORS(app)

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# ── Load artifacts once at startup ────────────────────────────────────────────
model      = joblib.load(os.path.join(MODELS_DIR, "final_model.joblib"))
pipeline   = joblib.load(os.path.join(MODELS_DIR, "preprocessing_pipeline.joblib"))
thresholds = json.load(open(os.path.join(MODELS_DIR, "thresholds.json")))

T1 = thresholds["t1"]
T2 = thresholds["t2"]

# ── Build SHAP explainer once (uses the base LightGBM inside the calibrated model)
_cal        = model.calibrated_classifiers_[0]
_base_model = _cal.estimator
_explainer  = shap.TreeExplainer(_base_model)

# ── Clinical Decision Support rules (fallback) ──────────────────────────────
CDS_RULES = {
    "Low Risk": {
        "summary": "Patient is at low risk for cervical cancer.",
        "actions": [
            "Routine cervical screening as per national guidelines (every 3–5 years).",
            "Counsel on STI prevention and safe sexual practices.",
        ],
    },
    "Moderate Risk": {
        "summary": "Patient has elevated risk factors that warrant closer monitoring.",
        "actions": [
            "Schedule cervical screening within the next 12 months.",
            "Assess and address modifiable risk factors (smoking cessation, STI treatment).",
            "Consider HPV co-testing at next visit.",
        ],
    },
    "High Risk": {
        "summary": "Patient has multiple significant risk factors. Urgent clinical review recommended.",
        "actions": [
            "Refer for colposcopy evaluation at the earliest opportunity.",
            "Do not defer based on last normal screening result.",
            "Document and address all identified risk factors.",
            "Ensure patient is counselled on the importance of follow-up.",
        ],
    },
}


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
            if isinstance(fallback, dict):
                assert "summary" in result and "actions" in result
                assert isinstance(result["actions"], list) and len(result["actions"]) > 0
            return result
        except Exception as e:
            err_str = str(e)
            if ("503" in err_str or "429" in err_str or "UNAVAILABLE" in err_str) and attempt < 2:
                print(f"[LLM RETRY] Attempt {attempt+1} failed ({err_str[:80]}), retrying in {2 ** attempt}s...")
                time.sleep(2 ** attempt)
                continue
            print(f"[LLM WARNING] Gemini call failed, using fallback: {e}")
            return fallback


def _generate_llm_cds_cervical(patient_data, risk_label, cancer_prob, shap_entries):
    """Generate personalised CDS using Gemini LLM."""
    fallback = CDS_RULES[risk_label]

    # Build SHAP summary
    shap_summary = "; ".join(
        f"{e['feature'].replace('_', ' ')} ({e['direction']}, SHAP={e['shap_value']})"
        for e in shap_entries
    ) or "No significant features detected"

    # Extract key patient values
    age = patient_data.get("Age", "unknown")
    smokes = "Yes" if patient_data.get("Smokes") == 1 else "No"
    hc = "Yes" if patient_data.get("Hormonal Contraceptives") == 1 else "No"
    iud = "Yes" if patient_data.get("IUD") == 1 else "No"
    stds = "Yes" if patient_data.get("STDs") == 1 else "No"
    hpv = "Yes" if patient_data.get("STDs:HPV") == 1 else "No"
    hiv = "Yes" if patient_data.get("STDs:HIV") == 1 else "No"
    num_partners = patient_data.get("Number of sexual partners", "unknown")
    first_intercourse = patient_data.get("First sexual intercourse", "unknown")

    prompt = f"""You are a clinical decision support assistant for gynaecological oncology.

Patient Profile:
- Age: {age}
- Risk Level: {risk_label} (Cancer Probability: {cancer_prob * 100:.1f}%)
- Key Risk Drivers (SHAP): {shap_summary}
- Smoking: {smokes}, Hormonal Contraceptives: {hc}, IUD: {iud}
- STD History: {stds}, HPV: {hpv}, HIV: {hiv}
- Number of Sexual Partners: {num_partners}
- Age at First Intercourse: {first_intercourse}

Task:
Provide clinical decision support as JSON ONLY. No preamble or explanation outside the JSON.
Follow evidence-based cervical cancer screening guidelines (ASCCP 2019, WHO 2021).
Do NOT recommend specific medications or drug dosages.
Personalize recommendations based on the patient's specific risk factors.
Provide 3–5 actionable recommendations.

Return exactly this JSON format:
{{
  "summary": "<1–2 sentence personalised patient risk summary>",
  "actions": [
    "<action 1>",
    "<action 2>",
    "<action 3>"
  ]
}}"""

    return _call_gemini(prompt, fallback)

REQUIRED_FIELDS = [
    "Age", "Number of sexual partners", "First sexual intercourse",
    "Num of pregnancies", "Smokes", "Smokes (years)", "Smokes (packs/year)",
    "Hormonal Contraceptives", "Hormonal Contraceptives (years)", "IUD",
    "IUD (years)", "STDs", "STDs (number)", "STDs:condylomatosis",
    "STDs:cervical condylomatosis", "STDs:vaginal condylomatosis",
    "STDs:vulvo-perineal condylomatosis", "STDs:syphilis",
    "STDs:pelvic inflammatory disease", "STDs:genital herpes",
    "STDs:molluscum contagiosum", "STDs:AIDS", "STDs:HIV",
    "STDs:Hepatitis B", "STDs:HPV", "STDs: Number of diagnosis",
    "STDs: Time since first diagnosis", "STDs: Time since last diagnosis",
]


def assign_risk(prob: float) -> str:
    if prob >= T2:
        return "High Risk"
    if prob >= T1:
        return "Moderate Risk"
    return "Low Risk"


def get_shap_explanation(X_processed, feature_names, top_n=5):
    """Return top N features driving this individual prediction."""
    sv = _explainer.shap_values(X_processed)
    # For binary classifiers shap_values may return a list [neg, pos]
    if isinstance(sv, list):
        sv = sv[1]
    sv_row = sv[0]
    pairs = sorted(
        zip(feature_names, sv_row),
        key=lambda x: abs(x[1]),
        reverse=True,
    )[:top_n]
    return [
        {
            "feature": feat,
            "shap_value": round(float(val), 4),
            "direction": "increases risk" if val > 0 else "decreases risk",
        }
        for feat, val in pairs
    ]


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": True})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        row = {}
        for field in REQUIRED_FIELDS:
            value = data.get(field, None)
            row[field] = np.nan if (value == "" or value is None) else float(value)

        X = pd.DataFrame([row])
        X_processed = pipeline.transform(X)

        # Prediction
        prob       = float(model.predict_proba(X_processed)[0][1])
        risk_label = assign_risk(prob)

        # SHAP explanation
        feature_names    = list(X_processed.columns)
        shap_explanation = get_shap_explanation(X_processed, feature_names)

        # Clinical Decision Support (LLM-powered with fallback)
        cds = _generate_llm_cds_cervical(row, risk_label, prob, shap_explanation)

        return jsonify({
            "cancer_probability": round(prob, 4),
            "risk_label": risk_label,
            "thresholds": {"T1": T1, "T2": T2},
            "shap_explanation": shap_explanation,
            "cds_guidance": {
                "summary": cds["summary"],
                "actions": cds["actions"],
            },
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    # Hugging Face Spaces requires port 7860
    app.run(host="0.0.0.0", port=7860, debug=False)

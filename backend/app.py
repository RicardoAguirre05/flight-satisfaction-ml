from __future__ import annotations
import os, sys, math
from typing import List, Dict, Any, Optional

# ensure utils import works before joblib.load
sys.path.append(os.path.dirname(__file__))
from utils.preprocessing import _clip_after_preproc  # noqa: F401

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
import numpy as np

# -----------------------
# Config
# -----------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")

app = Flask(__name__)
CORS(app)

# -----------------------
# Model loading
# -----------------------
_model: Optional[Pipeline] = None
_schema: Optional[Dict[str, List[str]]] = None

def load_model_once() -> Pipeline:
    global _model, _schema
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"model not found at {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
        # derive input columns from the fitted ColumnTransformer
        try:
            pre = _model.named_steps["preprocessor"]
            num_cols = list(pre.transformers_[0][2])  # (name, transformer, columns)
            cat_cols = list(pre.transformers_[1][2])
            _schema = {"numerical": num_cols, "categorical": cat_cols}
        except Exception:
            _schema = {"numerical": [], "categorical": []}
    return _model

@app.get("/health")
def health():
    return jsonify({"ok": True})

@app.get("/schema")
def schema():
    load_model_once()
    return jsonify({"features": _schema, "target": "satisfaction"})

def _coerce_payload_to_df(payload: Dict[str, Any]) -> pd.DataFrame:
    """Accepts dict of feature:value and returns single-row DataFrame with model schema ordering."""
    load_model_once()
    cols = (_schema.get("numerical", []) + _schema.get("categorical", [])) if _schema else list(payload.keys())
    row = {c: payload.get(c, None) for c in cols}
    return pd.DataFrame([row])

# ---------- NEW: /predict ----------
@app.post("/predict")
def predict_single():
    model = load_model_once()
    try:
        payload = request.get_json(force=True)
        X = _coerce_payload_to_df(payload)

        # class prediction
        pred = int(model.predict(X)[0])

        # probability if available; else sigmoid(decision_function)
        proba = None
        if hasattr(model, "predict_proba"):
            proba = float(model.predict_proba(X)[:, 1][0])
        elif hasattr(model, "decision_function"):
            score = float(model.decision_function(X)[0])
            proba = 1.0 / (1.0 + math.exp(-score))

        return jsonify({"prediction": pred, "probability": proba})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------- NEW: /predict-batch ----------
@app.post("/predict-batch")
def predict_batch():
    model = load_model_once()
    if 'file' not in request.files:
        return jsonify({"error": "Upload a CSV file as form field 'file'"}), 400
    f = request.files['file']
    try:
        df = pd.read_csv(f)

        preds = model.predict(df).astype(int)
        out = df.copy()
        out["pred"] = preds

        if hasattr(model, "predict_proba"):
            out["proba"] = model.predict_proba(df)[:, 1]
        elif hasattr(model, "decision_function"):
            scores = model.decision_function(df)
            out["proba"] = 1.0 / (1.0 + np.exp(-scores))

        csv_text = out.to_csv(index=False)
        preview = out.head(5).to_dict(orient="records")
        return jsonify({"preview": preview, "csv": csv_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

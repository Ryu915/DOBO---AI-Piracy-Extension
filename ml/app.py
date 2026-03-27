from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

model = pickle.load(open("model.pkl", "rb"))
scaler = pickle.load(open("scaler.pkl", "rb"))

keywords = ["ads", "track", "analytics", "pixel"]
known_bad_domains = ["doubleclick.net", "segment.io", "onaudience.com"]

def extract_features(domain, freq=1, is_third_party=1):
    length = len(domain)
    keyword_flag = int(any(k in domain for k in keywords))
    subdomain_count = max(len(domain.split(".")) - 2, 0)
    known_flag = int(any(k in domain for k in known_bad_domains))

    return [
        length,
        keyword_flag,
        subdomain_count,
        freq,
        is_third_party,
        known_flag
    ]

def get_risk_level(prob):
    if prob > 0.7:
        return "HIGH_RISK"
    elif prob > 0.4:
        return "SUSPICIOUS"
    else:
        return "NORMAL"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    domain = data.get("domain")
    freq = data.get("frequency", 1)
    is_third_party = data.get("third_party", 1)

    features = np.array([extract_features(domain, freq, is_third_party)])
    features_scaled = scaler.transform(features)

    prob = model.predict_proba(features_scaled)[0][1]

    risk_level = get_risk_level(prob)

    return jsonify({
        "domain": domain,
        "suspicious": bool(prob > 0.5),
        "confidence": float(prob),
        "risk": risk_level
    })

if __name__ == "__main__":
    app.run(port=5000)
from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

model = pickle.load(open("model.pkl", "rb"))
scaler = pickle.load(open("scaler.pkl", "rb"))

keywords = ["ads", "track", "analytics", "pixel"]

known_bad_domains = [
    "doubleclick.net",
    "segment.io",
    "onaudience.com",
    "google-analytics.com",
    "facebook.com"
]

suspicious_tlds = ["xyz", "top", "club", "ru", "cn", "tk"]

def extract_features(domain):
    keyword_flag = int(any(k in domain for k in keywords))
    known_flag = int(any(k in domain for k in known_bad_domains))
    tld = domain.split('.')[-1]

    return [
        len(domain),                                 
        keyword_flag,                               
        domain.count('.'),                           
        int('-' in domain),                          
        int(any(char.isdigit() for char in domain)),  
        int(domain.startswith("ads") or domain.startswith("track")),
        known_flag,                                  
        int(tld in suspicious_tlds)                
    ]

def get_risk_level(prob):
    if prob > 0.7:
        return "HIGH_RISK"
    elif prob > 0.4:
        return "SUSPICIOUS"
    else:
        return "NORMAL"

# API endpoint
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        domain = data.get("domain")

        if not domain:
            return jsonify({"error": "No domain provided"}), 400

     
        features = np.array([extract_features(domain)])
        features_scaled = scaler.transform(features)

        prob = model.predict_proba(features_scaled)[0][1]
        risk_level = get_risk_level(prob)

        return jsonify({
            "domain": domain,
            "suspicious": bool(prob > 0.5),
            "confidence": float(prob),
            "risk": risk_level
        })

    except Exception as e:
       
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
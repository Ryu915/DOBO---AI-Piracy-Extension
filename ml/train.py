import numpy as np
import pickle

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score
)

# CONFIG
keywords = ["ads", "track", "analytics", "pixel"]

known_bad_domains = [
    "doubleclick.net",
    "segment.io",
    "onaudience.com",
    "google-analytics.com",
    "facebook.com"
]

# FEATURE FUNCTION
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

# DATASET (expand this later!)
data = [
    # SAFE
    ("google.com", 0),
    ("openai.com", 0),
    ("github.com", 0),
    ("amazon.in", 0),
    ("wikipedia.org", 0),
    ("cdn.shopify.com", 0),
    ("static.cloudflare.com", 0),
    ("images.unsplash.com", 0),

    # SUSPICIOUS
    ("pixel.onaudience.com", 1),
    ("ads.doubleclick.net", 1),
    ("track.segment.io", 1),
    ("analytics.google-analytics.com", 1),
    ("tracking.facebook.com", 1),
    ("metrics.apple.com", 1),
    ("adservice.google.com", 1),
]

# BUILD FEATURE MATRIX
X = []
y = []

for domain, label in data:
    features = extract_features(domain)
    X.append(features)
    y.append(label)

X = np.array(X)
y = np.array(y)

# SCALE FEATURES
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# TRAIN / TEST SPLIT
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.3, random_state=42
)

# TRAIN MODEL
model = LogisticRegression()
model.fit(X_train, y_train)

# PREDICT
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# EVALUATION
print("\n======================")
print("MODEL EVALUATION")
print("======================\n")

print("Accuracy:", accuracy_score(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nROC-AUC Score:", roc_auc_score(y_test, y_prob))

# FEATURE IMPORTANCE
print("\nFeature Weights:")
print("[length, keyword, subdomain, freq, third_party, known]")
print(model.coef_)

# SAVE MODEL + SCALER
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("\n✅ Model and scaler saved!")
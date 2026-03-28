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
def extract_features(domain):
    keyword_flag = int(any(k in domain for k in keywords))


    known_flag = int(any(k in domain for k in known_bad_domains))

    suspicious_tlds = ["xyz", "top", "club", "ru", "cn", "tk"]
    tld = domain.split('.')[-1]

    return [
        len(domain),        #domain length
        keyword_flag,
        domain.count('.'), #subdomain count
        int('-' in domain),
        int(any(char.isdigit() for char in domain)),
        int(domain.startswith("ads") or domain.startswith("track")),
        known_flag,
        int(tld in suspicious_tlds)
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

<<<<<<< HEAD
    # SUSPICIOUS
=======
    # NEW SAFE
    ("netflix.com", 0),
    ("linkedin.com", 0),
    ("instagram.com", 0),
    ("whatsapp.com", 0),
    ("zoom.us", 0),
    ("dropbox.com", 0),
    ("slack.com", 0),
    ("notion.so", 0),
    ("figma.com", 0),
    ("canva.com", 0),
    ("airbnb.com", 0),
    ("uber.com", 0),
    ("ola.com", 0),
    ("flipkart.com", 0),
    ("zomato.com", 0),
    ("swiggy.com", 0),
    ("paytm.com", 0),
    ("razorpay.com", 0),
    ("coursera.org", 0),
    ("udemy.com", 0),
    ("khanacademy.org", 0),
    ("nasa.gov", 0),
    ("mit.edu", 0),
    ("harvard.edu", 0),
    ("stanford.edu", 0),
    ("cloudflare.com", 0),
    ("fastly.com", 0),
    ("akamai.com", 0),
    ("jsdelivr.net", 0),
    ("bootstrapcdn.com", 0),
    ("api.stripe.com", 0),
    ("api.paypal.com", 0),
    ("docs.aws.amazon.com", 0),
    ("console.firebase.google.com", 0),
    ("developer.apple.com", 0),
    ("support.microsoft.com", 0),
    ("learn.microsoft.com", 0),
    ("chat.openai.com", 0),

    # SUSPICIOUS (tracking / ads / analytics)
>>>>>>> 536cb67 (increased accuracy)
    ("pixel.onaudience.com", 1),
    ("ads.doubleclick.net", 1),
    ("track.segment.io", 1),
    ("analytics.google-analytics.com", 1),
    ("tracking.facebook.com", 1),
    ("metrics.apple.com", 1),
    ("adservice.google.com", 1),
<<<<<<< HEAD
=======
    ("stats.g.doubleclick.net", 1),
    ("ad.doubleclick.net", 1),
    ("pagead2.googlesyndication.com", 1),
    ("googleads.g.doubleclick.net", 1),
    ("ads.yahoo.com", 1),
    ("analytics.twitter.com", 1),
    ("track.mailchimp.com", 1),
    ("links.mailchimp.com", 1),
    ("clicks.hubspot.com", 1),
    ("track.hubspot.com", 1),
    ("pixel.facebook.com", 1),
    ("connect.facebook.net", 1),
    ("ads.linkedin.com", 1),
    ("px.ads.linkedin.com", 1),
    ("tracking.snapchat.com", 1),
    ("ads.snapchat.com", 1),
    ("insights.hotjar.com", 1),
    ("script.hotjar.com", 1),
    ("bam.nr-data.net", 1),
    ("js-agent.newrelic.com", 1),
    ("logx.optimizely.com", 1),
    ("events.mixpanel.com", 1),
    ("api.mixpanel.com", 1),
    ("trk.pinterest.com", 1),
    ("ads.pinterest.com", 1),

    # NEW SUSPICIOUS
    ("ads.reddit.com", 1),
    ("pixel.reddit.com", 1),
    ("ads.tiktok.com", 1),
    ("analytics.tiktok.com", 1),
    ("tracking.spotify.com", 1),
    ("ads.spotify.com", 1),
    ("ads.amazon.com", 1),
    ("analytics.amazon.com", 1),
    ("track.adform.net", 1),
    ("serve.adform.net", 1),
    ("ads.taboola.com", 1),
    ("trc.taboola.com", 1),
    ("ads.outbrain.com", 1),
    ("tr.outbrain.com", 1),
    ("pixel.quantserve.com", 1),
    ("edge.quantserve.com", 1),
    ("ads.pubmatic.com", 1),
    ("track.pubmatic.com", 1),
    ("ads.rubiconproject.com", 1),
    ("pixel.rubiconproject.com", 1),
    ("ads.criteo.com", 1),
    ("bidder.criteo.com", 1),
    ("ads.adroll.com", 1),
    ("track.adroll.com", 1),
    ("ads.moatads.com", 1),
    ("analytics.moatads.com", 1),
    ("ads.openx.net", 1),
    ("track.openx.net", 1),
    ("ads.smartadserver.com", 1),
    ("track.smartadserver.com", 1),
    ("ads.revcontent.com", 1),
    ("tr.revcontent.com", 1),
    ("ads.adnxs.com", 1),
    ("ib.adnxs.com", 1),
    ("ads.yieldmo.com", 1),
    ("track.yieldmo.com", 1),
    ("ads.smaato.net", 1),
    ("track.smaato.net", 1),
    ("ads.inmobi.com", 1),
    ("track.inmobi.com", 1),
>>>>>>> 536cb67 (increased accuracy)
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
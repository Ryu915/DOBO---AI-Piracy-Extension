const statsDiv = document.getElementById("stats");

// Helper functions for categorization
const categoryRules = {
  AI_SERVICE: ["openai", "anthropic", "huggingface"],
  TRACKING: ["analytics", "segment", "mixpanel"],
  AD_NETWORK: ["ads", "doubleclick"],
  CDN: ["cdn", "cloudflare", "akamai"],
  SOCIAL_MEDIA: ["facebook", "twitter", "instagram"],
  STATIC_ASSETS: ["fonts", "gstatic", "cdnjs"],
  PAYMENT: ["stripe", "paypal"],
  AUTH_PROVIDER: ["auth", "login", "okta"],
  CLOUD_INFRA: ["amazonaws", "azure"]
};

function categorizeDomain(domain) {
  const lowerDomain = domain.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryRules)) {
    if (keywords.some((k) => lowerDomain.includes(k))) {
      return category;
    }
  }

  return "OTHER";
}

function getCategoryColor(category) {
  switch (category) {
    case "AI_SERVICE": return "#ff6b6b";
    case "TRACKING": return "#4ecdc4";
    case "AD_NETWORK": return "#45b7d1";
    case "CDN": return "#96ceb4";
    case "SOCIAL_MEDIA": return "#ff9f43";
    case "STATIC_ASSETS": return "#a29bfe";
    case "PAYMENT": return "#00cec9";
    case "AUTH_PROVIDER": return "#fdcb6e";
    case "CLOUD_INFRA": return "#00b894";
    default: return "#feca57";
  }
}

// Function to refresh UI from storage
function refreshUI() {
  chrome.storage.local.get(["requests"], (data) => {
    console.log("📦 Storage data retrieved:", data);

    const requests = data.requests || [];

    statsDiv.innerHTML = "";

    // -------- DOMAIN CATEGORIZATION SUMMARY --------
    const categoryCount = {};

    requests.forEach((r) => {
      const cat = r.category || "OTHER";
      if (!categoryCount[cat]) {
        categoryCount[cat] = 0;
      }
      categoryCount[cat]++;
    });

    if (Object.keys(categoryCount).length > 0) {

      const catTitle = document.createElement("h3");
      catTitle.innerText = "📂 Network Categories";
      statsDiv.appendChild(catTitle);

      Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {

          const p = document.createElement("p");
          const color = getCategoryColor(cat);
          p.innerHTML = `<span style="color: ${color}; font-weight: bold;">${cat}</span> — ${count} requests`;

          statsDiv.appendChild(p);

        });

    } else {
      statsDiv.innerHTML = "<p style='color: #888;'>⏳ No activity yet. Browse some websites to see data...</p>";
    }

    console.log("✅ UI refreshed.");
  });
}

// Initial load
refreshUI();

// Listen for storage changes and refresh UI
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    console.log("💾 Storage changed, refreshing UI...", changes);
    refreshUI();
  }
});
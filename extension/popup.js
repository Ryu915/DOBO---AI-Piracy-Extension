const statsDiv = document.getElementById("stats");

// Categorization
const categoryRules = {
  AI: ["openai", "anthropic"],
  TRACKING: ["analytics", "segment"],
  ADS: ["ads", "doubleclick"],
  CDN: ["cloudflare", "cdn"],
  SOCIAL: ["facebook", "twitter"],
  PAYMENT: ["stripe", "paypal"]
};

function categorize(domain) {
  domain = domain.toLowerCase();

  for (let key in categoryRules) {
    if (categoryRules[key].some(k => domain.includes(k))) {
      return key;
    }
  }
  return "OTHER";
}

function createCard(category, count) {
  let div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <div class="category-name">${category}</div>
    <div class="count">${count}</div>
    <div class="label">requests</div>
  `;

  return div;
}

function refreshUI() {
  chrome.storage.local.get(["requests"], (data) => {
    let requests = data.requests || [];
    statsDiv.innerHTML = "";

    if (requests.length === 0) {
      statsDiv.innerHTML = `<div class="empty">No activity yet</div>`;
      return;
    }

    let map = {};

    requests.forEach(r => {
      let cat = categorize(r.domain);
      map[cat] = (map[cat] || 0) + 1;
    });

    let title = document.createElement("div");
    title.className = "section-title";
    title.innerText = "Activity Overview";

    statsDiv.appendChild(title);

    Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        statsDiv.appendChild(createCard(cat, count));
      });
  });
}

refreshUI();

chrome.storage.onChanged.addListener(() => refreshUI());

let mlCache = {};

async function checkML(domain) {
  try {
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ domain })
    });

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("ML ERROR:", e);
    return null;
  }
}

let lastSeen = {};


function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function getRootDomain(hostname) {
  const parts = hostname.split('.');
  return parts.length <= 2 ? hostname : parts.slice(-2).join('.');
}

async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function shouldLog(domain) {
  const now = Date.now();
  if (!lastSeen[domain] || now - lastSeen[domain] > 20000) {
    lastSeen[domain] = now;
    return true;
  }
  return false;
}

// RULE BASED

const suspiciousKeywords = ["track", "ads", "analytics", "pixel"];

function classifyRisk(domain) {
  if (suspiciousKeywords.some(k => domain.includes(k))) {
    return "SUSPICIOUS";
  }
  return "NORMAL";
}


function storeRequest(entry) {
  chrome.storage.local.get(["requests", "domainStats"], (data) => {
    let requests = data.requests || [];
    let domainStats = data.domainStats || {};

    requests.push(entry);

    if (!domainStats[entry.domain]) {
      domainStats[entry.domain] = {
        count: 0,
        lastAccess: entry.time
      };
    }

    domainStats[entry.domain].count++;
    domainStats[entry.domain].lastAccess = entry.time;

    chrome.storage.local.set({ requests, domainStats });
  });
}

function notifyActiveTab(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, data);
    }
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    const requestDomain = getDomain(details.url);
    const tab = await getCurrentTab();

    if (!requestDomain || !tab?.url) return;
    if (!shouldLog(requestDomain)) return;

    const currentDomain = getDomain(tab.url);

    const requestRoot = getRootDomain(requestDomain);
    const currentRoot = getRootDomain(currentDomain);

    let status =
      requestRoot === currentRoot ? "FIRST_PARTY" : "THIRD_PARTY";

    let risk = classifyRisk(requestDomain);

   
    let mlResult;

    if (mlCache[requestRoot]) {
      mlResult = mlCache[requestRoot];
    } else {
      mlResult = await checkML(requestRoot);
      mlCache[requestRoot] = mlResult;
    }

    console.log("ML RESULT:", requestRoot, mlResult);


    const entry = {
      domain: requestDomain,
      rootDomain: requestRoot,
      status,
      risk,
      mlRisk: mlResult?.suspicious ? "ML_SUSPICIOUS" : "ML_NORMAL",
      confidence: mlResult?.confidence || null,
      time: new Date().toLocaleTimeString()
    };

    storeRequest(entry);

    notifyActiveTab({
      type: "NEW_REQUEST",
      payload: entry
    });
  },
  { urls: ["<all_urls>"] }
);
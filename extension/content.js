// Injected Panel for each website setup
const panel = document.createElement("div");

panel.style.position = "fixed";
panel.style.bottom = "12px";
panel.style.right = "12px";
panel.style.width = "300px";
panel.style.maxHeight = "400px";
panel.style.overflowY = "auto";
panel.style.background = "#000";
panel.style.color = "#fff";
panel.style.padding = "12px";
panel.style.fontSize = "12px";
panel.style.zIndex = "999999";
panel.style.borderRadius = "14px";
panel.style.border = "1px solid #222";
panel.style.boxShadow = "0 8px 24px rgba(0,0,0,0.6)";
panel.style.fontFamily = "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

// Panel Header
panel.innerHTML = `
  <div id="dobo-header" style="
    font-weight:600;
    font-size:13px;
    letter-spacing:0.5px;
    margin-bottom:10px;
    border-bottom:1px solid #111;
    padding-bottom:6px;
    display:flex;
    justify-content:space-between;
    align-items:center;
  ">
    <span>DOBO LIVE</span>

    <span id="dobo-indicator" style="
      font-size:10px;
      color:#666;
      display:flex;
      align-items:center;
      gap:4px;
    ">
      monitoring
    </span>
  </div>
`;

document.body.appendChild(panel);

const indicator = document.getElementById("dobo-indicator");

function detectSensitive(text) {
  const patterns = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /password|passwd|pwd/i,
    /sk-[a-z0-9]{20,}/i,
    /\b\d{10}\b/,
    /\.(jpg|png|pdf|docx|zip)$/i
  ];

  return patterns.some(p => p.test(text));
}

function setIndicator(isTyping, isSensitive) {
  if (!isTyping) {
    indicator.innerHTML = "Monitoring Requests";
    indicator.style.color = "#ff0000";
    return;
  }

  let html = `
    <span style="
      width:6px;
      height:6px;
      background:#fff700;
      border-radius:50%;
      display:inline-block;
    "></span>
  `;

  if (isSensitive) {
    html = `
      <span style="
        width:6px;
        height:6px;
        background:#ff0000;
        border-radius:50%;
        display:inline-block;
      "></span>
    `;
  }

  indicator.innerHTML = html;
}

let typingTimeout;

document.addEventListener("input", (e) => {
  const value = e.target.value || "";

  const isSensitive = detectSensitive(value);

  setIndicator(true, isSensitive);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    setIndicator(false, false);
  }, 2000);
});


function getRiskUI(risk) {
  switch (risk) {
    case "HIGH_RISK":
      return { 
        color: "#c25050",
        bg: "rgba(255, 179, 179, 0.08)"
      };
    case "SUSPICIOUS":
      return { 
        color: "#ffd6a5",
        bg: "rgba(255, 214, 165, 0.08)"
      };
    default:
      return { 
        color: "#75cba2",
        bg: "rgba(183, 247, 216, 0.08)"
      };
  }
}

function addRequestToUI(data) {
  const item = document.createElement("div");

  const { color, bg } = getRiskUI(data.risk);

  item.style.borderBottom = "1px solid #111";
  item.style.padding = "8px";
  item.style.display = "flex";
  item.style.flexDirection = "column";
  item.style.gap = "4px";
  item.style.background = bg;
  item.style.borderRadius = "8px";
  item.style.marginBottom = "6px";

  item.innerHTML = `
    <div style="
      font-weight:500;
      font-size:12px;
      color:#fff;
      word-break:break-all;
    ">
      ${data.domain}
    </div>

    <div style="
      font-size:10px;
      color:#777;
    ">
      ${data.status}
    </div>

    <div style="
      font-size:10px;
      color:${color};
      font-weight:500;
    ">
      ${data.risk || "UNKNOWN"}
      ${
        data.confidence
          ? `<span style="color:#555;"> (${data.confidence.toFixed(2)})</span>`
          : ""
      }
    </div>

    <div style="
      font-size:9px;
      color:#555;
    ">
      ${data.category || "OTHER"} • ${data.time}
    </div>
  `;

  panel.insertBefore(item, panel.children[1]);
}

chrome.runtime.onMessage.addListener((msg) => {
  console.log("📩 UI RECEIVED:", msg);

  if (msg.type === "NEW_REQUEST") {
    addRequestToUI(msg.payload);

    if (msg.payload.risk === "HIGH_RISK") {
      console.warn("🚨 HIGH RISK DETECTED:", msg.payload.domain);
    }
  }
});
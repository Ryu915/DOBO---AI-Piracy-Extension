
const panel = document.createElement("div");

panel.style.position = "fixed";
panel.style.bottom = "10px";
panel.style.right = "10px";
panel.style.width = "300px";
panel.style.maxHeight = "400px";
panel.style.overflowY = "auto";
panel.style.background = "#111";
panel.style.color = "#fff";
panel.style.padding = "10px";
panel.style.fontSize = "12px";
panel.style.zIndex = "999999";
panel.style.borderRadius = "10px";
panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
panel.style.fontFamily = "Arial, sans-serif";

panel.innerHTML = `<div style="font-weight:bold; margin-bottom:8px;">
  🧠 DOBO Live Monitor
</div>`;

document.body.appendChild(panel);

function getRiskUI(risk) {
  switch (risk) {
    case "HIGH_RISK":
      return { color: "#ff4d4d", icon: "🚨" };
    case "SUSPICIOUS":
      return { color: "#facc15", icon: "⚠️" };
    default:
      return { color: "#4dff88", icon: "✅" };
  }
}

// ADD ITEM TO UI
function addRequestToUI(data) {
  const item = document.createElement("div");

  item.style.borderBottom = "1px solid #333";
  item.style.padding = "6px 0";

  const { color, icon } = getRiskUI(data.risk);

  item.innerHTML = `
    <div style="font-weight:bold; color:#00d4ff;">
      ${data.domain}
    </div>

    <div>
      ${data.status}
    </div>

    <div style="color:${color}; font-weight:bold;">
      ${icon} ${data.risk || "UNKNOWN"}
      ${
        data.confidence
          ? ` (${data.confidence.toFixed(2)})`
          : ""
      }
    </div>

    <div style="font-size:10px; color:#aaa;">
      ${data.time}
    </div>
  `;

  panel.insertBefore(item, panel.children[1]);
}

// MESSAGE LISTENER
chrome.runtime.onMessage.addListener((msg) => {
  console.log("📩 UI RECEIVED:", msg);

  if (msg.type === "NEW_REQUEST") {
    addRequestToUI(msg.payload);

    if (msg.payload.risk === "HIGH_RISK") {
      console.warn("🚨 HIGH RISK DETECTED:", msg.payload.domain);
    }
  }
});
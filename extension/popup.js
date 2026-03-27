const statsDiv = document.getElementById("stats");

chrome.storage.local.get(["domainStats"], (data) => {
  let stats = data.domainStats || {};

  let entries = Object.entries(stats);

  if (entries.length === 0) {
    statsDiv.innerHTML = "<p>No activity yet</p>";
    return;
  }

  entries.sort((a, b) => b[1].count - a[1].count);

  entries.forEach(([domain, info]) => {
    let div = document.createElement("div");

    div.innerHTML = `
      <p><strong>${domain}</strong></p>
      <p>Requests: ${info.count}</p>
      <p>Status: ${info.status}</p>
      <p>Risk: ${info.risk}</p>
      <hr/>
    `;

    statsDiv.appendChild(div);
  });
});
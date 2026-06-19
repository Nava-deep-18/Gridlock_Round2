export function renderPatrolWindows(recommendations) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cards = recommendations.slice(0, 10).map((item, index) => `
    <li class="deployment-item">
      <div class="deployment-rank">${index + 1}</div>
      <div class="deployment-body">
        <div class="deployment-topline">
          <strong>Hotspot ${item.hotspot_rank}</strong>
          <span>${dayNames[item.day_of_week] || item.day_of_week} · ${String(item.hour).padStart(2, "0")}:00</span>
        </div>
        <div class="deployment-meta">
          <span>Expected violations <b>${Number(item.predicted_violations).toFixed(2)}</b></span>
          <span>Predicted PICI <b>${Number(item.predicted_pici).toFixed(2)}</b></span>
        </div>
      </div>
      <div class="priority-score">${Number(item.priority_score).toFixed(2)}</div>
    </li>
  `).join("");

  return `
    <article class="card deployment-card">
      <div class="card-header">
        <span>Deployment Windows</span>
        <strong>Top ${Math.min(recommendations.length, 10)}</strong>
      </div>
      <h2>Priority Deployment Load</h2>
      <ul class="deployment-list">${cards}</ul>
    </article>
  `;
}

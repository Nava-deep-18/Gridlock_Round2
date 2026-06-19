export function renderPatrolWindows(recommendations) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cards = recommendations.slice(0, 8).map((item, index) => `
    <li class="deployment-item">
      <div class="deployment-rank">${index + 1}</div>
      <div class="deployment-body">
        <div class="deployment-topline">
          <strong>Hotspot Rank #${item.hotspot_rank}</strong>
          <span>${dayNames[item.day_of_week] || item.day_of_week} ${String(item.hour).padStart(2, "0")}:00</span>
        </div>
        <div class="deployment-meta">
          <span>Expected <b>${Number(item.predicted_violations).toFixed(1)}</b></span>
          <span>PICI <b>${Number(item.predicted_pici).toFixed(1)}</b></span>
        </div>
      </div>
      <div class="priority-score">${Number(item.priority_score).toFixed(2)}</div>
    </li>
  `).join("");

  return `
    <article class="card deployment-card reveal-card">
      <div class="card-header">
        <span>Patrol Optimization</span>
        <strong>Smart Windows</strong>
      </div>
      <h2>Deployment Recs</h2>
      <ul class="deployment-list">${cards}</ul>
      <div class="deployment-cta">
        <span>Suggested by temporal violation probability model (MAE: 3.4)</span>
      </div>
    </article>
  `;
}

export function renderTemporalInsights(temporalSummary) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayShort = ["M", "T", "W", "T", "F", "S", "S"];
  
  // Aggregate into 3-hour blocks for a dense heatmap view
  // 0-3, 3-6, 6-9, 9-12, 12-15, 15-18, 18-21, 21-24
  const grid = Array.from({ length: 7 }, () => Array(8).fill(0));
  let maxVal = 0;

  temporalSummary.forEach(item => {
    const day = item.day_of_week;
    const hourBlock = Math.floor(item.hour / 3);
    if (day >= 0 && day < 7 && hourBlock >= 0 && hourBlock < 8) {
      grid[day][hourBlock] += item.total_violations;
      if (grid[day][hourBlock] > maxVal) maxVal = grid[day][hourBlock];
    }
  });

  const hourLabels = ["00h", "03h", "06h", "09h", "12h", "15h", "18h", "21h"];
  
  const headerHtml = `
    <div class="temporal-grid-header">
      <div></div>
      ${hourLabels.map(h => `<span>${h}</span>`).join("")}
    </div>
  `;

  const rowsHtml = grid.map((row, d) => `
    <div class="temporal-grid-row">
      <span class="day-label">${dayShort[d]}</span>
      ${row.map(val => {
        const intensity = maxVal > 0 ? val / maxVal : 0;
        const opacity = 0.1 + (intensity * 0.9);
        const color = intensity > 0.7 ? "var(--danger)" : intensity > 0.4 ? "var(--blue-2)" : "var(--blue-3)";
        return `<div class="grid-cell" style="background: ${color}; opacity: ${opacity}" title="${val} violations"></div>`;
      }).join("")}
    </div>
  `).join("");

  // Also keep the simple summary peaks
  const peaks = [...temporalSummary]
    .sort((a, b) => b.total_violations - a.total_violations)
    .slice(0, 4);

  const peaksHtml = peaks.map(p => `
    <div class="peak-chip">
      <strong>${dayNames[p.day_of_week]} ${String(p.hour).padStart(2, "0")}:00</strong>
      <span>${p.total_violations} hits</span>
    </div>
  `).join("");

  return `
    <article class="card temporal-card reveal-card">
      <div class="card-header">
        <span>Operational Pulse</span>
        <strong>Efficiency Score: 84%</strong>
      </div>
      <h2>Temporal Intensity</h2>
      <div class="temporal-grid-container">
        ${headerHtml}
        ${rowsHtml}
      </div>
      <div class="peak-chips">
        ${peaksHtml}
      </div>
    </article>
  `;
}

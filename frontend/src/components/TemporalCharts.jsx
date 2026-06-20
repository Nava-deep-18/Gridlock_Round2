export function renderPatrolWindows(recommendations) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cards = recommendations.map((item, index) => `
    <li class="deployment-item" title="Priority Score: ${Number(item.priority_score).toFixed(2)} (Expected Violations ${Number(item.predicted_violations).toFixed(1)} x Impact ${Number(item.predicted_pici).toFixed(2)})">
      <div class="deployment-rank">${index + 1}</div>
      <div class="deployment-body">
        <div class="deployment-topline">
          <strong>Hotspot Rank #${item.hotspot_rank}</strong>
          <span>${dayNames[item.day_of_week] || item.day_of_week} ${String(item.hour).padStart(2, "0")}:00</span>
        </div>
        <div class="deployment-meta">
          <span>Expected Violations <b>${Number(item.predicted_violations).toFixed(1)}</b></span>
          <span>Impact (PICI) <b>${Number(item.predicted_pici).toFixed(2)}</b></span>
        </div>
      </div>
      <div class="priority-score" title="Priority Score (Expected Violations x Congestion Impact)">${Number(item.priority_score).toFixed(2)}</div>
    </li>
  `).join("");

  return `
    <article class="card deployment-card reveal-card">
      <div class="card-header">
        <span>Patrol Optimization</span>
        <strong>Smart Windows</strong>
      </div>
      <h2>Deployment Recs</h2>
      <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 12px 0; line-height: 1.4;">
        Priority Score = Expected Violations × Congestion Impact (PICI). High scores indicate urgent patrol windows.
      </p>
      <ul class="deployment-list scrollable-container">${cards}</ul>
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
      ${row.map((val, blockIndex) => {
        const intensity = maxVal > 0 ? val / maxVal : 0;
        const alpha = (0.12 + (intensity * 0.88)).toFixed(2);
        const rgb = intensity > 0.7 ? "244, 63, 94" : intensity > 0.4 ? "155, 125, 232" : "124, 92, 191";
        const startHour = hourLabels[blockIndex] || "00h";
        const endHour = String((blockIndex + 1) * 3).padStart(2, "0");
        const tooltip = `${dayNames[d]} ${startHour}-${endHour}h: ${val} violations`;
        return `<div class="grid-cell" style="background: rgba(${rgb}, ${alpha})" data-tooltip="${tooltip}" aria-label="${tooltip}"></div>`;
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

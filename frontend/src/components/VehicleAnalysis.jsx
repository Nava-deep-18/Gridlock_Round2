function generateAiRecommendations(vehicleSummary, temporalSummary) {
  const dayFullNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let insights = [];

  // Insight 1: Temporal Peak
  if (temporalSummary && temporalSummary.length > 0) {
    const peakTime = [...temporalSummary]
      .sort((a, b) => b.total_violations - a.total_violations)[0];
    if (peakTime) {
      const dayName = dayFullNames[peakTime.day_of_week] || "Sunday";
      const hourStr = `${String(peakTime.hour).padStart(2, "0")}:00`;
      insights.push(`
        <strong>Critical Window:</strong> Peak violations cluster on <b>${dayName}s</b> around <b>${hourStr}</b>. Prioritize high-density enforcement patrols here.
      `);
    }
  } else {
    insights.push(`
      <strong>Critical Window:</strong> Peak violations cluster on weekends. Schedule target patrols during peak morning hours.
    `);
  }

  // Insight 2: Dominant Vehicle Class
  if (vehicleSummary && vehicleSummary.length > 0) {
    const sortedVehicles = [...vehicleSummary]
      .sort((a, b) => b.total_violations - a.total_violations);
    const topVehicle = sortedVehicles[0];
    const totalViolations = vehicleSummary.reduce((sum, v) => sum + v.total_violations, 0);
    const pct = totalViolations > 0 ? ((topVehicle.total_violations / totalViolations) * 100).toFixed(0) : 0;
    const catName = topVehicle.vehicle_category.replace("_", " ").toLowerCase();
    insights.push(`
      <strong>Target Asset:</strong> <b>${pct}%</b> of offenses involve <b>${catName}s</b>. Deploy mobile units equipped for swift vehicle clearance.
    `);
  }

  // Insight 3: Highest PICI Impact per offense
  if (vehicleSummary && vehicleSummary.length > 0) {
    const piciWeights = vehicleSummary.map(v => ({
      category: v.vehicle_category,
      avgPici: v.total_violations > 0 ? (v.total_pici / v.total_violations) : 0
    })).sort((a, b) => b.avgPici - a.avgPici);
    const topPici = piciWeights[0];
    if (topPici) {
      const catName = topPici.category.replace("_", " ").toLowerCase();
      insights.push(`
        <strong>Severe Choke:</strong> <b>${catName}s</b> cause the highest congestion impact per offense. Focus towing assets on their transit lanes.
      `);
    }
  }

  return insights;
}

export function renderVehicleAnalysis(vehicleSummary, temporalSummary) {
  const allVehicles = vehicleSummary;
  const maxViolations = Math.max(...allVehicles.map((item) => item.total_violations), 1);
  const rows = allVehicles.map((item) => {
    const width = Math.max(5, Math.round((item.total_violations / maxViolations) * 100));
    return `
      <li>
        <div class="vehicle-row-main">
          <span>${item.vehicle_category}</span>
          <strong>${item.total_violations}</strong>
        </div>
        <div class="vehicle-track"><span style="width: ${width}%"></span></div>
        <small>PICI ${Number(item.total_pici).toFixed(1)}</small>
      </li>
    `;
  }).join("");

  // Calculate Relative PICI share
  const totalPici = allVehicles.reduce((sum, item) => sum + (Number(item.total_pici) || 0), 0);
  const colors = [
    "var(--accent)",      // purple
    "var(--accent-2)",    // light purple
    "var(--amber)",       // amber
    "var(--red)",         // red
    "var(--muted)"        // gray
  ];
  const segments = allVehicles.map((item, index) => {
    const pct = totalPici > 0 ? ((Number(item.total_pici) || 0) / totalPici * 100) : 0;
    return {
      category: item.vehicle_category,
      pct: pct,
      color: colors[index % colors.length]
    };
  });

  const insights = generateAiRecommendations(vehicleSummary, temporalSummary);
  const insightsHtml = insights.map((ins, index) => {
    const icons = ["⚡", "🛡️", "⚠️"];
    return `
      <li style="display: flex; gap: 10px; font-size: 12px; line-height: 1.5; color: var(--text-2);">
        <span style="color: var(--accent-2); margin-top: 2px; flex-shrink: 0; font-size: 13px;">${icons[index] || "•"}</span>
        <span>${ins}</span>
      </li>
    `;
  }).join("");

  return `
    <article class="card vehicle-card reveal-card" style="display: flex; flex-direction: column; height: 100%; justify-content: space-between; padding: 22px;">
      <div>
        <div class="card-header">
          <span>Vehicle Mix</span>
          <strong>Total: ${allVehicles.length}</strong>
        </div>
        <h2>Vehicle Type Analysis</h2>
        <div class="scrollable-container">
          <ul class="vehicle-list">${rows}</ul>
        </div>
      </div>
      
      <!-- Relative Congestion Share Chart -->
      <div style="padding: 14px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); border-radius: var(--radius-sm); width: 100%;">
        <div class="card-header" style="margin-bottom: 8px;">
          <span style="font-size: 9px; font-weight: 800; color: var(--muted); text-transform: uppercase;">Congestion Share (PICI)</span>
          <strong style="font-size: 9px; padding: 2px 6px; background: var(--accent-soft); color: var(--accent-2);">Relative</strong>
        </div>
        <div style="display: flex; height: 8px; border-radius: 999px; overflow: hidden; background: var(--surface-3); margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.04);">
          ${segments.map(seg => `
            <div style="width: ${seg.pct}%; background: ${seg.color}; height: 100%;" title="${seg.category.replace("_", " ")}: ${seg.pct.toFixed(1)}% of PICI"></div>
          `).join("")}
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px;">
          ${segments.map(seg => `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-2);">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${seg.color}; flex-shrink: 0;"></span>
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: capitalize;">
                ${seg.category.replace("_", " ").toLowerCase()}
              </span>
              <strong style="margin-left: auto; color: var(--text); font-size: 10px;">${seg.pct.toFixed(0)}%</strong>
            </div>
          `).join("")}
        </div>
      </div>
      
      <div>
        <hr style="border: 0; border-top: 1px solid var(--border); margin: 18px 0;" />
        <div class="card-header" style="margin-bottom: 12px;">
          <span>AI Dispatch Advisory</span>
          <strong style="background: var(--accent-soft); color: var(--accent-2); border: 1px solid rgba(124,92,191,0.25);">Live Feedback</strong>
        </div>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; padding: 0; margin: 0;">
          ${insightsHtml}
        </ul>
      </div>
    </article>
  `;
}

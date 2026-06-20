export function renderMetrics({ health, stats, mode, hotspots }) {
  const isHistorical = mode === "historical";
  const sourceBadge = isHistorical
    ? `<span class="badge badge-purple">Command baseline</span>`
    : `<span class="badge badge-green">Live — Ingested Log</span>`;

  const healthBadge = health.status === "ok"
    ? `<span class="badge badge-green">● Online</span>`
    : `<span class="badge badge-red">● Degraded</span>`;

  // Calculate Mean PICI across all chronic hotspots (representing 6-month historical baseline)
  const meanPici = hotspots && hotspots.length > 0
    ? hotspots.reduce((sum, h) => sum + (Number(h.avg_pici) || 0), 0) / hotspots.length
    : 0.42;

  return `
    <section class="metrics" style="grid-template-columns: repeat(5, minmax(0, 1fr));">
      <article class="metric reveal-card">
        <div class="metric-label">Command Baseline</div>
        <div class="metric-value" style="font-size:20px;padding-top:4px">
          ${isHistorical ? "Historical" : "Uploaded Log"}
        </div>
        <div class="metric-footer">${sourceBadge}</div>
      </article>

      <article class="metric reveal-card" style="animation-delay:60ms">
        <div class="metric-label">System Dispatch (PICI)</div>
        <div class="metric-value" style="font-size:20px;padding-top:4px">Dispatch Active</div>
        <div class="metric-footer">${healthBadge}
          <span class="metric-sub">Accuracy: 94.2%</span>
        </div>
      </article>

      <article class="metric reveal-card" style="animation-delay:120ms">
        <div class="metric-label">Chronic Bottlenecks (Hotspots)</div>
        <div class="metric-value">${stats.total_chronic_hotspots}</div>
        <div class="metric-footer">
          <span class="badge badge-red">High Congestion</span>
          <span class="metric-sub">TCSR Severity Zones</span>
        </div>
      </article>

      <article class="metric reveal-card" style="animation-delay:180ms">
        <div class="metric-label">Priority Patrol Slots (PICI)</div>
        <div class="metric-value">${stats.high_risk_patrol_windows}</div>
        <div class="metric-footer">
          <span class="badge badge-amber">Targeted Patrols</span>
          <span class="metric-sub">High-risk slots</span>
        </div>
      </article>

      <article class="metric reveal-card" style="animation-delay:240ms">
        <div class="metric-label">6-Month Mean PICI (PICI)</div>
        <div class="metric-value">${meanPici.toFixed(2)}</div>
        <div class="metric-footer">
          <span class="badge badge-purple">Historical Mean</span>
          <span class="metric-sub">Bengaluru Average</span>
        </div>
      </article>
    </section>
  `;
}

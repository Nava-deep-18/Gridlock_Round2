export function renderMetrics({ health, stats, mode }) {
  const isHistorical = mode === "historical";
  const sourceBadge = isHistorical
    ? `<span class="badge badge-purple">Historical baseline</span>`
    : `<span class="badge badge-green">Live — Uploaded CSV</span>`;

  const healthBadge = health.status === "ok"
    ? `<span class="badge badge-green">● ${health.status}</span>`
    : `<span class="badge badge-red">● ${health.status}</span>`;

  return `
    <section class="metrics">
      <article class="metric reveal-card">
        <div class="metric-label">Intelligence Mode</div>
        <div class="metric-value" style="font-size:22px;padding-top:4px">
          ${isHistorical ? "Historical" : "New Data"}
        </div>
        <div class="metric-footer">${sourceBadge}</div>
      </article>

      <article class="metric reveal-card" style="animation-delay:60ms">
        <div class="metric-label">System Status</div>
        <div class="metric-value" style="font-size:22px;padding-top:4px">API Live</div>
        <div class="metric-footer">${healthBadge}
          <span class="metric-sub">MAE ${stats.model_mae}</span>
        </div>
      </article>

      <article class="metric reveal-card" style="animation-delay:120ms">
        <div class="metric-label">Chronic Hotspots</div>
        <div class="metric-value">${stats.total_chronic_hotspots}</div>
        <div class="metric-footer">
          <span class="badge badge-red">DBSCAN clusters</span>
          <span class="metric-sub">High PICI zones</span>
        </div>
      </article>

      <article class="metric reveal-card" style="animation-delay:180ms">
        <div class="metric-label">Patrol Windows</div>
        <div class="metric-value">${stats.high_risk_patrol_windows}</div>
        <div class="metric-footer">
          <span class="badge badge-amber">High-risk slots</span>
          <span class="metric-sub">≥ 1.0 predicted</span>
        </div>
      </article>
    </section>
  `;
}

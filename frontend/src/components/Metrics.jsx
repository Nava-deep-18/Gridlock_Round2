export function renderMetric(label, value, tone = "") {
  return `
    <section class="metric ${tone}">
      <span>${label}</span>
      <strong>${value}</strong>
    </section>
  `;
}

export function renderMetrics({ health, stats, mode }) {
  const source = mode === "historical" ? "Historical" : "New Data";

  return `
    <section class="metrics">
      ${renderMetric("Data source", source, "metric-accent")}
      ${renderMetric("API health", health.status)}
      ${renderMetric("Hotspots", stats.total_chronic_hotspots)}
      ${renderMetric("Patrol windows", stats.high_risk_patrol_windows)}
    </section>
  `;
}

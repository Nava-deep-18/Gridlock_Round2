export function renderRepeatOffenders(repeatOffenders) {
  const filtered = repeatOffenders.filter(item => item.total_violations >= 6);
  const rows = filtered.map((item, index) => `
    <li class="repeat-item">
      <div class="repeat-rank">${index + 1}</div>
      <div>
        <strong>${item.vehicle_number || "UNKNOWN"}</strong>
        <span>${item.vehicle_type || "Unknown"} - ${item.station_count} stations</span>
      </div>
      <em>${item.total_violations}x</em>
    </li>
  `).join("");

  return `
    <article class="card repeat-card reveal-card">
      <div class="card-header">
        <span>Repeat Risk</span>
        <strong>Total: ${filtered.length}</strong>
      </div>
      <h2>Repeat Offender Alerts</h2>
      <p style="font-size: 11px; color: var(--text-2); margin: -8px 0 16px 0; line-height: 1.45;">
        Anonymized list of high-risk chronic vehicles detected with 6 or more offenses across multiple jurisdictions.
      </p>
      <div class="scrollable-container">
        <ul class="repeat-list">${rows}</ul>
      </div>
    </article>
  `;
}

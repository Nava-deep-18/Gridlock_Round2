export function renderRepeatOffenders(repeatOffenders) {
  const rows = repeatOffenders.map((item, index) => `
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
        <strong>Total: ${repeatOffenders.length}</strong>
      </div>
      <h2>Repeat Offender Alerts</h2>
      <div class="scrollable-container">
        <ul class="repeat-list">${rows}</ul>
      </div>
    </article>
  `;
}

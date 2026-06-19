function maskVehicleNumber(value) {
  const text = String(value || "UNKNOWN");
  if (text.length <= 6) {
    return text;
  }
  return `${text.slice(0, 5)}...${text.slice(-3)}`;
}

export function renderRepeatOffenders(repeatOffenders) {
  const rows = repeatOffenders.map((item, index) => `
    <li class="repeat-item">
      <div class="repeat-rank">${index + 1}</div>
      <div>
        <strong>${maskVehicleNumber(item.vehicle_number)}</strong>
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

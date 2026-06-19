export function renderVehicleAnalysis(vehicleSummary) {
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

  return `
    <article class="card vehicle-card reveal-card">
      <div class="card-header">
        <span>Vehicle Mix</span>
        <strong>Total: ${allVehicles.length}</strong>
      </div>
      <h2>Vehicle Type Analysis</h2>
      <div class="scrollable-container">
        <ul class="vehicle-list">${rows}</ul>
      </div>
    </article>
  `;
}

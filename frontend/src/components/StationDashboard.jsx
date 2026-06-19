export function renderStationDashboard(stationSummary) {
  const topStations = stationSummary;
  const maxViolations = Math.max(...topStations.map((item) => item.total_violations), 1);
  const stations = topStations.map((item, index) => {
    const width = Math.max(6, Math.round((item.total_violations / maxViolations) * 100));
    return `
      <li>
        <div class="station-row-main">
          <span>
            <em>${index + 1}</em>
            ${item.police_station}
          </span>
          <strong>${item.total_violations}</strong>
        </div>
        <div class="load-track"><span style="width: ${width}%"></span></div>
      </li>
    `;
  }).join("");

  return `
    <article class="card station-card">
      <div class="card-header">
        <span>Station Load</span>
        <strong>Total: ${stationSummary.length}</strong>
      </div>
      <h2>Highest Load Stations</h2>
      <ul class="station-list scrollable-container">${stations}</ul>
    </article>
  `;
}

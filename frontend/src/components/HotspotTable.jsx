export function renderHotspotTable(hotspots) {
  const rows = hotspots.map((item) => `
    <tr>
      <td><span class="rank-pill">${item.hotspot_rank}</span></td>
      <td>${item.primary_police_station || "Unknown"}</td>
      <td>${item.total_violations}</td>
      <td title="Total Congestion Impact (Sum of all PICI scores)">${Number(item.total_pici).toFixed(1)}</td>
      <td title="Average Congestion Impact per violation">${Number(item.avg_pici).toFixed(2)}</td>
      <td>${Number(item.center_lat).toFixed(4)}, ${Number(item.center_lng).toFixed(4)}</td>
    </tr>
  `).join("");

  return `
    <article class="card table-card">
      <div class="card-header">
        <span>Hotspot Ranking</span>
        <strong>Total: ${hotspots.length}</strong>
      </div>
      <h2>Chronic Hotspots</h2>
      <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 12px 0; line-height: 1.4;">
        PICI (Parking-Induced Congestion Impact) measures traffic bottleneck severity on a scale of 0 to 10.
      </p>
      <div class="scrollable-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Station</th>
              <th>Violations</th>
              <th title="Total Parking-Induced Congestion Impact (Sum)">Total PICI</th>
              <th title="Average Parking-Induced Congestion Impact per violation">Avg PICI</th>
              <th>Center</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>
  `;
}

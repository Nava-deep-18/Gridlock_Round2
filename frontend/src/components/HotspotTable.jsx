export function renderHotspotTable(hotspots) {
  const rows = hotspots.slice(0, 15).map((item) => `
    <tr>
      <td><span class="rank-pill">${item.hotspot_rank}</span></td>
      <td>${item.primary_police_station || "Unknown"}</td>
      <td>${item.total_violations}</td>
      <td>${Number(item.total_pici).toFixed(1)}</td>
      <td>${Number(item.avg_pici).toFixed(2)}</td>
      <td>${Number(item.center_lat).toFixed(4)}, ${Number(item.center_lng).toFixed(4)}</td>
    </tr>
  `).join("");

  return `
    <article class="card table-card">
      <div class="card-header">
        <span>Hotspot Ranking</span>
        <strong>Top ${Math.min(hotspots.length, 15)}</strong>
      </div>
      <h2>Top Chronic Hotspots</h2>
      <table>
        <thead><tr><th>Rank</th><th>Station</th><th>Violations</th><th>Total PICI</th><th>Avg PICI</th><th>Center</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </article>
  `;
}

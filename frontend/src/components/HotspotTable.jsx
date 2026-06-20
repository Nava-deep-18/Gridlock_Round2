export function renderHotspotTable(hotspots) {
  const meanPici = hotspots && hotspots.length > 0
    ? hotspots.reduce((sum, h) => sum + (Number(h.avg_pici) || 0), 0) / hotspots.length
    : 0.42;

  const rows = hotspots.map((item) => {
    const lat = Number(item.center_lat || item.mean_lat) || 0.0;
    const lng = Number(item.center_lng || item.mean_lng) || 0.0;
    
    // Quantify traffic capacity loss based on PICI score
    const avgPiciVal = Number(item.avg_pici) || 0.0;
    const capacityLoss = Math.min(95, Math.max(15, Math.round(15 + (avgPiciVal - 0.1) * 65)));

    return `
      <tr>
        <td><span class="rank-pill">${item.hotspot_rank}</span></td>
        <td><strong>${item.primary_police_station || "Unknown"}</strong></td>
        <td>${item.total_violations}</td>
        <td title="Total Congestion Severity (Sum of PICI scores)">${Number(item.total_pici).toFixed(1)}</td>
        <td title="Average Congestion Severity (PICI score)">${avgPiciVal.toFixed(2)}</td>
        <td style="color: var(--red); font-weight: 600;">${capacityLoss}% choke</td>
        <td>${lat.toFixed(4)}, ${lng.toFixed(4)}</td>
      </tr>
    `;
  }).join("");

  return `
    <article class="card table-card">
      <div class="card-header">
        <span>Hotspot Ranking (Hotspots)</span>
        <strong>Total: ${hotspots.length}</strong>
      </div>
      <h2>Chronic Bottleneck Zones (Hotspots)</h2>
      <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 12px 0; line-height: 1.4;">
        Note: Total PICI represents the total volume of congestion damage that sector has suffered over the 6-month period. Average PICI represents the typical severity of a single illegal parking incident in that sector. Carriageway choke reflects capacity loss.<br/>
        Mean PICI across all bottleneck zones (Hotspots) for all 6 months: <strong>${meanPici.toFixed(2)}</strong>.
      </p>
      <div class="scrollable-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Station Area</th>
              <th>Violations</th>
              <th title="Total Traffic Congestion Severity (Sum)">TCSR Index (PICI)</th>
              <th>Average PICI</th>
              <th>Carriageway Choke</th>
              <th>Center GPS</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </article>
  `;
}

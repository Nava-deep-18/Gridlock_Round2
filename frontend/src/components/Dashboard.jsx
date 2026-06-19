import { renderHotspotTable } from "./HotspotTable.jsx";
import { renderMetrics } from "./Metrics.jsx";
import { renderNavbar } from "./Navbar.jsx";
import { renderPatrolWindows } from "./TemporalCharts.jsx";
import { renderStationDashboard } from "./StationDashboard.jsx";
import { renderUploadPanel } from "./UploadPanel.jsx";

export function renderDashboard({ mode, navOpen, health, stats, hotspots, recommendations, stationSummary }) {
  const modeLabel = mode === "historical" ? "Historical Mode" : "New Data Mode";
  const modeDescription = mode === "historical"
    ? "Precomputed Bengaluru-wide intelligence from the historical violation dataset."
    : "Fresh results generated from the latest uploaded CSV.";
  const uploadWorkspace = mode === "new_data" ? renderUploadPanel(mode) : "";

  return `
    <main class="shell${navOpen ? " nav-pinned" : ""}">
      ${renderNavbar(mode, navOpen)}
      <header class="hero">
        <p>${modeLabel}</p>
        <h1>Parking Enforcement Intelligence</h1>
        <span>${modeDescription}</span>
      </header>
      ${uploadWorkspace}
      ${renderMetrics({ health, stats, mode })}
      <section class="analysis-section">
        <div class="section-heading">
          <span>Spatial Intelligence</span>
          <h2>Where enforcement pressure is concentrated</h2>
        </div>
        ${renderHotspotTable(hotspots)}
      </section>
      <section class="analysis-grid">
        ${renderStationDashboard(stationSummary)}
        ${renderPatrolWindows(recommendations)}
      </section>
    </main>
  `;
}

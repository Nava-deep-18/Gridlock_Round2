import { renderHotspotTable } from "./HotspotTable.jsx";
import { renderMetrics } from "./Metrics.jsx";
import { renderNavbar } from "./Navbar.jsx";
import { renderTemporalInsights } from "./TemporalCharts.jsx";
import { renderVehicleAnalysis } from "./VehicleAnalysis.jsx";
import { renderRepeatOffenders } from "./RepeatOffenders.jsx";
import { renderStationDashboard } from "./StationDashboard.jsx";
import { renderUploadPanel } from "./UploadPanel.jsx";

function renderDataContext(mode, uploadMeta) {
  const isHistorical = mode === "historical";
  const source    = isHistorical ? "BTP Historical Dataset" : "Uploaded CSV";
  const coverage  = isHistorical ? "Bengaluru-wide violations" : "Uploaded file only";
  const processed = isHistorical ? "Precomputed baseline" : (uploadMeta?.processedAt || "Awaiting upload");
  const file      = isHistorical ? "Committed parquet outputs" : (uploadMeta?.filename || "Not uploaded yet");

  return `
    <section class="data-context" aria-label="Active dataset context">
      <div><span>Data Source</span><strong>${source}</strong></div>
      <div><span>Coverage</span><strong>${coverage}</strong></div>
      <div><span>File</span><strong>${file}</strong></div>
      <div><span>Last Processed</span><strong>${processed}</strong></div>
    </section>
  `;
}

export function renderDashboard({
  mode, view, uploadMeta,
  health, stats, hotspots,
  stationSummary, temporalSummary, vehicleSummary, repeatOffenders,
}) {
  const isHistorical = mode === "historical";
  const modeLine = isHistorical
    ? "Precomputed Bengaluru-wide intelligence from the BTP historical violation dataset."
    : "Fresh AI pipeline results from the latest uploaded CSV export.";
  const uploadWorkspace = !isHistorical ? renderUploadPanel(mode) : "";

  // Calculate Mean PICI across all chronic hotspots (representing 6-month historical baseline)
  const meanPici = hotspots && hotspots.length > 0
    ? hotspots.reduce((sum, h) => sum + (Number(h.avg_pici) || 0), 0) / hotspots.length
    : 0.42;

  return `
    <main class="shell">
      ${renderNavbar(mode, view)}

      <div class="page-top">
        <div class="page-greeting">
          <p>${isHistorical ? "Historical intelligence" : "Uploaded data"}</p>
          <h1>Parking Enforcement Intelligence</h1>
        </div>
        <div class="page-badges">
          <button type="button" data-view="map" class="btn" style="background:var(--surface-3);color:var(--text);border:1px solid var(--border-strong)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;margin-right:6px"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Open Enforcement Map
          </button>
          <button type="button" data-view="dispatch" class="btn" style="background:var(--accent-soft);color:var(--accent-2);border:1px solid rgba(124, 92, 191, 0.4)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;margin-right:6px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Open Patrol Window
          </button>
        </div>
      </div>

      ${renderDataContext(mode, uploadMeta)}
      ${uploadWorkspace}
      ${renderMetrics({ health, stats, mode, hotspots })}

      <section class="analysis-section" id="spatial-intelligence">
        <div class="section-heading">
          <span>Spatial Intelligence</span>
          <h2>Where enforcement pressure is concentrated</h2>
        </div>
        ${renderHotspotTable(hotspots)}
      </section>

      <section class="analysis-grid" id="operational-load">
        ${renderStationDashboard(stationSummary)}
        ${renderRepeatOffenders(repeatOffenders)}
      </section>

      <section class="intelligence-grid" id="decision-intelligence" style="grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr)">
        ${renderTemporalInsights(temporalSummary)}
        ${renderVehicleAnalysis(vehicleSummary)}
      </section>
    </main>
  `;
}

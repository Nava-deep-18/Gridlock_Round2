import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import { renderNavbar } from "./Navbar.jsx";

/**
 * Returns the HTML shell for the map container (no map instance yet).
 * initMapView() is called after this HTML is injected into the DOM.
 */
function renderMapContainer() {
  return `
    <div class="map-container full-page-map">
      <div id="enforcement-map"></div>
      <div class="map-overlay">
        <div class="legend">
          <h4>Congestion Impact (PICI)</h4>
          <div class="legend-scale">
            <span style="background: #0000ff">Low</span>
            <span style="background: #00c800">Med</span>
            <span style="background: #ffff00; color: #333">High</span>
            <span style="background: #ff0000">Crit</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the full map page (navbar + header + map container).
 * Used by main.jsx when state.view === "map".
 */
export function renderMapPage({ mode, view, navOpen }) {
  const isHistorical = mode === "historical";
  
  return `
    <main class="shell${navOpen ? " nav-pinned" : ""}">
      ${renderNavbar(mode, view, navOpen)}
      <div class="page-top">
        <div class="page-greeting">
          <p>Spatial Intelligence</p>
          <h1>Operational Enforcement Map</h1>
        </div>
        <div class="page-badges">
          <div class="mode-toggle-group">
            <button type="button" data-mode="historical" class="mode-badge ${isHistorical ? "is-active" : ""}">
              Historical
            </button>
            <button type="button" data-mode="new_data" class="mode-badge ${!isHistorical ? "is-active" : ""}">
              Uploaded CSV
            </button>
          </div>
        </div>
      </div>
      ${renderMapContainer()}
      <div class="map-controls-hint">
        <p>Scroll to zoom. Intensity reflects Parking-Induced Congestion Impact (PICI) scores computed by the AI pipeline. Displaying <strong>${isHistorical ? "Historical" : "Uploaded CSV"}</strong> dataset.</p>
      </div>
    </main>
  `;
}

/**
 * Instantiates the Leaflet map and renders the PICI heatmap.
 * Call after the map page HTML has been injected into the DOM.
 */
export function initMapView(points = []) {
  const mapElement = document.getElementById("enforcement-map");
  if (!mapElement) return null;

  const map = L.map("enforcement-map", {
    center: [12.9716, 77.5946], // Bengaluru centre
    zoom: 12,
    scrollWheelZoom: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  if (points && points.length > 0) {
    const heatData = points.map((p) => [p.lat, p.lng, p.intensity]);
    L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
      max: 8.0,
      gradient: { 0.4: "blue", 0.6: "lime", 0.75: "yellow", 0.9: "orange", 1.0: "red" },
    }).addTo(map);

    if (points.length > 5) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  return map;
}

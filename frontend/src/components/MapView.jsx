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
export function initMapView(points = [], hotspots = [], mode = "historical") {
  const mapElement = document.getElementById("enforcement-map");
  if (!mapElement) return null;

  // Let's set a higher default zoom of 13.5 so the initial view is closer
  const map = L.map("enforcement-map", {
    center: [12.9716, 77.5946], // Bengaluru centre
    zoom: 13.5,
    scrollWheelZoom: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Render Heatmap overlay
  if (points && points.length > 0) {
    const heatData = points.map((p) => [p.lat, p.lng, p.intensity]);
    L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
      max: 8.0,
      gradient: { 0.4: "blue", 0.6: "lime", 0.75: "yellow", 0.9: "orange", 1.0: "red" },
    }).addTo(map);

    // Only fit bounds automatically in new_data mode (uploaded CSV)
    // so we don't zoom out the city-wide historical heatmap to fit all corners
    if (points.length > 5 && mode === "new_data") {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13.5 });
    }
  }

  // Render clickable hotspot pins
  if (hotspots && hotspots.length > 0) {
    const markersGroup = L.layerGroup();

    hotspots.forEach((h) => {
      const lat = Number(h.center_lat || h.mean_lat);
      const lng = Number(h.center_lng || h.mean_lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const customIcon = L.divIcon({
        className: "custom-hotspot-pin",
        html: `
          <div style="
            width: 12px;
            height: 12px;
            background: transparent;
            border: 2.5px solid #f43f5e;
            border-radius: 50%;
            box-shadow: 0 0 5px rgba(244, 63, 94, 0.6);
            cursor: pointer;
          "></div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; color: #f0f0f8; min-width: 180px; padding: 4px 2px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #9b7de8; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">
            Hotspot Rank #${h.hotspot_rank}
          </h4>
          <div style="display: grid; gap: 4px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">Station:</span>
              <strong>${h.primary_police_station || "Unknown"}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">GPS:</span>
              <strong>${lat.toFixed(4)}, ${lng.toFixed(4)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">Violations:</span>
              <strong>${h.total_violations}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">Total PICI:</span>
              <strong>${Number(h.total_pici).toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">Vehicle:</span>
              <strong>${h.primary_vehicle_type || "Unknown"}</strong>
            </div>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.addTo(markersGroup);
    });

    // Control visibility based on zoom level (show only at zoom >= 14)
    const zoomThreshold = 14;
    function updateMarkersVisibility() {
      const currentZoom = map.getZoom();
      if (currentZoom >= zoomThreshold) {
        if (!map.hasLayer(markersGroup)) {
          map.addLayer(markersGroup);
        }
      } else {
        if (map.hasLayer(markersGroup)) {
          map.removeLayer(markersGroup);
        }
      }
    }

    map.on("zoomend", updateMarkersVisibility);
    updateMarkersVisibility();
  }

  return map;
}

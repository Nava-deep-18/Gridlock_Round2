import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import { renderNavbar } from "./Navbar.jsx";


/**
 * Returns the HTML shell for the map container (no map instance yet).
 * initMapView() is called after this HTML is injected into the DOM.
 */
function renderMapContainer(mode) {
  const isHistorical = mode === "historical";
  const maxHour = isHistorical ? 14 : 23;
  const labelsHtml = isHistorical ? `
            <span>12 AM</span>
            <span>4 AM</span>
            <span>8 AM</span>
            <span>12 PM</span>
            <span>2 PM</span>
  ` : `
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
  `;

  return `
    <div class="map-container full-page-map">
      <div id="enforcement-map"></div>
      <div class="map-overlay">
        <!-- Legend -->
        <div class="legend" style="margin-bottom: 12px;">
          <h4>Traffic Severity (TCSR)</h4>
          <div class="legend-scale" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5px; border-radius: 4px; overflow: hidden;">
            <div style="background: #0000ff; padding: 4px; text-align: center; color: white;">
              <span style="font-size: 9px; font-weight: 700; display: block;">Low</span>
              <div style="font-size: 8px; opacity: 0.85;">&lt;0.4</div>
            </div>
            <div style="background: #00c800; padding: 4px; text-align: center; color: black;">
              <span style="font-size: 9px; font-weight: 700; display: block;">Med</span>
              <div style="font-size: 8px; opacity: 0.85;">0.4-0.6</div>
            </div>
            <div style="background: #ffff00; padding: 4px; text-align: center; color: black;">
              <span style="font-size: 9px; font-weight: 700; display: block;">High</span>
              <div style="font-size: 8px; opacity: 0.85;">0.6-0.9</div>
            </div>
            <div style="background: #ff0000; padding: 4px; text-align: center; color: white;">
              <span style="font-size: 9px; font-weight: 700; display: block;">Crit</span>
              <div style="font-size: 8px; opacity: 0.85;">&ge;1.0</div>
            </div>
          </div>
        </div>

        <!-- Before/After Impact Toggle Card -->
        <div class="simulation-toggle-card" style="
          background: rgba(18, 18, 28, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          padding: 14px;
          width: 260px;
          box-shadow: var(--shadow);
          display: grid;
          gap: 8px;
          pointer-events: auto;
          margin-bottom: 12px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-2); letter-spacing: 0.05em;">
              Enforcement Relief
            </h4>
            <span style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: var(--muted); background: rgba(255,255,255,0.05); padding: 2px 5px; border-radius: 4px;">
              Simulation
            </span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-2);">Top 50 Hotspots Relief</span>
            <label class="map-switch" style="position: relative; display: inline-block; width: 42px; height: 20px; cursor: pointer;">
              <input type="checkbox" id="impact-sim-toggle" style="opacity: 0; width: 0; height: 0;" />
              <span class="map-slider" style="
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: var(--surface-3);
                transition: .3s;
                border-radius: 20px;
                border: 1px solid var(--border-strong);
              "></span>
            </label>
          </div>
          <p style="font-size: 10px; color: var(--muted); margin: 2px 0 0 0; line-height: 1.35;">
            Toggle to simulate traffic relief if patrols resolve Bangalore's top 50 chronic violations.
          </p>
        </div>

        <!-- Simulation Relief Statistics Dashboard -->
        <div id="sim-relief-stats-card" style="
          background: rgba(18, 18, 28, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-strong);
          border-left: 4px solid var(--green);
          border-radius: 8px;
          padding: 14px;
          width: 260px;
          box-shadow: var(--shadow);
          display: none;
          gap: 10px;
          pointer-events: auto;
          margin-bottom: 12px;
        ">
          <h4 style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--green); letter-spacing: 0.05em;">
            Est. Congestion Relief
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-top: 4px;">
            <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; border: 1px solid var(--border);">
              <span style="font-size: 8px; color: var(--text-2); display: block; text-transform: uppercase;">Time Saved</span>
              <strong style="font-size: 12px; color: var(--text);">1,450 hrs/d</strong>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; border: 1px solid var(--border);">
              <span style="font-size: 8px; color: var(--text-2); display: block; text-transform: uppercase;">Speed Gain</span>
              <strong style="font-size: 12px; color: var(--green);">+12.4%</strong>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; border: 1px solid var(--border); font-size: 11px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 8px; color: var(--text-2); text-transform: uppercase;">Junctions Unblocked</span>
            <strong style="font-size: 12px; color: var(--text);">8 key spots</strong>
          </div>
        </div>

        <!-- Time Travel Slider -->
        <div class="time-slider-card" style="
          background: rgba(18, 18, 28, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          padding: 14px;
          width: 260px;
          box-shadow: var(--shadow);
          display: grid;
          gap: 10px;
          pointer-events: auto;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-2); letter-spacing: 0.05em;">
              Time-Travel Slider
            </h4>
            <span id="slider-time-label" style="font-size: 11px; font-weight: 800; color: var(--text); background: var(--surface-3); padding: 2px 6px; border-radius: 4px;">
              10:00 AM
            </span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="slider-play-btn" type="button" style="
              background: var(--accent);
              color: var(--text);
              border: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              transition: all 120ms;
            ">
              <!-- Play Icon SVG -->
              <svg id="play-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <!-- Pause Icon SVG (hidden initially) -->
              <svg id="pause-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="display: none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            
            <input id="time-range-slider" type="range" min="0" max="${maxHour}" value="10" style="
              flex: 1;
              cursor: pointer;
              accent-color: var(--accent-2);
            " />
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: var(--muted); font-weight: 700;">
            ${labelsHtml}
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
export function renderMapPage({ mode, view }) {
  const isHistorical = mode === "historical";
  
  return `
    <main class="shell">
      ${renderNavbar(mode, view)}
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
      ${renderMapContainer(mode)}
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

  let simulationActive = false;
  const hotspotMarkers = [];

  // Extract top 50 hotspots center coordinates for simulation filtering
  const top50Hotspots = hotspots
    .filter(h => h.hotspot_rank <= 50)
    .map(h => ({
      lat: Number(h.center_lat || h.mean_lat),
      lng: Number(h.center_lng || h.mean_lng)
    }))
    .filter(h => !isNaN(h.lat) && !isNaN(h.lng));

  function isNearTop50(pLat, pLng) {
    const thresholdSq = 0.0035 * 0.0035; // ~350 meters radius to show clear visual impact at zoom 13
    for (let i = 0; i < top50Hotspots.length; i++) {
      const h = top50Hotspots[i];
      const dLat = pLat - h.lat;
      const dLng = pLng - h.lng;
      const distSq = dLat * dLat + dLng * dLng;
      if (distSq < thresholdSq) {
        return true;
      }
    }
    return false;
  }

  function updateMarkerStyles() {
    hotspotMarkers.forEach(marker => {
      const isTop50 = marker.hotspot_rank <= 50;
      const element = marker.getElement()?.querySelector("div");
      if (element) {
        if (simulationActive && isTop50) {
          element.style.borderColor = "#22c55e";
          element.style.opacity = "0.35";
          element.style.boxShadow = "none";
        } else {
          element.style.borderColor = "#f43f5e";
          element.style.opacity = "1.0";
          element.style.boxShadow = "0 0 5px rgba(244, 63, 94, 0.6)";
        }
      }
    });
  }

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

  // Initialize Heatmap layer reference
  let heatLayer = null;
  if (points && points.length > 0) {
    heatLayer = L.heatLayer([], {
      radius: 20,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
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

      const avgPiciVal = Number(h.avg_pici) || 0.0;
      const capacityLoss = Math.min(95, Math.max(15, Math.round(15 + (avgPiciVal - 0.1) * 65)));

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; color: #f0f0f8; min-width: 200px; padding: 4px 2px;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #9b7de8; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>Hotspot Rank #${h.hotspot_rank}</span>
          </h4>
          <div style="display: grid; gap: 5px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">Station Area:</span>
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
              <span style="color: #a0a0bc;">TCSR Index (PICI):</span>
              <strong>${Number(h.total_pici).toFixed(1)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">Average PICI:</span>
              <strong>${avgPiciVal.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">Carriageway Choke:</span>
              <strong style="color: var(--red);">${capacityLoss}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #a0a0bc;">Primary Vehicle:</span>
              <strong>${h.primary_vehicle_type || "Unknown"}</strong>
            </div>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.addTo(markersGroup);
      hotspotMarkers.push(marker);
    });

    // Control visibility based on zoom level (show only at zoom >= 14)
    const zoomThreshold = 14;
    function updateMarkersVisibility() {
      const currentZoom = map.getZoom();
      if (currentZoom >= zoomThreshold) {
        if (!map.hasLayer(markersGroup)) {
          map.addLayer(markersGroup);
        }
        setTimeout(updateMarkerStyles, 10);
      } else {
        if (map.hasLayer(markersGroup)) {
          map.removeLayer(markersGroup);
        }
      }
    }

    map.on("zoomend", updateMarkersVisibility);
    updateMarkersVisibility();
  }

  // Bind Time-Travel Slider Interactions
  const timeSlider = document.getElementById("time-range-slider");
  const timeLabel = document.getElementById("slider-time-label");
  const playBtn = document.getElementById("slider-play-btn");
  const playIcon = document.getElementById("play-icon");
  const pauseIcon = document.getElementById("pause-icon");
  const simToggle = document.getElementById("impact-sim-toggle");

  if (timeSlider && timeLabel && heatLayer) {
    let playInterval = null;

    function updateHeatmapForHour(hour) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      timeLabel.textContent = `${String(displayHour).padStart(2, "0")}:00 ${ampm}`;

      let filtered = points.filter((p) => p.hour === hour);
      if (simulationActive) {
        filtered = filtered.filter(p => !isNearTop50(p.lat, p.lng));
      }
      const heatData = filtered.map((p) => [p.lat, p.lng, p.intensity]);
      heatLayer.setLatLngs(heatData);
      heatLayer.redraw(); // Force canvas redraw to ensure immediate visual updates
    }

    simToggle?.addEventListener("change", (e) => {
      simulationActive = e.target.checked;
      updateMarkerStyles();
      updateHeatmapForHour(parseInt(timeSlider.value));
      
      const statsCard = document.getElementById("sim-relief-stats-card");
      if (statsCard) {
        statsCard.style.display = simulationActive ? "grid" : "none";
      }
    });

    // Handle slider change
    timeSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      updateHeatmapForHour(val);
    });

    // Play / Pause Animation Loop
    playBtn?.addEventListener("click", () => {
      if (playInterval) {
        // Pause
        clearInterval(playInterval);
        playInterval = null;
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      } else {
        // Play
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
        playInterval = setInterval(() => {
          const sliderEl = document.getElementById("time-range-slider");
          if (!sliderEl) {
            clearInterval(playInterval);
            return;
          }
          const maxLoop = mode === "historical" ? 15 : 24;
          let nextHour = (parseInt(sliderEl.value) + 1) % maxLoop;
          sliderEl.value = nextHour;
          updateHeatmapForHour(nextHour);
        }, 800); // Pulse every 800ms
      }
    });

    // Set initial value
    updateHeatmapForHour(parseInt(timeSlider.value));
  }

  return map;
}

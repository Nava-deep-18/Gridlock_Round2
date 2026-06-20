import { renderNavbar } from "./Navbar.jsx";

/**
 * Renders the layout of the dedicated Patrol Window page.
 */
export function renderDispatchPage({ mode, view, navOpen }) {
  const isHistorical = mode === "historical";

  return `
    <main class="shell${navOpen ? " nav-pinned" : ""}">
      ${renderNavbar(mode, view, navOpen)}

      <div class="page-top">
        <div class="page-greeting">
          <p>Patrol Optimization</p>
          <h1>Patrol Window</h1>
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

      <!-- Top Section: Weekly Calendar Grid Scheduler -->
      <article class="card calendar-card" style="padding: 20px; margin-top: 24px; overflow-x: auto;">
        <div class="card-header">
          <span>Weekly Scheduler Grid</span>
          <strong id="calendar-info">Bengaluru-wide Schedule</strong>
        </div>
        <h2>Patrol Scheduler Calendar</h2>
        <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 16px 0; line-height: 1.4;">
          Visualizing total active hotspots across all Bengaluru. Click any cell to open a pop-up showing all active hotspots in the city for that hour.
        </p>
        
        <div class="weekly-calendar" style="display: grid; grid-template-columns: 80px repeat(7, 1fr); gap: 4px; min-width: 750px; background: var(--surface-3); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
          <!-- Day Headers -->
          <div class="calendar-header-cell" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--muted); padding: 8px 0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid var(--border);">Time</div>
          <div class="calendar-header-cell" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--accent-2); padding: 8px 0; border-bottom: 2px solid var(--border);">Mon</div>
          <div class="calendar-header-cell" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--accent-2); padding: 8px 0; border-bottom: 2px solid var(--border);">Tue</div>
          <div class="calendar-header-cell" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--accent-2); padding: 8px 0; border-bottom: 2px solid var(--border);">Wed</div>
          <div class="calendar-header-cell" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--accent-2); padding: 8px 0; border-bottom: 2px solid var(--border);">Thu</div>
          <div class="calendar-header-cell" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--accent-2); padding: 8px 0; border-bottom: 2px solid var(--border);">Fri</div>
          <div class="calendar-header-cell" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--accent-2); padding: 8px 0; border-bottom: 2px solid var(--border);">Sat</div>
          <div class="calendar-header-cell" style="text-align: center; font-size: 11px; font-weight: 700; color: var(--accent-2); padding: 8px 0; border-bottom: 2px solid var(--border);">Sun</div>
          
          <div id="calendar-grid-body" style="display: contents;"></div>
        </div>
      </article>

      <!-- Bottom Section: Dispatch Workspace (Split Grid) -->
      <div class="dispatch-container" style="display: grid; grid-template-columns: minmax(300px, 0.35fr) minmax(0, 0.65fr); gap: 24px; margin-top: 24px; align-items: start; margin-bottom: 30px;">
        
        <!-- Bottom Left: Filters & Summaries -->
        <div class="dispatch-sidebar-controls" style="display: grid; gap: 20px;">
          
          <article class="card select-card" style="padding: 20px; display: grid; gap: 16px;">
            <h2>Patrol Filters</h2>
            
            <div style="display: grid; gap: 6px;">
              <label for="dispatch-station-select" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-2); letter-spacing: 0.05em;">
                Select Police Station
              </label>
              <select id="dispatch-station-select" style="width: 100%; padding: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; outline: none;"></select>
            </div>

            <div style="display: grid; gap: 6px;">
              <label for="dispatch-day-select" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-2); letter-spacing: 0.05em;">
                Select Day of the Week
              </label>
              <select id="dispatch-day-select" style="width: 100%; padding: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; outline: none;">
                <option value="all">All Days</option>
                <option value="0">Monday</option>
                <option value="1">Tuesday</option>
                <option value="2">Wednesday</option>
                <option value="3">Thursday</option>
                <option value="4">Friday</option>
                <option value="5">Saturday</option>
                <option value="6">Sunday</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="display: grid; gap: 6px;">
                <label for="dispatch-start-select" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-2); letter-spacing: 0.05em;">
                  Start Hour
                </label>
                <select id="dispatch-start-select" style="width: 100%; padding: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; outline: none;"></select>
              </div>
              <div style="display: grid; gap: 6px;">
                <label for="dispatch-end-select" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-2); letter-spacing: 0.05em;">
                  End Hour
                </label>
                <select id="dispatch-end-select" style="width: 100%; padding: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; outline: none;"></select>
              </div>
            </div>
          </article>

          <!-- Shift Summary Card -->
          <article class="card summary-card" style="padding: 20px; display: grid; gap: 16px;">
            <h2>Patrol Summary</h2>
            <div style="display: grid; gap: 10px;">
              <div style="background: var(--surface-2); border: 1px solid var(--border); padding: 12px 14px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <small style="font-size: 11px; color: var(--text-2); font-weight: 600;">Active Windows</small>
                <div id="summary-total-windows" style="font-size: 16px; font-weight: 800; color: var(--accent-2);">-</div>
              </div>
              <div style="background: var(--surface-2); border: 1px solid var(--border); padding: 12px 14px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <small style="font-size: 11px; color: var(--text-2); font-weight: 600;">Peak Priority</small>
                <div id="summary-peak-priority" style="font-size: 16px; font-weight: 800; color: var(--red);">-</div>
              </div>
              <div style="background: var(--surface-2); border: 1px solid var(--border); padding: 12px 14px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                <small style="font-size: 11px; color: var(--text-2); font-weight: 600;">Avg Expected Violations</small>
                <div id="summary-avg-violations" style="font-size: 16px; font-weight: 800; color: var(--green);">-</div>
              </div>
            </div>
          </article>
        </div>

        <!-- Bottom Right: Detailed Patrol Recommendations (Selected Station only) -->
        <article class="card deployment-card reveal-card" style="margin: 0; padding: 20px;">
          <div class="card-header">
            <span>Station Patrols</span>
            <strong id="recs-count">Select a station</strong>
          </div>
          <h2 id="recs-title">Patrol Schedule</h2>
          <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 16px 0; line-height: 1.4;">
            Active recommended windows showing expected violations.
          </p>
          <ul id="station-recs-list" class="deployment-list scrollable-container" style="max-height: 480px;"></ul>
        </article>

      </div>

      <!-- Pop-up Modal for City-wide recommendations -->
      <div id="dispatch-modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(13, 13, 20, 0.8); backdrop-filter: blur(4px); align-items: center; justify-content: center;">
        <div class="modal-content card" style="background: var(--surface); border: 1px solid var(--border-strong); width: 90%; max-width: 650px; padding: 24px; border-radius: var(--radius); position: relative; max-height: 80vh; display: flex; flex-direction: column; gap: 16px; box-shadow: var(--shadow);">
          <span id="close-modal-btn" style="position: absolute; right: 20px; top: 16px; font-size: 26px; font-weight: bold; cursor: pointer; color: var(--text-2); transition: color 150ms;">&times;</span>
          <h2 id="modal-title" style="margin: 0;">City-wide Hotspots</h2>
          <p id="modal-subtitle" style="font-size: 11px; color: var(--text-2); margin: -8px 0 0 0; line-height: 1.4;"></p>
          <div class="scrollable-container" style="max-height: 450px; padding-right: 4px;">
            <ul id="modal-recs-list" class="deployment-list"></ul>
          </div>
        </div>
      </div>

    </main>
  `;
}

/**
 * Binds DOM events and handles the resource simulator logic.
 */
export function initDispatchView(hotspots, recommendations, mode = "historical") {
  const stationSelect = document.getElementById("dispatch-station-select");
  const daySelect = document.getElementById("dispatch-day-select");
  const startSelect = document.getElementById("dispatch-start-select");
  const endSelect = document.getElementById("dispatch-end-select");
  
  const summaryTotalWindows = document.getElementById("summary-total-windows");
  const summaryPeakPriority = document.getElementById("summary-peak-priority");
  const summaryAvgViolations = document.getElementById("summary-avg-violations");
  
  const calendarGridBody = document.getElementById("calendar-grid-body");
  
  const stationRecsList = document.getElementById("station-recs-list");
  const stationRecsCount = document.getElementById("recs-count");
  const recsTitle = document.getElementById("recs-title");
 
  // Modal elements
  const modal = document.getElementById("dispatch-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalSubtitle = document.getElementById("modal-subtitle");
  const modalRecsList = document.getElementById("modal-recs-list");
  const closeModalBtn = document.getElementById("close-modal-btn");
 
  if (!stationSelect || !daySelect || !startSelect || !endSelect || !stationRecsList || !calendarGridBody || !modal) return;

  // Retrieve dispatched list from localStorage
  let dispatchedKeys = new Set();
  try {
    const saved = localStorage.getItem("parksense.dispatched_patrols");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        dispatchedKeys = new Set(parsed);
      }
    }
  } catch (e) {
    console.error("Error reading dispatched patrols", e);
  }

  function saveDispatchedKeys() {
    try {
      localStorage.setItem("parksense.dispatched_patrols", JSON.stringify(Array.from(dispatchedKeys)));
    } catch (e) {
      console.error("Error saving dispatched patrols", e);
    }
  }

  const isHistorical = mode === "historical";
  const startHourLimit = 0;
  const endHourLimit = isHistorical ? 14 : 23;

  function getHourLabel(h) {
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH} ${ampm}`;
  }

  // Populate Start/End Hour Dropdowns
  let hoursHtml = "";
  for (let h = startHourLimit; h <= endHourLimit; h++) {
    hoursHtml += `<option value="${h}">${getHourLabel(h)}</option>`;
  }
  startSelect.innerHTML = hoursHtml;
  endSelect.innerHTML = hoursHtml;

  // Set default values as per user request:
  // Start Hour: 12 AM (0), End Hour: 2 PM (14)
  startSelect.value = "0";
  endSelect.value = endHourLimit >= 14 ? "14" : String(endHourLimit);
 
  // Helper to format priority score
  function formatPriorityScore(score) {
    const num = Number(score) || 0;
    if (num === 0) return "0.00";
    if (num < 0.01) return num.toFixed(3);
    return num.toFixed(2);
  }
 
  // Create hotspot rank -> police station mapping
  const stationMap = new Map();
  hotspots.forEach(h => {
    stationMap.set(h.hotspot_rank, h.primary_police_station || "Unknown");
  });
 
  // Enrich recommendations with police station and filter to calendar hours
  const enrichedRecs = recommendations
    .filter(r => r.hour >= startHourLimit && r.hour <= endHourLimit)
    .map(r => ({
      ...r,
      police_station: stationMap.get(r.hotspot_rank) || "Unknown"
    }));

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Populate stations dropdown
  const uniqueStations = Array.from(new Set(enrichedRecs.map(r => r.police_station).filter(Boolean))).sort();
  stationSelect.innerHTML = uniqueStations.map(station => `<option value="${station}">${station}</option>`).join("");

  // Set default values as per user request:
  // Police Station: Shivajinagar
  if (uniqueStations.includes("Shivajinagar")) {
    stationSelect.value = "Shivajinagar";
  } else if (uniqueStations.length > 0) {
    stationSelect.value = uniqueStations[0];
  }

  // Day of the week: Thursday (3)
  daySelect.value = "3";

  // Renders the overall city-wide calendar grid
  function updateCalendarGrid() {
    // Group all recommendations across Bengaluru by day and hour
    const cityGridMap = new Map();
    enrichedRecs.forEach(r => {
      const key = `${r.day_of_week}_${r.hour}`;
      if (!cityGridMap.has(key)) cityGridMap.set(key, 0);
      cityGridMap.set(key, cityGridMap.get(key) + 1);
    });

    let bodyHtml = "";
    for (let hr = startHourLimit; hr <= endHourLimit; hr++) {
      const timeStr = `${String(hr).padStart(2, "0")}:00`;
      bodyHtml += `<div style="text-align: center; font-size: 11px; color: var(--text-2); font-weight: 600; padding: 8px 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center;">${timeStr}</div>`;
      
      for (let day = 0; day < 7; day++) {
        const key = `${day}_${hr}`;
        const count = cityGridMap.get(key) || 0;
        
        let cellStyle = "text-align: center; padding: 6px 4px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); min-height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 11px; transition: all 120ms;";
        let cellText = "";

        if (count > 0) {
          // Density styling
          let opacity = 0.15;
          if (count > 10) opacity = 0.4;
          if (count > 25) opacity = 0.7;
          if (count > 45) opacity = 0.95;

          const cellBg = `rgba(124, 92, 191, ${opacity})`;
          cellStyle += ` background: ${cellBg};`;
          
          cellText = `<span style="background: var(--surface-2); border: 1px solid var(--border); padding: 3px 5px; border-radius: 4px; font-size: 9px; font-weight: 800; color: var(--accent-2);">${count} slots</span>`;
        }

        bodyHtml += `
          <div class="calendar-cell" data-day="${day}" data-hour="${hr}" style="${cellStyle}">
            ${cellText}
          </div>
        `;
      }
    }

    calendarGridBody.innerHTML = bodyHtml;

    // Bind cell click events to open modal pop-up
    document.querySelectorAll(".calendar-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const day = parseInt(cell.dataset.day);
        const hour = parseInt(cell.dataset.hour);
        
        // Filter city-wide hotspots for this slot
        const filtered = enrichedRecs.filter(r => r.day_of_week === day && r.hour === hour);
        filtered.sort((a, b) => b.priority_score - a.priority_score);

        // Open modal
        modalTitle.textContent = `City-wide Hotspots — ${dayNames[day]} ${String(hour).padStart(2, "0")}:00`;
        modalSubtitle.textContent = `Displaying all ${filtered.length} active enforcement windows across Bengaluru at this hour.`;
        
        if (filtered.length === 0) {
          modalRecsList.innerHTML = `<li class="status-card" style="padding:20px;text-align:center;color:var(--text-2)">No recommendations scheduled for this hour.</li>`;
        } else {
          modalRecsList.innerHTML = filtered.map((item, index) => {
            const key = `${item.police_station}_${item.day_of_week}_${item.hour}`;
            const isDispatched = dispatchedKeys.has(key);
            const isDispatchedClass = isDispatched ? "is-dispatched" : "";
            
            const deployButtonHtml = `
              <button class="deploy-btn ${isDispatchedClass}" 
                      data-key="${key}"
                      data-station="${item.police_station}"
                      data-day="${dayNames[item.day_of_week]}"
                      data-hour="${item.hour}"
                      data-score="${item.priority_score}">
                <span class="btn-text-normal">Deploy Patrol</span>
                <span class="btn-text-dispatched">✓ Dispatched</span>
                <span class="btn-text-hover">Recall Patrol</span>
                <span class="btn-text-loading">Deploying...</span>
              </button>
            `;

            return `
              <li class="deployment-item ${isDispatchedClass}" title="Priority Score: ${Number(item.priority_score).toFixed(3)}">
                <div class="deployment-rank">#${index + 1}</div>
                <div class="deployment-body">
                  <div class="deployment-topline">
                    <strong>${item.police_station} Area</strong>
                    <span>Hotspot Rank #${item.hotspot_rank}</span>
                  </div>
                  <div class="deployment-meta">
                    <span>GPS <b>${Number(item.center_lat).toFixed(4)}, ${Number(item.center_lng).toFixed(4)}</b></span>
                    <span>Expected Violations <b>${Number(item.predicted_violations).toFixed(1)}</b></span>
                    <span>Impact (PICI) <b>${Number(item.predicted_pici).toFixed(2)}</b></span>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 110px;">
                  <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                    <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em;">Priority</span>
                    <div class="priority-score" style="margin-top: -2px;">${formatPriorityScore(item.priority_score)}</div>
                  </div>
                  ${deployButtonHtml}
                </div>
              </li>
            `;
          }).join("");
        }

        modal.style.display = "flex";
      });
    });
  }

  // Renders the bottom station-specific patrols list
  function updateStationRecs() {
    const selectedStation = stationSelect.value;
    const selectedDay = daySelect.value;
    const startHour = parseInt(startSelect.value);
    const endHour = parseInt(endSelect.value);
    
    // Filter recommendations by selected station
    let filtered = enrichedRecs.filter(r => r.police_station === selectedStation);

    // Apply Day of Week filter
    if (selectedDay !== "all") {
      const dayInt = parseInt(selectedDay);
      filtered = filtered.filter(r => r.day_of_week === dayInt);
    }

    // Apply custom Time Range filter (supporting wrap-around midnight)
    if (startHour <= endHour) {
      filtered = filtered.filter(r => r.hour >= startHour && r.hour <= endHour);
    } else {
      filtered = filtered.filter(r => r.hour >= startHour || r.hour <= endHour);
    }

    filtered.sort((a, b) => b.priority_score - a.priority_score);

    const totalSlotsCount = filtered.length;
    recsTitle.textContent = `${selectedStation} Patrol Schedule`;
    stationRecsCount.textContent = `Total: ${totalSlotsCount} Windows`;

    // Calculate Summary Stats
    if (summaryTotalWindows && summaryPeakPriority && summaryAvgViolations) {
      summaryTotalWindows.textContent = totalSlotsCount;
      if (totalSlotsCount > 0) {
        const maxPriority = Math.max(...filtered.map(r => r.priority_score));
        const avgVio = filtered.reduce((sum, r) => sum + r.predicted_violations, 0) / totalSlotsCount;
        summaryPeakPriority.textContent = formatPriorityScore(maxPriority);
        summaryAvgViolations.textContent = avgVio.toFixed(1);
      } else {
        summaryPeakPriority.textContent = "0.00";
        summaryAvgViolations.textContent = "0.0";
      }
    }

    if (filtered.length === 0) {
      stationRecsList.innerHTML = `<li class="status-card" style="padding: 24px; text-align: center; color: var(--text-2);">No recommended patrol windows found for this station in the selected slot.</li>`;
      return;
    }

    const html = filtered.map((item) => {
      const key = `${item.police_station}_${item.day_of_week}_${item.hour}`;
      const isDispatched = dispatchedKeys.has(key);
      const isDispatchedClass = isDispatched ? "is-dispatched" : "";
      
      const deployButtonHtml = `
        <button class="deploy-btn ${isDispatchedClass}" 
                data-key="${key}"
                data-station="${item.police_station}"
                data-day="${dayNames[item.day_of_week]}"
                data-hour="${item.hour}"
                data-score="${item.priority_score}">
          <span class="btn-text-normal">Deploy Patrol</span>
          <span class="btn-text-dispatched">✓ Dispatched</span>
          <span class="btn-text-hover">Recall Patrol</span>
          <span class="btn-text-loading">Deploying...</span>
        </button>
      `;

      return `
        <li class="deployment-item ${isDispatchedClass}" title="Priority Score: ${Number(item.priority_score).toFixed(2)} (Expected Violations ${Number(item.predicted_violations).toFixed(1)} x Impact ${Number(item.predicted_pici).toFixed(2)})">
          <div class="deployment-rank">#${item.hotspot_rank}</div>
          <div class="deployment-body">
            <div class="deployment-topline">
              <strong>${item.police_station} Area</strong>
              <span>${dayNames[item.day_of_week]} ${String(item.hour).padStart(2, "0")}:00</span>
            </div>
            <div class="deployment-meta">
              <span>GPS <b>${Number(item.center_lat).toFixed(4)}, ${Number(item.center_lng).toFixed(4)}</b></span>
              <span>Expected Violations <b>${Number(item.predicted_violations).toFixed(1)}</b></span>
              <span>Impact (PICI) <b>${Number(item.predicted_pici).toFixed(2)}</b></span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 110px;">
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
              <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em;">Priority</span>
              <div class="priority-score">${formatPriorityScore(item.priority_score)}</div>
            </div>
            ${deployButtonHtml}
          </div>
        </li>
      `;
    }).join("");

    stationRecsList.innerHTML = html;
  }

  // Initial render
  updateCalendarGrid();
  updateStationRecs();

  // Slide-in Toast helper
  function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 9999;
        display: grid;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    
    const borderColor = type === "success" ? "var(--green)" : "var(--red)";
    const icon = type === "success" ? "🚨" : "↩️";
    
    toast.style.cssText = `
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-left: 4px solid ${borderColor};
      color: var(--text);
      padding: 14px 18px;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow);
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      pointer-events: auto;
    `;
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:16px;">${icon}</span>
        <div>${message}</div>
      </div>
      <button class="toast-close" style="background:none; border:none; color:var(--text-2); cursor:pointer; font-size:16px; line-height:1; font-weight:700;">&times;</button>
    `;
    
    container.appendChild(toast);
    
    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.style.animation = "slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards";
      setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = "slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards";
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  }

  function handleDeployClick(event) {
    const button = event.target.closest(".deploy-btn");
    if (!button) return;

    const key = button.dataset.key;
    const station = button.dataset.station;
    const day = button.dataset.day;
    const hourVal = parseInt(button.dataset.hour);
    const score = button.dataset.score;
    const itemCard = button.closest(".deployment-item");

    function getLocalHourLabel(h) {
      if (h === 0) return "12 AM";
      if (h === 12) return "12 PM";
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH} ${ampm}`;
    }

    if (dispatchedKeys.has(key)) {
      // Recall action
      dispatchedKeys.delete(key);
      saveDispatchedKeys();

      // UI Updates for all matching buttons in view
      document.querySelectorAll(`.deploy-btn[data-key="${key}"]`).forEach(btn => {
        btn.classList.remove("is-dispatched");
        btn.closest(".deployment-item")?.classList.remove("is-dispatched");
      });

      showToast(`Patrol Recalled: ${station} Area | ${day} ${getLocalHourLabel(hourVal)} | Unit returned to station`, "info");
    } else {
      // Deploy action
      button.classList.add("is-loading");

      setTimeout(() => {
        button.classList.remove("is-loading");
        dispatchedKeys.add(key);
        saveDispatchedKeys();

        // UI Updates for all matching buttons in view
        document.querySelectorAll(`.deploy-btn[data-key="${key}"]`).forEach(btn => {
          btn.classList.add("is-dispatched");
          btn.closest(".deployment-item")?.classList.add("is-dispatched");
        });

        showToast(`Patrol Deployed: ${station} Area | ${day} ${getLocalHourLabel(hourVal)} | Priority Score: ${Number(score).toFixed(2)}`, "success");
      }, 500);
    }
  }

  stationRecsList.addEventListener("click", handleDeployClick);
  modalRecsList.addEventListener("click", handleDeployClick);

  // Modal close handlers
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Dropdown change handlers
  stationSelect.addEventListener("change", () => {
    updateCalendarGrid();
    updateStationRecs();
  });
  daySelect.addEventListener("change", () => {
    updateCalendarGrid();
    updateStationRecs();
  });
  startSelect.addEventListener("change", () => {
    updateCalendarGrid();
    updateStationRecs();
  });
  endSelect.addEventListener("change", () => {
    updateCalendarGrid();
    updateStationRecs();
  });
}

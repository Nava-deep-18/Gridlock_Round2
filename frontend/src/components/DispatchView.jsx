import { renderNavbar } from "./Navbar.jsx";

/**
 * Renders the layout of the dedicated Smart Dispatch page.
 */
export function renderDispatchPage({ mode, view, navOpen }) {
  const isHistorical = mode === "historical";

  return `
    <main class="shell${navOpen ? " nav-pinned" : ""}">
      ${renderNavbar(mode, view, navOpen)}

      <div class="page-top">
        <div class="page-greeting">
          <p>Patrol Optimization</p>
          <h1>Smart Dispatch Center</h1>
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

      <!-- Bottom Section: Simulator Workspace (Split Grid) -->
      <div class="dispatch-container" style="display: grid; grid-template-columns: minmax(300px, 0.35fr) minmax(0, 0.65fr); gap: 24px; margin-top: 24px; align-items: start; margin-bottom: 30px;">
        
        <!-- Bottom Left: Simulator Inputs & KPIs -->
        <div class="dispatch-sidebar-controls" style="display: grid; gap: 20px;">
          
          <article class="card select-card" style="padding: 20px; display: grid; gap: 16px;">
            <h2>Simulator Inputs</h2>
            
            <div style="display: grid; gap: 6px;">
              <label for="dispatch-station-select" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-2);">
                Select Police Station
              </label>
              <select id="dispatch-station-select" style="width: 100%; padding: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; outline: none;"></select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="display: grid; gap: 6px;">
                <label for="dispatch-tow-trucks" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--red);">
                  Tow Trucks
                </label>
                <input id="dispatch-tow-trucks" type="number" min="0" value="2" style="width: 100%; padding: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; outline: none;" />
              </div>
              
              <div style="display: grid; gap: 6px;">
                <label for="dispatch-officers" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--green);">
                  Patrol Officers
                </label>
                <input id="dispatch-officers" type="number" min="0" value="4" style="width: 100%; padding: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; outline: none;" />
              </div>
            </div>

            <button id="dispatch-btn" type="button" class="btn" style="width: 100%; background: var(--accent); color: var(--text); font-weight: 700; padding: 12px; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: background 200ms;">
              🚀 Run Dispatch Simulator
            </button>
          </article>

          <!-- Simulator Results (KPI Scorecard) -->
          <article class="card kpi-card" style="padding: 20px; display: grid; gap: 16px;">
            <h2>Simulation Results</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
              
              <div style="background: var(--surface-2); border: 1px solid var(--border); padding: 12px 6px; border-radius: var(--radius-sm);">
                <div id="kpi-relief" style="font-size: 20px; font-weight: 800; color: var(--accent-2);">-</div>
                <small style="display: block; font-size: 10px; color: var(--text-2); margin-top: 4px; line-height: 1.2;">Relief Score</small>
              </div>

              <div style="background: var(--surface-2); border: 1px solid var(--border); padding: 12px 6px; border-radius: var(--radius-sm);">
                <div id="kpi-slots" style="font-size: 20px; font-weight: 800; color: var(--green);">-</div>
                <small style="display: block; font-size: 10px; color: var(--text-2); margin-top: 4px; line-height: 1.2;">Slots Covered</small>
              </div>

              <div style="background: var(--surface-2); border: 1px solid var(--border); padding: 12px 6px; border-radius: var(--radius-sm);">
                <div id="kpi-utilization" style="font-size: 20px; font-weight: 800; color: var(--amber);">-</div>
                <small style="display: block; font-size: 10px; color: var(--text-2); margin-top: 4px; line-height: 1.2;">Active Force</small>
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
            Active recommended windows showing simulated dispatches.
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
export function initDispatchView(hotspots, recommendations) {
  const stationSelect = document.getElementById("dispatch-station-select");
  const towTrucksInput = document.getElementById("dispatch-tow-trucks");
  const officersInput = document.getElementById("dispatch-officers");
  const dispatchBtn = document.getElementById("dispatch-btn");
  
  const kpiRelief = document.getElementById("kpi-relief");
  const kpiSlots = document.getElementById("kpi-slots");
  const kpiUtilization = document.getElementById("kpi-utilization");
  
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

  if (!stationSelect || !stationRecsList || !calendarGridBody || !modal) return;

  // Active assignments map (key: day_hour -> assignment)
  let activeAssignments = null;

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

  // Enrich recommendations with police station and filter to calendar hours (8-14)
  const enrichedRecs = recommendations
    .filter(r => r.hour >= 8 && r.hour <= 14)
    .map(r => ({
      ...r,
      police_station: stationMap.get(r.hotspot_rank) || "Unknown"
    }));

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Populate stations dropdown
  const uniqueStations = Array.from(new Set(enrichedRecs.map(r => r.police_station).filter(Boolean))).sort();
  stationSelect.innerHTML = uniqueStations.map(station => `<option value="${station}">${station}</option>`).join("");

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
    for (let hr = 8; hr <= 14; hr++) {
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
          modalRecsList.innerHTML = filtered.map((item, index) => `
            <li class="deployment-item" title="Priority Score: ${Number(item.priority_score).toFixed(3)}">
              <div class="deployment-rank">#${index + 1}</div>
              <div class="deployment-body">
                <div class="deployment-topline">
                  <strong>${item.police_station} Area</strong>
                  <span>Hotspot Rank #${item.hotspot_rank}</span>
                </div>
                <div class="deployment-meta">
                  <span>Expected <b>${Number(item.predicted_violations).toFixed(1)}</b></span>
                  <span>Impact (PICI) <b>${Number(item.predicted_pici).toFixed(2)}</b></span>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 90px;">
                <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em;">Priority</span>
                <div class="priority-score" style="margin-top: -2px;">${formatPriorityScore(item.priority_score)}</div>
              </div>
            </li>
          `).join("");
        }

        modal.style.display = "flex";
      });
    });
  }

  // Renders the bottom station-specific patrols list
  function updateStationRecs() {
    const selectedStation = stationSelect.value;
    
    // Filter recommendations by selected station
    let filtered = enrichedRecs.filter(r => r.police_station === selectedStation);
    filtered.sort((a, b) => b.priority_score - a.priority_score);

    const totalSlotsCount = filtered.length;
    recsTitle.textContent = `${selectedStation} Patrol Schedule`;
    stationRecsCount.textContent = `Total: ${totalSlotsCount} Windows`;

    // Set KPIs to active 0s if simulator has not been run
    if (!activeAssignments) {
      kpiRelief.innerHTML = `<span style="font-size:20px;font-weight:800;color:var(--accent-2);">0%</span><small style="display:block;font-size:10px;color:var(--text-2);margin-top:4px;">Relief Score</small>`;
      kpiSlots.innerHTML = `<span style="font-size:20px;font-weight:800;color:var(--green);">0/${totalSlotsCount}</span><small style="display:block;font-size:10px;color:var(--text-2);margin-top:4px;">Slots Covered</small>`;
      kpiUtilization.innerHTML = `<span style="font-size:20px;font-weight:800;color:var(--amber);">0%</span><small style="display:block;font-size:10px;color:var(--text-2);margin-top:4px;">Active Force</small>`;
    }

    if (filtered.length === 0) {
      stationRecsList.innerHTML = `<li class="status-card" style="padding: 24px; text-align: center; color: var(--text-2);">No recommended patrol windows found for this station.</li>`;
      return;
    }

    const html = filtered.map((item) => {
      const assignmentKey = `${item.day_of_week}_${item.hour}_${item.hotspot_rank}`;
      let statusHtml = `<span class="badge badge-purple" style="opacity: 0.7">● Standby</span>`;
      let borderStyle = "";
      
      if (activeAssignments && activeAssignments.has(assignmentKey)) {
        const assignment = activeAssignments.get(assignmentKey);
        if (assignment.type === "tow_truck") {
          statusHtml = `<span class="badge badge-red" style="font-weight: 700;">🚨 Dispatched (Tow Truck #${assignment.id})</span>`;
          borderStyle = "border: 1px solid var(--red)";
        } else if (assignment.type === "officer") {
          statusHtml = `<span class="badge badge-green" style="font-weight: 700;">👮 Dispatched (Officer #${assignment.id})</span>`;
          borderStyle = "border: 1px solid var(--green)";
        }
      }

      return `
        <li class="deployment-item" style="${borderStyle}" title="Priority Score: ${Number(item.priority_score).toFixed(2)} (Expected ${Number(item.predicted_violations).toFixed(1)} x Impact ${Number(item.predicted_pici).toFixed(2)})">
          <div class="deployment-rank">#${item.hotspot_rank}</div>
          <div class="deployment-body">
            <div class="deployment-topline">
              <strong>${item.police_station} Area</strong>
              <span>${dayNames[item.day_of_week]} ${String(item.hour).padStart(2, "0")}:00</span>
            </div>
            <div class="deployment-meta">
              <span>Expected <b>${Number(item.predicted_violations).toFixed(1)}</b></span>
              <span>Impact (PICI) <b>${Number(item.predicted_pici).toFixed(2)}</b></span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 90px;">
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: var(--muted); letter-spacing: 0.05em;">Priority</span>
            <div class="priority-score" style="margin-top: -2px;">${formatPriorityScore(item.priority_score)}</div>
            ${statusHtml}
          </div>
        </li>
      `;
    }).join("");

    stationRecsList.innerHTML = html;
  }

  // Initial render
  updateCalendarGrid();
  updateStationRecs();

  // Run Dispatch Simulator Button Click Handler (Hour-by-Hour Shift Allocation)
  dispatchBtn?.addEventListener("click", () => {
    const towTrucksInputVal = parseInt(towTrucksInput.value) || 0;
    const officersInputVal = parseInt(officersInput.value) || 0;
    const selectedStation = stationSelect.value;

    const stationRecs = enrichedRecs.filter(r => r.police_station === selectedStation);
    if (stationRecs.length === 0) return;

    // Group recommendations by day and hour
    const hourlyGroups = new Map();
    stationRecs.forEach(r => {
      const key = `${r.day_of_week}_${r.hour}`;
      if (!hourlyGroups.has(key)) hourlyGroups.set(key, []);
      hourlyGroups.get(key).push(r);
    });

    // Run shift allocation logic hour-by-hour
    activeAssignments = new Map(); // key: day_hour_rank -> assignment
    
    let totalScheduledSlotsCount = stationRecs.length;
    let coveredSlotsCount = 0;
    let accumulatedUtilization = 0;

    hourlyGroups.forEach((records, key) => {
      // Sort the hotspots in this hour block by Priority Score descending
      records.sort((a, b) => b.priority_score - a.priority_score);

      let remainingTrucks = towTrucksInputVal;
      let remainingOfficers = officersInputVal;

      let assignedTrucks = 0;
      let assignedOfficers = 0;

      // Assign resources to sorted hotspots in this hour
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const recordKey = `${record.day_of_week}_${record.hour}_${record.hotspot_rank}`;
        
        // Tow Trucks are reserved for high-risk slots (predicted_violations >= 1.0)
        const isHighRisk = record.predicted_violations >= 1.0;
        
        if (isHighRisk && remainingTrucks > 0 && remainingOfficers > 0) {
          assignedTrucks++;
          remainingTrucks--;
          remainingOfficers--;
          activeAssignments.set(recordKey, { type: "tow_truck", id: assignedTrucks });
          coveredSlotsCount++;
        } else if (remainingOfficers > 0) {
          assignedOfficers++;
          remainingOfficers--;
          activeAssignments.set(recordKey, { type: "officer", id: assignedOfficers + towTrucksInputVal });
          coveredSlotsCount++;
        }
      }

      // Calculate hour force utilization based on personnel (officers) deployed
      const officersUsedThisHour = officersInputVal - remainingOfficers;
      const hourlyUtil = officersInputVal > 0 ? (officersUsedThisHour / officersInputVal) : 0;
      accumulatedUtilization += hourlyUtil;
    });

    // Calculate overall KPIs
    const totalScore = stationRecs.reduce((sum, item) => sum + item.priority_score, 0);
    let assignedScore = 0;
    stationRecs.forEach(item => {
      const key = `${item.day_of_week}_${item.hour}_${item.hotspot_rank}`;
      if (activeAssignments.has(key)) {
        assignedScore += item.priority_score;
      }
    });

    const reliefPercentage = totalScore > 0 ? Math.round((assignedScore / totalScore) * 100) : 0;
    const activeHoursCount = hourlyGroups.size;
    const avgUtilization = activeHoursCount > 0 ? Math.round((accumulatedUtilization / activeHoursCount) * 100) : 0;

    // Update KPIs on the scorecard
    kpiRelief.innerHTML = `<span style="font-size:20px;font-weight:800;color:var(--accent-2);">${reliefPercentage}%</span><small style="display:block;font-size:10px;color:var(--text-2);margin-top:4px;">Relief Score</small>`;
    kpiSlots.innerHTML = `<span style="font-size:20px;font-weight:800;color:var(--green);">${coveredSlotsCount}/${totalScheduledSlotsCount}</span><small style="display:block;font-size:10px;color:var(--text-2);margin-top:4px;">Slots Covered</small>`;
    kpiUtilization.innerHTML = `<span style="font-size:20px;font-weight:800;color:var(--amber);">${avgUtilization}%</span><small style="display:block;font-size:10px;color:var(--text-2);margin-top:4px;">Active Force</small>`;

    // Re-render
    updateStationRecs();
  });

  // Modal close handlers
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Dropdown change handler
  stationSelect.addEventListener("change", () => {
    activeAssignments = null;
    updateCalendarGrid();
    updateStationRecs();
  });
}

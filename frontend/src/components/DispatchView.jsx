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
          <span>Weekly Scheduler Grid (Hotspots)</span>
          <strong id="calendar-info">Bengaluru-wide Schedule</strong>
        </div>
        <h2>Patrol Scheduler Calendar</h2>
        <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 16px 0; line-height: 1.4;">
          Note: Cell color density represents the count of active bottleneck zones (Hotspots). Click any cell to open a pop-up and manually deploy roster units.
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
      <div class="dispatch-container" style="display: grid; grid-template-columns: minmax(300px, 0.35fr) minmax(0, 0.65fr); gap: 24px; margin-top: 24px; align-items: stretch; margin-bottom: 30px;">
        
        <!-- Bottom Left: Filters & Summaries -->
        <div class="dispatch-sidebar-controls" style="display: grid; gap: 20px;">
          
          <article class="card select-card" style="padding: 20px; display: grid; gap: 16px;">
            <h2>Patrol Filters</h2>
            
            <div style="display: grid; gap: 6px;">
              <label for="dispatch-station-select" style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-2); letter-spacing: 0.05em;">
                Filter by Sector (Police Station)
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

          <!-- Patrol Unit Roster Card -->
          <article class="card roster-card" id="roster-card-container" style="padding: 20px; display: grid; gap: 16px;">
            <!-- Rendered dynamically by initDispatchView -->
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
        <article class="card deployment-card reveal-card" style="margin: 0; padding: 20px; display: flex; flex-direction: column; height: 100%;">
          <div class="card-header">
            <span>Sector Hotspots</span>
            <strong id="recs-count">Select a station</strong>
          </div>
          <h2 id="recs-title">Bottleneck Zones (Hotspots)</h2>
          <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 16px 0; line-height: 1.4;">
            Note: Active forecasted bottleneck zones (Hotspots). Choke (%) represents capacity loss.<br/>
            <span style="font-size: 10px; color: var(--muted); display: block; margin-top: 2px;">Severity Legend (PICI): Low (&lt;0.05) | Med (0.06-0.15) | High (0.16-0.25) | Crit (&ge;0.25)</span>
          </p>
          <ul id="station-recs-list" class="deployment-list scrollable-container" style="flex: 1; min-height: 480px; max-height: 800px;"></ul>
        </article>

      </div>

      <!-- Live Dispatch & Activity Log -->
      <article class="card log-card" style="padding: 20px; margin-top: 24px; margin-bottom: 24px;">
        <div class="card-header">
          <span>Operational Feed</span>
          <strong style="background:var(--green-soft); color:var(--green);">Active Feed</strong>
        </div>
        <h2>Live Patrol Dispatch Log</h2>
        <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 16px 0; line-height: 1.4;">
          Real-time logs of police unit deployments, recalls, and priority alerts for Bengaluru Traffic Command.
        </p>
        <div id="dispatch-activity-log" class="scrollable-container" style="
          max-height: 160px;
          overflow-y: auto;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 12px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          display: grid;
          gap: 6px;
          color: var(--text-2);
        ">
          <div>[20:30:15] [SYSTEM] - Initialized BTP Command Baseline. Ready for proactive dispatch.</div>
          <div>[20:31:02] [SYSTEM] - Hotspot predictive models loaded (Model Accuracy: 94.2%).</div>
        </div>
      </article>

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

  // Retrieve patrol roster and assignments from localStorage
  let patrolRoster = null;
  try {
    const savedRoster = localStorage.getItem("parksense.patrol_roster");
    if (savedRoster) {
      patrolRoster = JSON.parse(savedRoster);
    }
  } catch (e) {
    console.error("Error reading patrol roster", e);
  }

  let assignedUnits = {};
  try {
    const savedAssigned = localStorage.getItem("parksense.assigned_units");
    if (savedAssigned) {
      assignedUnits = JSON.parse(savedAssigned);
    }
  } catch (e) {
    console.error("Error reading assigned units", e);
  }

  // Derive dispatchedKeys from assignedUnits to stay in sync
  const dispatchedKeys = new Set(Object.keys(assignedUnits));

  function saveDispatchedState() {
    try {
      localStorage.setItem("parksense.assigned_units", JSON.stringify(assignedUnits));
      localStorage.setItem("parksense.dispatched_patrols", JSON.stringify(Array.from(dispatchedKeys)));
    } catch (e) {
      console.error("Error saving dispatch state", e);
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

  // Set default values:
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

  // Set default values:
  if (uniqueStations.includes("Shivajinagar")) {
    stationSelect.value = "Shivajinagar";
  } else if (uniqueStations.length > 0) {
    stationSelect.value = uniqueStations[0];
  }

  daySelect.value = "3";

  // Renders the dynamic Roster Setup Form / Roster Active details
  const rosterCardContainer = document.getElementById("roster-card-container");

  function renderRosterCard() {
    if (!rosterCardContainer) return;

    if (!patrolRoster) {
      // Setup Mode Form
      rosterCardContainer.innerHTML = `
        <h2>Initialize Patrol Shift</h2>
        <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 10px 0; line-height: 1.4;">
          Note: Staffing rules require 1 officer per motorcycle, and 2 per jeep/tow truck. Deployed units are reserved and cannot be double-assigned.
        </p>
        <div style="display: grid; gap: 12px;">
          <div style="display: grid; gap: 4px;">
            <label style="font-size: 10px; font-weight: 700; color: var(--accent-2);">ACTIVE OFFICERS</label>
            <input type="number" id="setup-officers" value="8" min="1" style="width: 100%; padding: 8px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 13px;" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <div style="display: grid; gap: 4px;">
              <label style="font-size: 8px; font-weight: 700; color: var(--text-2);">MOTORCYCLES</label>
              <input type="number" id="setup-motorcycles" value="3" min="0" style="width: 100%; padding: 8px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 13px;" />
            </div>
            <div style="display: grid; gap: 4px;">
              <label style="font-size: 8px; font-weight: 700; color: var(--text-2);">JEEPS</label>
              <input type="number" id="setup-jeeps" value="2" min="0" style="width: 100%; padding: 8px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 13px;" />
            </div>
            <div style="display: grid; gap: 4px;">
              <label style="font-size: 8px; font-weight: 700; color: var(--text-2);">TOW TRUCKS</label>
              <input type="number" id="setup-towtrucks" value="1" min="0" style="width: 100%; padding: 8px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 13px;" />
            </div>
          </div>
          <div id="roster-setup-error" style="color: var(--red); font-size: 11px; font-weight: 600; display: none;"></div>
          <button id="btn-save-roster" type="button" style="width: 100%; padding: 10px; background: var(--accent); color: var(--text); border: none; border-radius: var(--radius-sm); font-size: 12px; font-weight: 700; cursor: pointer; transition: background 150ms; margin-top: 4px;">
            Create Patrol Roster
          </button>
        </div>
      `;

      // Bind button click for saving roster
      document.getElementById("btn-save-roster").addEventListener("click", () => {
        const officers = parseInt(document.getElementById("setup-officers").value) || 0;
        const motorcycles = parseInt(document.getElementById("setup-motorcycles").value) || 0;
        const jeeps = parseInt(document.getElementById("setup-jeeps").value) || 0;
        const towTrucks = parseInt(document.getElementById("setup-towtrucks").value) || 0;
        const errDiv = document.getElementById("roster-setup-error");

        // Staffing validation rule
        const requiredOfficers = (motorcycles * 1) + (jeeps * 2) + (towTrucks * 2);
        if (requiredOfficers > officers) {
          errDiv.textContent = `⚠️ Insufficient officers (${officers} available, ${requiredOfficers} required: Motorcycle=1, Jeep=2, Tow Truck=2).`;
          errDiv.style.display = "block";
          return;
        }

        if (motorcycles === 0 && jeeps === 0 && towTrucks === 0) {
          errDiv.textContent = `⚠️ Please configure at least one vehicle.`;
          errDiv.style.display = "block";
          return;
        }

        // Generate units
        const units = [];
        for (let i = 1; i <= motorcycles; i++) {
          units.push({ id: `Cheetah-${i}`, name: `Cheetah-${i} (Motorcycle)`, type: "Motorcycle" });
        }
        for (let i = 1; i <= jeeps; i++) {
          units.push({ id: `Falcon-${i}`, name: `Falcon-${i} (Jeep)`, type: "Jeep" });
        }
        for (let i = 1; i <= towTrucks; i++) {
          units.push({ id: `Eagle-${i}`, name: `Eagle-${i} (Tow Truck)`, type: "Tow Truck" });
        }

        patrolRoster = { officers, motorcycles, jeeps, towTrucks, units };
        localStorage.setItem("parksense.patrol_roster", JSON.stringify(patrolRoster));
        
        // Reset active assignments
        assignedUnits = {};
        localStorage.setItem("parksense.assigned_units", JSON.stringify(assignedUnits));
        dispatchedKeys.clear();
        localStorage.setItem("parksense.dispatched_patrols", JSON.stringify([]));

        renderRosterCard();
        updateCalendarGrid();
        updateStationRecs();
        showToast("Patrol roster successfully initialized!", "success");
      });

    } else {
      // Active Roster Mode
      const deployedUnits = new Set(Object.values(assignedUnits));
      const availableUnits = patrolRoster.units.filter(u => !deployedUnits.has(u.name));

      let selectOptionsHtml = "";
      if (availableUnits.length === 0) {
        selectOptionsHtml = `<option value="">No units available (All deployed)</option>`;
      } else {
        selectOptionsHtml = availableUnits.map(u => `<option value="${u.name}">${u.name}</option>`).join("");
      }

      const unitListHtml = patrolRoster.units.map(u => {
        const isDeployed = deployedUnits.has(u.name);
        let deployedLocInfo = "";
        if (isDeployed) {
          const matchedKey = Object.keys(assignedUnits).find(k => assignedUnits[k] === u.name);
          if (matchedKey) {
            const [rank, day, hour] = matchedKey.split("_");
            const dayName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day] || day;
            deployedLocInfo = `Deployed to Hotspot #${rank} (${dayName} ${hour}:00)`;
          } else {
            deployedLocInfo = "Deployed";
          }
        }
        const badgeColor = isDeployed ? "var(--red)" : "var(--green)";
        const statusText = isDeployed ? deployedLocInfo : "Available";

        return `
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); border:1px solid var(--border); padding:6px 10px; border-radius:4px; font-size:11px;">
            <strong>${u.name}</strong>
            <span style="color:${badgeColor}; font-weight:700; font-size:10px; text-align:right; max-width:60%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${statusText}">
              ${statusText}
            </span>
          </div>
        `;
      }).join("");

      rosterCardContainer.innerHTML = `
        <h2>Patrol Unit Roster</h2>
        <p style="font-size: 11px; color: var(--text-2); margin: -4px 0 10px 0; line-height: 1.4;">
          Active: <b>${patrolRoster.officers} Officers</b> | Roster: <b>${patrolRoster.units.length} Units</b>
        </p>
        <div style="display: grid; gap: 12px;">
          <div style="display: grid; gap: 4px;">
            <label for="dispatch-unit-select" style="font-size: 10px; font-weight: 700; color: var(--accent-2);">SELECT UNIT FOR DEPLOYMENT</label>
            <select id="dispatch-unit-select" style="width: 100%; padding: 10px; background: var(--surface-3); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; outline: none;">
              ${selectOptionsHtml}
            </select>
          </div>
          
          <div style="border-top: 1px solid var(--border); margin-top: 4px; padding-top: 8px;">
            <span style="font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Unit Status List</span>
            <div id="roster-unit-list" style="display: grid; gap: 6px; max-height: 150px; overflow-y: auto; padding-right: 4px;">
              ${unitListHtml}
            </div>
          </div>
          
          <button id="btn-reset-roster" type="button" style="background: none; border: 1px dashed var(--border-strong); color: var(--red); padding: 8px; font-size: 11px; font-weight: 700; border-radius: var(--radius-sm); cursor: pointer; transition: all 150ms; width: 100%; text-align: center; margin-top: 4px;">
            Reset & Setup New Shift
          </button>
        </div>
      `;

      // Bind Reset Button
      document.getElementById("btn-reset-roster").addEventListener("click", () => {
        if (confirm("Reset the shift roster? This will recall all active deployments.")) {
          patrolRoster = null;
          assignedUnits = {};
          dispatchedKeys.clear();
          localStorage.removeItem("parksense.patrol_roster");
          localStorage.removeItem("parksense.assigned_units");
          localStorage.removeItem("parksense.dispatched_patrols");
          renderRosterCard();
          updateCalendarGrid();
          updateStationRecs();
          showToast("Roster reset. Please configure new shift parameters.", "info");
        }
      });
    }
  }

  // Renders the overall city-wide calendar grid
  function updateCalendarGrid() {
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
          let opacity = 0.15;
          if (count > 10) opacity = 0.4;
          if (count > 25) opacity = 0.7;
          if (count > 45) opacity = 0.95;

          const cellBg = `rgba(124, 92, 191, ${opacity})`;
          cellStyle += ` background: ${cellBg};`;
          
          cellText = `<span style="background: var(--surface-2); border: 1px solid var(--border); padding: 3px 5px; border-radius: 4px; font-size: 9px; font-weight: 800; color: var(--accent-2);">${count} zones</span>`;
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
        
        const filtered = enrichedRecs.filter(r => r.day_of_week === day && r.hour === hour);
        filtered.sort((a, b) => b.priority_score - a.priority_score);

        modalTitle.textContent = `City-wide Chronic Bottlenecks (Hotspots) — ${dayNames[day]} ${String(hour).padStart(2, "0")}:00`;
        modalSubtitle.innerHTML = `Displaying all ${filtered.length} active bottleneck zones (Hotspots) across Bengaluru. Deploy units manually.<br/>
         <span style="font-size: 10px; color: var(--muted); display: block; margin-top: 3px;">Severity Legend (PICI): Low (&lt;0.05) | Med (0.06-0.15) | High (0.16-0.25) | Crit (&ge;0.25)</span>`;
        
        if (filtered.length === 0) {
          modalRecsList.innerHTML = `<li class="status-card" style="padding:20px;text-align:center;color:var(--text-2)">No hotspots scheduled for this hour.</li>`;
        } else {
          modalRecsList.innerHTML = filtered.map((item, index) => {
            const key = `${item.hotspot_rank}_${item.day_of_week}_${item.hour}`;
            const isDispatched = dispatchedKeys.has(key);
            const isDispatchedClass = isDispatched ? "is-dispatched" : "";
            const assignedUnit = assignedUnits[key];
            const unitBadgeHtml = assignedUnit 
              ? `<span class="badge badge-green unit-badge" style="font-size: 8px; margin-left: 6px; padding: 1px 4px;">${assignedUnit}</span>` 
              : "";
            
            const deployButtonHtml = `
              <button class="deploy-btn ${isDispatchedClass}" 
                      data-key="${key}"
                      data-station="${item.police_station}"
                      data-day="${dayNames[item.day_of_week]}"
                      data-hour="${item.hour}"
                      data-rank="${item.hotspot_rank}"
                      data-score="${item.priority_score}">
                <span class="btn-text-normal">Deploy Patrol</span>
                <span class="btn-text-dispatched">✓ Dispatched</span>
                <span class="btn-text-hover">Recall Patrol</span>
                <span class="btn-text-loading">Deploying...</span>
              </button>
            `;

            const avgPiciVal = Number(item.predicted_pici) || 0.0;
            const capacityLoss = Math.min(95, Math.max(15, Math.round(15 + (avgPiciVal / 0.25) * 70)));

            return `
              <li class="deployment-item ${isDispatchedClass}" title="Priority Score: ${Number(item.priority_score).toFixed(3)}">
                <div class="deployment-rank">#${item.hotspot_rank}</div>
                <div class="deployment-body">
                  <div class="deployment-topline">
                    <strong style="display:flex; align-items:center;">${item.police_station} Sector${unitBadgeHtml}</strong>
                    <span>Hotspot Rank #${item.hotspot_rank}</span>
                  </div>
                  <div class="deployment-meta">
                    <span>GPS <b>${Number(item.center_lat).toFixed(4)}, ${Number(item.center_lng).toFixed(4)}</b></span>
                    <span>Expected Violations <b>${Number(item.predicted_violations).toFixed(1)}</b></span>
                    <span>PICI <b>${avgPiciVal.toFixed(2)}</b></span>
                    <span>Choke <b style="color:var(--red)">${capacityLoss}%</b></span>
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
    
    let filtered = enrichedRecs.filter(r => r.police_station === selectedStation);

    if (selectedDay !== "all") {
      const dayInt = parseInt(selectedDay);
      filtered = filtered.filter(r => r.day_of_week === dayInt);
    }

    if (startHour <= endHour) {
      filtered = filtered.filter(r => r.hour >= startHour && r.hour <= endHour);
    } else {
      filtered = filtered.filter(r => r.hour >= startHour || r.hour <= endHour);
    }

    filtered.sort((a, b) => b.priority_score - a.priority_score);

    const totalSlotsCount = filtered.length;
    recsTitle.textContent = `${selectedStation} Sector Bottleneck Zones (Hotspots)`;
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
      stationRecsList.innerHTML = `<li class="status-card" style="padding: 24px; text-align: center; color: var(--text-2);">No bottleneck zones found for this sector in the selected slot.</li>`;
      return;
    }

    const html = filtered.map((item) => {
      const key = `${item.hotspot_rank}_${item.day_of_week}_${item.hour}`;
      const isDispatched = dispatchedKeys.has(key);
      const isDispatchedClass = isDispatched ? "is-dispatched" : "";
      const assignedUnit = assignedUnits[key];
      const unitBadgeHtml = assignedUnit 
        ? `<span class="badge badge-green unit-badge" style="font-size: 8px; margin-left: 6px; padding: 1px 4px;">${assignedUnit}</span>` 
        : "";
      
      const deployButtonHtml = `
        <button class="deploy-btn ${isDispatchedClass}" 
                data-key="${key}"
                data-station="${item.police_station}"
                data-day="${dayNames[item.day_of_week]}"
                data-hour="${item.hour}"
                data-rank="${item.hotspot_rank}"
                data-score="${item.priority_score}">
          <span class="btn-text-normal">Deploy Patrol</span>
          <span class="btn-text-dispatched">✓ Dispatched</span>
          <span class="btn-text-hover">Recall Patrol</span>
          <span class="btn-text-loading">Deploying...</span>
        </button>
      `;

      const avgPiciVal = Number(item.predicted_pici) || 0.0;
      const capacityLoss = Math.min(95, Math.max(15, Math.round(15 + (avgPiciVal / 0.25) * 70)));

      return `
        <li class="deployment-item ${isDispatchedClass}" title="Priority Score: ${Number(item.priority_score).toFixed(2)} (Expected Violations ${Number(item.predicted_violations).toFixed(1)} x Impact ${Number(item.predicted_pici).toFixed(2)})">
          <div class="deployment-rank">#${item.hotspot_rank}</div>
          <div class="deployment-body">
            <div class="deployment-topline">
              <strong style="display:flex; align-items:center;">${item.police_station} Sector${unitBadgeHtml}</strong>
              <span>${dayNames[item.day_of_week]} ${String(item.hour).padStart(2, "0")}:00</span>
            </div>
            <div class="deployment-meta">
              <span>GPS <b>${Number(item.center_lat).toFixed(4)}, ${Number(item.center_lng).toFixed(4)}</b></span>
              <span>Expected Violations <b>${Number(item.predicted_violations).toFixed(1)}</b></span>
              <span>PICI <b>${avgPiciVal.toFixed(2)}</b></span>
              <span>Choke <b style="color:var(--red)">${capacityLoss}%</b></span>
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
    const rank = button.dataset.rank;

    function getLocalHourLabel(h) {
      if (h === 0) return "12 AM";
      if (h === 12) return "12 PM";
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH} ${ampm}`;
    }

    function logActivity(message) {
      const logContainer = document.getElementById("dispatch-activity-log");
      if (!logContainer) return;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const entry = document.createElement("div");
      entry.textContent = `[${timeStr}] ${message}`;
      logContainer.appendChild(entry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }

    if (!patrolRoster) {
      showToast("Please initialize the Patrol Shift Roster first!", "error");
      return;
    }

    if (dispatchedKeys.has(key)) {
      // Recall action
      const unitName = assignedUnits[key] || "Patrol Unit";
      delete assignedUnits[key];
      dispatchedKeys.delete(key);
      saveDispatchedState();

      // UI Updates for all matching buttons in view
      document.querySelectorAll(`.deploy-btn[data-key="${key}"]`).forEach(btn => {
        btn.classList.remove("is-dispatched");
        const card = btn.closest(".deployment-item");
        if (card) {
          card.classList.remove("is-dispatched");
          const unitBadge = card.querySelector(".unit-badge");
          if (unitBadge) unitBadge.remove();
        }
      });

      logActivity(`[RECALLED] ${unitName} recalled from Hotspot #${rank} (${station} Sector).`);
      showToast(`Patrol Recalled: Hotspot #${rank} | ${day} ${getLocalHourLabel(hourVal)} | Unit returned to station`, "info");
      
      renderRosterCard();
    } else {
      // Deploy action
      const unitSelect = document.getElementById("dispatch-unit-select");
      const selectedUnit = unitSelect ? unitSelect.value : "";

      if (!selectedUnit || selectedUnit.startsWith("No units")) {
        showToast("No available units in roster! Free up a unit or reset roster.", "error");
        return;
      }

      button.classList.add("is-loading");

      setTimeout(() => {
        button.classList.remove("is-loading");
        
        assignedUnits[key] = selectedUnit;
        dispatchedKeys.add(key);
        saveDispatchedState();

        // UI Updates for all matching buttons in view
        document.querySelectorAll(`.deploy-btn[data-key="${key}"]`).forEach(btn => {
          btn.classList.add("is-dispatched");
          const card = btn.closest(".deployment-item");
          if (card) {
            card.classList.add("is-dispatched");
            const topline = card.querySelector(".deployment-topline");
            if (topline) {
              const existingBadge = topline.querySelector(".unit-badge");
              if (existingBadge) {
                existingBadge.textContent = selectedUnit;
              } else {
                topline.insertAdjacentHTML("beforeend", `<span class="badge badge-green unit-badge" style="font-size: 8px; margin-left: 6px; padding: 1px 4px;">${selectedUnit}</span>`);
              }
            }
          }
        });

        logActivity(`[DEPLOYED] ${selectedUnit} dispatched to Hotspot #${rank} (${station} Sector) | Priority Score: ${Number(score).toFixed(2)}.`);
        showToast(`Patrol Deployed: ${selectedUnit} -> Hotspot #${rank} (${station} Sector) | ${day} ${getLocalHourLabel(hourVal)}`, "success");
        
        renderRosterCard();
      }, 500);
    }
  }

  // Initial Render calls
  renderRosterCard();
  updateCalendarGrid();
  updateStationRecs();

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

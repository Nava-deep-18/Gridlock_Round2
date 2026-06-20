import "./index.css";
import { renderDashboard } from "./components/Dashboard.jsx";
import { initMapView, renderMapPage } from "./components/MapView.jsx";
import { renderDispatchPage, initDispatchView } from "./components/DispatchView.jsx";
import { renderNavbar } from "./components/Navbar.jsx";
import { fetchJson, modePath, uploadCsv } from "./utils/apiClient.js";

const root = document.getElementById("root");
const state = {
  mode: "historical",   // "historical" | "new_data"
  view: "dashboard",    // "dashboard" | "map"
  isLoading: false,
  navOpen: false,
  uploadMeta: readUploadMeta(),
};

function readUploadMeta() {
  try {
    return JSON.parse(localStorage.getItem("parksense.uploadMeta")) || null;
  } catch {
    return null;
  }
}

function writeUploadMeta(meta) {
  state.uploadMeta = meta;
  localStorage.setItem("parksense.uploadMeta", JSON.stringify(meta));
}

function formatProcessedTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function parseApiError(error) {
  try {
    const parsed = JSON.parse(error.message);
    return parsed.detail || error.message;
  } catch {
    return error.message;
  }
}

async function fetchOptional(path, fallback) {
  try {
    return await fetchJson(path);
  } catch {
    return fallback;
  }
}

function renderLoading() {
  root.innerHTML = `
    <main class="shell${state.navOpen ? " nav-pinned" : ""}">
      ${renderNavbar(state.mode, state.view, state.navOpen)}
      <section class="status-card">Loading ${state.mode === "historical" ? "historical" : "new data"} ${state.view === "map" ? "map" : "intelligence"}...</section>
    </main>
  `;
  bindNav();
}

function renderError(error) {
  root.innerHTML = `
    <main class="shell${state.navOpen ? " nav-pinned" : ""}">
      ${renderNavbar(state.mode, state.view, state.navOpen)}
      <section class="status-card error">
        <strong>Could not load dashboard data</strong>
        <span>${error.message}</span>
      </section>
    </main>
  `;
  bindNav();
}

async function loadDashboard(mode = state.mode) {
  state.mode = mode;
  state.isLoading = true;
  renderLoading();

  try {
    if (state.view === "map") {
      const [heatmap, hotspots] = await Promise.all([
        fetchOptional(modePath("/api/heatmap?limit=10000", mode), []),
        fetchOptional(modePath("/api/hotspots", mode), []),
      ]);
      root.innerHTML = renderMapPage({
        mode,
        view: state.view,
        navOpen: state.navOpen,
      });
      initMapView(heatmap, hotspots, mode);
    } else if (state.view === "dispatch") {
      const [hotspots, recommendations] = await Promise.all([
        fetchJson(modePath("/api/hotspots", mode)),
        fetchJson(modePath("/api/recommendations", mode)),
      ]);
      root.innerHTML = renderDispatchPage({
        mode,
        view: state.view,
        navOpen: state.navOpen,
      });
      initDispatchView(hotspots, recommendations, mode);
    } else {
      const [
        health, stats, hotspots, recommendations, stationSummary,
        temporalSummary, vehicleSummary, repeatOffenders
      ] = await Promise.all([
        fetchJson(modePath("/api/health", mode)),
        fetchJson(modePath("/api/stats", mode)),
        fetchJson(modePath("/api/hotspots", mode)),
        fetchJson(modePath("/api/recommendations", mode)),
        fetchJson(modePath("/api/summary/station", mode)),
        fetchOptional(modePath("/api/summary/temporal", mode), []),
        fetchOptional(modePath("/api/summary/vehicle", mode), []),
        fetchOptional(modePath("/api/summary/repeat-offenders", mode), []),
      ]);

      root.innerHTML = renderDashboard({
        mode,
        view: state.view,
        navOpen: state.navOpen,
        uploadMeta: state.uploadMeta,
        health,
        stats,
        hotspots,
        recommendations,
        stationSummary,
        temporalSummary,
        vehicleSummary,
        repeatOffenders,
      });
      bindUploadForm();
    }

    bindNav();
  } catch (error) {
    renderError(error);
  } finally {
    state.isLoading = false;
  }
}

/**
 * Binds ALL navigation interactions:
 * - [data-mode] buttons → switch data mode, return to dashboard view
 * - [data-view] buttons/links → switch view (map / dashboard)
 * - [data-side-nav] → toggle sidebar expand
 */
function bindNav() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.dataset.mode;
      if (!nextMode || state.isLoading) return;
      
      // If switching mode from within the map or dispatch header controls, keep the active view
      if ((state.view === "map" || state.view === "dispatch") && button.closest(".mode-toggle-group")) {
        // Keep active view (map or dispatch)
      } else {
        if (nextMode === state.mode && state.view === "dashboard") return;
        state.view = "dashboard";
      }
      
      loadDashboard(nextMode);
    });
  });

  // View buttons (Map / back to dashboard)
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextView = button.dataset.view;
      if (!nextView || nextView === state.view || state.isLoading) return;
      
      let nextMode = state.mode;
      if (nextView === "map" || nextView === "dispatch") {
        nextMode = "historical";
      }
      
      state.view = nextView;
      loadDashboard(nextMode);
    });
  });

  // Sidebar toggle — only when clicking the nav background, not a button
  document.querySelectorAll("[data-side-nav]").forEach((nav) => {
    nav.addEventListener("click", (event) => {
      if (event.target.closest("[data-mode]") || event.target.closest("[data-view]")) return;
      state.navOpen = !state.navOpen;
      nav.classList.toggle("is-open", state.navOpen);
      document.querySelector(".shell")?.classList.toggle("nav-pinned", state.navOpen);
    });
  });
}

function bindUploadForm() {
  const form = document.getElementById("upload-form");
  if (!form) return;

  const fileInput = document.getElementById("csv-file");
  const fileName = document.getElementById("selected-file-name");
  const button = document.getElementById("upload-button");
  const status = document.getElementById("upload-status");

  fileInput?.addEventListener("change", () => {
    fileName.textContent = fileInput.files[0]?.name || "Choose a violation export";
    status.innerHTML = "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
      status.innerHTML = `
        <div class="upload-result is-error">
          <strong>No file selected</strong>
          <span>Choose a CSV export before processing New Data mode.</span>
        </div>
      `;
      return;
    }

    button.disabled = true;
    button.textContent = "Processing...";
    status.innerHTML = `
      <div class="upload-result is-processing">
        <strong>Processing ${file.name}</strong>
        <span>Running validation, PICI scoring, hotspot clustering, and patrol-window generation.</span>
      </div>
    `;

    try {
      await uploadCsv(file);
      writeUploadMeta({
        filename: file.name,
        processedAt: formatProcessedTime(),
      });
      status.innerHTML = `
        <div class="upload-result is-success">
          <strong>Upload processed successfully</strong>
          <span>${file.name} is now active in New Data mode.</span>
        </div>
      `;
      await loadDashboard("new_data");
    } catch (error) {
      status.innerHTML = `
        <div class="upload-result is-error">
          <strong>Upload failed</strong>
          <span>${parseApiError(error)}</span>
        </div>
      `;
    } finally {
      button.disabled = false;
      button.textContent = "Process Upload";
    }
  });
}

loadDashboard();

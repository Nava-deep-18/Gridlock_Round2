import "./index.css";
import { renderDashboard } from "./components/Dashboard.jsx";
import { renderNavbar } from "./components/Navbar.jsx";
import { fetchJson, modePath, uploadCsv } from "./utils/apiClient.js";

const root = document.getElementById("root");
const state = {
  mode: "historical",
  isLoading: false,
  navOpen: false,
};

function renderLoading() {
  root.innerHTML = `
    <main class="shell${state.navOpen ? " nav-pinned" : ""}">
      ${renderNavbar(state.mode, state.navOpen)}
      <section class="status-card">Loading ${state.mode === "historical" ? "historical" : "new data"} intelligence...</section>
    </main>
  `;
  bindModeButtons();
}

function renderError(error) {
  root.innerHTML = `
    <main class="shell${state.navOpen ? " nav-pinned" : ""}">
      ${renderNavbar(state.mode, state.navOpen)}
      <section class="status-card error">
        <strong>Could not load dashboard data</strong>
        <span>${error.message}</span>
      </section>
    </main>
  `;
  bindModeButtons();
}

async function loadDashboard(mode = state.mode) {
  state.mode = mode;
  state.isLoading = true;
  renderLoading();

  try {
    const [health, stats, hotspots, recommendations, stationSummary] = await Promise.all([
      fetchJson(modePath("/api/health", mode)),
      fetchJson(modePath("/api/stats", mode)),
      fetchJson(modePath("/api/hotspots", mode)),
      fetchJson(modePath("/api/recommendations", mode)),
      fetchJson(modePath("/api/summary/station", mode)),
    ]);

    root.innerHTML = renderDashboard({
      mode,
      navOpen: state.navOpen,
      health,
      stats,
      hotspots,
      recommendations,
      stationSummary,
    });
    bindModeButtons();
    bindUploadForm();
  } catch (error) {
    renderError(error);
  } finally {
    state.isLoading = false;
  }
}

function bindModeButtons() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.dataset.mode;
      if (!nextMode || nextMode === state.mode || state.isLoading) {
        return;
      }
      loadDashboard(nextMode);
    });
  });

  document.querySelectorAll("[data-side-nav]").forEach((nav) => {
    nav.addEventListener("click", (event) => {
      if (event.target.closest("[data-mode]")) {
        return;
      }
      state.navOpen = !state.navOpen;
      nav.classList.toggle("is-open", state.navOpen);
      document.querySelector(".shell")?.classList.toggle("nav-pinned", state.navOpen);
    });
  });
}

function bindUploadForm() {
  const form = document.getElementById("upload-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("upload-status");
    const file = document.getElementById("csv-file").files[0];
    if (!file) {
      status.textContent = "Choose a CSV file first.";
      return;
    }

    status.textContent = "Processing upload...";
    try {
      await uploadCsv(file);
      status.textContent = "Upload processed. Switching to New Data mode...";
      await loadDashboard("new_data");
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

loadDashboard();

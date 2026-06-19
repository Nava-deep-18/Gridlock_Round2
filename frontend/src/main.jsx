import "./index.css";
import { fetchJson, uploadCsv } from "./utils/apiClient.js";

const root = document.getElementById("root");

function metric(label, value) {
  return `
    <section class="metric">
      <span>${label}</span>
      <strong>${value}</strong>
    </section>
  `;
}

function renderLoading() {
  root.innerHTML = `
    <main class="shell">
      <header>
        <p>ParkSense AI</p>
        <h1>Parking Enforcement Intelligence</h1>
      </header>
      <section class="panel">Loading backend data...</section>
    </main>
  `;
}

function renderError(error) {
  root.innerHTML = `
    <main class="shell">
      <header>
        <p>ParkSense AI</p>
        <h1>Parking Enforcement Intelligence</h1>
      </header>
      <section class="panel error">${error.message}</section>
    </main>
  `;
}

function renderApp({ health, stats, hotspots, recommendations, stationSummary }) {
  const topHotspots = hotspots.slice(0, 8).map((item) => `
    <tr>
      <td>${item.hotspot_rank}</td>
      <td>${item.primary_police_station || "Unknown"}</td>
      <td>${item.total_violations}</td>
      <td>${Number(item.total_pici).toFixed(1)}</td>
    </tr>
  `).join("");

  const topRecommendations = recommendations.slice(0, 8).map((item) => `
    <tr>
      <td>${item.hotspot_rank}</td>
      <td>${item.day_of_week}</td>
      <td>${item.hour}:00</td>
      <td>${Number(item.priority_score).toFixed(2)}</td>
    </tr>
  `).join("");

  const stations = stationSummary.slice(0, 5).map((item) => `
    <li>
      <span>${item.police_station}</span>
      <strong>${item.total_violations}</strong>
    </li>
  `).join("");

  root.innerHTML = `
    <main class="shell">
      <header>
        <p>ParkSense AI</p>
        <h1>Parking Enforcement Intelligence</h1>
      </header>

      <section class="metrics">
        ${metric("API health", health.status)}
        ${metric("Hotspots", stats.total_chronic_hotspots)}
        ${metric("High-risk patrol windows", stats.high_risk_patrol_windows)}
        ${metric("Model MAE", stats.model_mae)}
      </section>

      <section class="grid">
        <article class="panel">
          <h2>Top Hotspots</h2>
          <table>
            <thead><tr><th>Rank</th><th>Station</th><th>Violations</th><th>PICI</th></tr></thead>
            <tbody>${topHotspots}</tbody>
          </table>
        </article>

        <article class="panel">
          <h2>Patrol Windows</h2>
          <table>
            <thead><tr><th>Hotspot</th><th>Day</th><th>Hour</th><th>Priority</th></tr></thead>
            <tbody>${topRecommendations}</tbody>
          </table>
        </article>

        <article class="panel">
          <h2>Station Load</h2>
          <ul class="station-list">${stations}</ul>
        </article>

        <article class="panel">
          <h2>Upload New CSV</h2>
          <form id="upload-form">
            <input id="csv-file" type="file" accept=".csv" />
            <button type="submit">Process Upload</button>
          </form>
          <p id="upload-status" class="muted"></p>
        </article>
      </section>
    </main>
  `;

  document.getElementById("upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.getElementById("upload-status");
    const file = document.getElementById("csv-file").files[0];
    if (!file) {
      status.textContent = "Choose a CSV file first.";
      return;
    }

    status.textContent = "Processing upload...";
    try {
      const result = await uploadCsv(file);
      status.textContent = result.message;
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

async function boot() {
  renderLoading();
  try {
    const [health, stats, hotspots, recommendations, stationSummary] = await Promise.all([
      fetchJson("/api/health"),
      fetchJson("/api/stats"),
      fetchJson("/api/hotspots"),
      fetchJson("/api/recommendations"),
      fetchJson("/api/summary/station"),
    ]);
    renderApp({ health, stats, hotspots, recommendations, stationSummary });
  } catch (error) {
    renderError(error);
  }
}

boot();

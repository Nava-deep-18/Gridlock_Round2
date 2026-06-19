// Nav items: Historical mode, New Data / Upload mode, and Map view
const NAV_ITEMS = [
  {
    id: "historical",
    type: "mode",
    label: "Historical",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19h16" />
        <path d="M7 16V8" />
        <path d="M12 16V5" />
        <path d="M17 16v-6" />
      </svg>
    `,
  },
  {
    id: "new_data",
    type: "mode",
    label: "New Data",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v10" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 16v3h14v-3" />
      </svg>
    `,
  },
  {
    id: "map",
    type: "view",
    label: "Map",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    `,
  },
];

// activeMode: "historical" | "new_data"
// activeView: "dashboard" | "map"
export function renderNavbar(activeMode, activeView, isOpen = false) {
  const buttons = NAV_ITEMS.map((item) => {
    // An item is "active" if:
    //   - type=mode → its mode matches && we're in dashboard view
    //   - type=view → we're in map view (only the map item)
    const isActive =
      item.type === "mode"
        ? activeView === "dashboard" && activeMode === item.id
        : activeView === "map";

    const dataAttr =
      item.type === "mode"
        ? `data-mode="${item.id}"`
        : `data-view="${item.id}"`;

    return `
      <button
        class="nav-item${isActive ? " is-active" : ""}"
        type="button"
        ${dataAttr}
        aria-label="${item.label}"
      >
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </button>
    `;
  }).join("");

  return `
    <nav class="side-nav${isOpen ? " is-open" : ""}" data-side-nav aria-label="Primary navigation">
      <div class="brand">
        <span class="brand-mark"></span>
        <div>
          <p>ParkSense AI</p>
          <strong>Enforcement Intelligence</strong>
        </div>
      </div>
      <div class="nav-items" role="group" aria-label="Navigation">
        ${buttons}
      </div>
    </nav>
  `;
}

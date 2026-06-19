const MODES = [
  {
    id: "historical",
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
    label: "New Data",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v10" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 16v3h14v-3" />
      </svg>
    `,
  },
];

export function renderNavbar(activeMode, isOpen = false) {
  const buttons = MODES.map((mode) => `
    <button
      class="nav-item${activeMode === mode.id ? " is-active" : ""}"
      type="button"
      data-mode="${mode.id}"
      aria-label="${mode.label} mode"
    >
      <span class="nav-icon">${mode.icon}</span>
      <span class="nav-label">${mode.label}</span>
    </button>
  `).join("");

  return `
    <nav class="side-nav${isOpen ? " is-open" : ""}" data-side-nav aria-label="Primary navigation">
      <div class="brand">
        <span class="brand-mark"></span>
        <div>
          <p>ParkSense AI</p>
          <strong>Parking Enforcement Intelligence</strong>
        </div>
      </div>
      <div class="nav-items" role="group" aria-label="Dashboard mode">
        ${buttons}
      </div>
    </nav>
  `;
}

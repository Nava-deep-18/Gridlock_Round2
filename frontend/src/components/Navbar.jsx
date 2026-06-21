// Nav items: Historical mode, New Data / Upload mode, and Map view
const NAV_ITEMS = [
  {
    id: "historical",
    type: "mode",
    label: "Historical Baseline",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
    label: "Upload Newdata",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 4v10" />
        <path d="m8 8 4-4 4 4" />
        <path d="M5 16v3h14v-3" />
      </svg>
    `,
  },
  {
    id: "map",
    type: "view",
    label: "Enforcement Map",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    `,
  },
  {
    id: "dispatch",
    type: "view",
    label: "Patrol Window",
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="11" r="3" />
        <path d="M12 14v4" />
      </svg>
    `,
  },
];

// activeMode: "historical" | "new_data"
// activeView: "dashboard" | "map" | "dispatch"
export function renderNavbar(activeMode, activeView) {
  const buttons = NAV_ITEMS.map((item) => {
    // An item is "active" if:
    //   - type=mode → its mode matches && we're in dashboard view
    //   - type=view → we're in the corresponding view
    const isActive =
      item.type === "mode"
        ? activeView === "dashboard" && activeMode === item.id
        : activeView === item.id;

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
        style="
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: ${isActive ? "var(--accent-soft)" : "transparent"};
          border: 1px solid ${isActive ? "rgba(124, 92, 191, 0.3)" : "transparent"};
          border-radius: var(--radius-sm);
          color: ${isActive ? "var(--accent-2)" : "var(--text-2)"};
          cursor: pointer;
          transition: all 150ms ease;
          font-family: inherit;
        "
      >
        <span class="nav-icon" style="display: flex; align-items: center; justify-content: center; color: inherit;">
          ${item.icon}
        </span>
        <span class="nav-label" style="font-size: 12px; font-weight: 700; color: inherit;">
          ${item.label}
        </span>
      </button>
    `;
  }).join("");

  return `
    <nav class="top-nav" aria-label="Primary navigation" style="
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      height: 64px;
      background: rgba(18, 18, 28, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-strong);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    ">
      <div class="brand" style="display: flex; align-items: center; gap: 12px; margin: 0;">
        <span class="brand-mark" style="
          width: 14px;
          height: 14px;
          background: var(--accent);
          border-radius: 3px;
          box-shadow: 0 0 8px var(--accent);
          display: inline-block;
        "></span>
        <div>
          <p style="margin: 0; font-size: 13px; font-weight: 800; color: var(--text); letter-spacing: 0.02em;">ParkSense AI</p>
          <strong style="
            margin: 0;
            font-size: 9px;
            font-weight: 800;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            display: block;
            margin-top: -1px;
          ">Enforcement Intelligence</strong>
        </div>
      </div>
      <div class="nav-items" role="group" aria-label="Navigation" style="display: flex; gap: 8px; align-items: center;">
        ${buttons}
      </div>
    </nav>
  `;
}

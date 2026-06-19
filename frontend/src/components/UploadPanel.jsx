export function renderUploadPanel(mode) {
  const modeText = mode === "new_data" ? "Upload CSV and review generated results" : "Switch to New Data to upload";

  return `
    <section class="upload-workspace">
      <div class="upload-copy">
        <span>New Data Workspace</span>
        <h2>Process a fresh violation export</h2>
        <p>Upload a CSV to generate new hotspots, patrol windows, and station summaries from that file.</p>
      </div>
      <form id="upload-form">
        <input id="csv-file" type="file" accept=".csv" />
        <button type="submit">Process Upload</button>
        <p>${modeText}</p>
      </form>
      <p id="upload-status" class="muted"></p>
    </section>
  `;
}

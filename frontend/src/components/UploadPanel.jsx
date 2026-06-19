export function renderUploadPanel(mode) {
  const modeText = mode === "new_data" ? "Processing creates a new isolated operational view." : "Switch to New Data to upload";

  return `
    <section class="upload-workspace">
      <div class="upload-copy">
        <span>New Data Workspace</span>
        <h2>Process a fresh violation export</h2>
        <p>Upload a CSV to generate new hotspots, patrol windows, and station summaries from that file.</p>
      </div>
      <form id="upload-form">
        <label class="file-picker" for="csv-file">
          <span>CSV file</span>
          <strong id="selected-file-name">Choose a violation export</strong>
        </label>
        <input id="csv-file" type="file" accept=".csv" />
        <button id="upload-button" type="submit">Process Upload</button>
        <p class="upload-hint">${modeText}</p>
      </form>
      <div id="upload-status" class="upload-status" aria-live="polite"></div>
    </section>
  `;
}

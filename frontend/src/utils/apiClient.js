const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const REQUEST_TIMEOUT_MS = 15000;

export async function fetchJson(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export function modePath(path, mode) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}mode=${mode}`;
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

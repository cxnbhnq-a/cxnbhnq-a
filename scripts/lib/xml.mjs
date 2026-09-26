export function xmlText(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

export function bounded(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function sanitizeText(input) {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

export function sanitizeEmail(email) {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase().slice(0, 254);
}

export function sanitizeName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .replace(/[<>"'/\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

export function sanitizeCode(code) {
  if (!code || typeof code !== "string") return "";
  return code
    .toUpperCase()
    .replace(/[^A-Z0-9:]/g, "")
    .slice(0, 10);
}

export function sanitizeObs(obs) {
  if (!obs || typeof obs !== "string") return "";
  return obs
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim()
    .slice(0, 200);
}

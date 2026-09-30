/**
 * Generates or retrieves a persistent client device fingerprint hash.
 * Combines browser entropy components (screen resolution, timezone, language, platform).
 */
export function getClientDeviceFingerprint(): string {
  if (typeof window === "undefined") {
    return "srv_default_fingerprint";
  }

  const STORAGE_KEY = "electa_device_fp";

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 16) {
      return existing;
    }
  } catch {
    // LocalStorage might be restricted
  }

  // Calculate browser entropy components
  const components = [
    navigator.userAgent || "",
    navigator.language || "",
    screen.width + "x" + screen.height,
    screen.colorDepth || "",
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "",
  ];

  const rawString = components.join("###");
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  const randomSuffix = Math.random().toString(36).slice(2, 10);
  const fingerprint = `fp_${Math.abs(hash).toString(16)}_${randomSuffix}`;

  try {
    window.localStorage.setItem(STORAGE_KEY, fingerprint);
  } catch {
    // Ignore storage errors
  }

  return fingerprint;
}

function getRandomHex(bytesCount = 4): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(bytesCount);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Date.now().toString(36);
}

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
    const char = rawString.codePointAt(i) ?? 0;
    hash = Math.trunc((hash << 5) - hash + char);
  }

  const randomSuffix = getRandomHex(4);
  const fingerprint = `fp_${Math.abs(hash).toString(16)}_${randomSuffix}`;

  try {
    window.localStorage.setItem(STORAGE_KEY, fingerprint);
  } catch {
    // Ignore storage errors
  }

  return fingerprint;
}

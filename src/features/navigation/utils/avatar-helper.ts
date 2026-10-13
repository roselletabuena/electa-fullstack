/**
 * Generates display initials from user's full name or email address.
 * Follows Electa design guidelines for circular initial avatars.
 */
export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const cleaned = name.trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    if (parts[0]) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  }

  if (email && email.trim().length > 0) {
    const cleanedEmail = email.trim();
    return cleanedEmail.charAt(0).toUpperCase();
  }

  return "U";
}

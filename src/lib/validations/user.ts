export const PASSWORD_MIN_LENGTH = 8;

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function slugifyUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function validateUsername(slug: string): { valid: true } | { valid: false; error: string } {
  if (slug.length < 3 || slug.length > 20) {
    return { valid: false, error: "Username must be between 3 and 20 characters" };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      valid: false,
      error: "Username can only contain lowercase letters, numbers, and hyphens",
    };
  }

  return { valid: true };
}

export function validatePassword(password: string): { valid: true } | { valid: false; error: string } {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    };
  }

  return { valid: true };
}

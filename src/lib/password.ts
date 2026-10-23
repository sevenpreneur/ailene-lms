// Presentation validation mirrors ailene-lms-apis/docs/api/auth.md.
// The API remains authoritative; passwords are never trimmed or truncated.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;
export const RESET_LINK_INVALID_MESSAGE =
  "This reset link is invalid, already used, or has expired";

export type NewPasswordErrors = { password?: string; confirmation?: string };

export function validateNewPassword(
  password: string,
  confirmation: string,
): NewPasswordErrors {
  const errors: NewPasswordErrors = {};
  if (Array.from(password).length < PASSWORD_MIN_LENGTH || !password.trim()) {
    errors.password = `Password minimal ${PASSWORD_MIN_LENGTH} karakter dan tidak boleh hanya spasi.`;
  } else if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    errors.password =
      "Password maksimal 72 byte. Kurangi jumlah karakter, terutama emoji atau simbol.";
  }
  if (!confirmation) errors.confirmation = "Konfirmasi password wajib diisi.";
  else if (confirmation !== password)
    errors.confirmation = "Konfirmasi password tidak sama.";
  return errors;
}

export function isPasswordResetId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{32}$/.test(value);
}

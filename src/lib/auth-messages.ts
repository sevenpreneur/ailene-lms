const messages: Record<string, string> = {
  "Invalid email or password": "Email atau password salah.",
  "This email is not registered":
    "Email ini belum terdaftar. Gunakan email akun LMS Anda.",
  "Password reset email is temporarily unavailable":
    "Email reset belum dapat dikirim. Silakan coba lagi nanti.",
  "This reset link is invalid, already used, or has expired":
    "Tautan reset ini tidak valid, sudah digunakan, atau sudah kedaluwarsa.",
  "Password must be at least 8 characters and at most 72 bytes":
    "Password minimal 8 karakter, maksimal 72 byte, dan tidak boleh hanya spasi.",
  "email and password must not be blank; password must be at most 72 bytes":
    "Isi email dan password. Password maksimal 72 byte.",
  "This Google account is not registered as an LMS user":
    "Akun Google ini belum terdaftar sebagai pengguna LMS.",
  "Failed to verify Google access token":
    "Akun Google belum dapat diverifikasi. Silakan coba lagi.",
  "Invalid or unverified Google access token":
    "Gunakan akun Google dengan email yang sudah terverifikasi.",
};

export function authErrorMessage(message: string, fallback: string): string {
  return messages[message] ?? fallback;
}

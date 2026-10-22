export function safeRedirect(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return "/";
  // Authentication destinations must not point back into the login flow.
  const pathname = value.split(/[?#]/)[0];
  if (pathname.startsWith("/auth") || pathname.startsWith("/api")) return "/";
  return value;
}

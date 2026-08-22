// Single-tenant deployment identity and program window.
// One deployment serves one company running one program, so these values live
// in deployment-level config instead of row-level database state.

// Login page now lives in this app (src/app/(lms)/lms/auth/login).
export const LOGIN_URL = "/auth/login";

export const PROGRAM_START_ISO = "2026-06-26T00:00:00.000Z";
export const PROGRAM_END_ISO = "2026-08-26T00:00:00.000Z";

export function getProgramPeriod(): {
  startIso: string;
  endIso: string;
} {
  return { startIso: PROGRAM_START_ISO, endIso: PROGRAM_END_ISO };
}

export const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME?.trim() || "";

export const PROGRAM_NAME =
  process.env.NEXT_PUBLIC_PROGRAM_NAME?.trim() || "Program AI Adoption";

export const PROGRAM_TOTAL_WEEKS = (() => {
  const start = new Date(PROGRAM_START_ISO);
  const end = new Date(PROGRAM_END_ISO);
  const days = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(1, Math.ceil(days / 7));
})();

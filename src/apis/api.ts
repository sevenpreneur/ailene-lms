import "server-only";

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  code: number;
  status: string;
  message: string;
  data?: T;
};

// Thin client for the ailene-lms-backend (Java/Spring) — see its docs/ for endpoint contracts.
export async function callApi<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<ApiEnvelope<T>> {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL is not configured");
  }

  const { method = "POST", body, token } = options;

  let response: Response;
  try {
    response = await fetch(new URL(path, baseUrl).toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      code: 502,
      status: "BAD_GATEWAY",
      message: "Could not reach the server. Please try again.",
    };
  }

  const data = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;

  if (!data) {
    return {
      success: false,
      code: response.status,
      status: "INTERNAL_SERVER_ERROR",
      message: "Invalid response from server",
    };
  }

  return data;
}

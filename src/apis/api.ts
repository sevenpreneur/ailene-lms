import "server-only";

import LogError from "@/lib/log-error";

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  code: number;
  status: string;
  message: string;
  data?: T;
};

/** Retain section failure separately from a successful empty response. */
export async function captureApiRead<T>(
  request: Promise<T>,
): Promise<{ data: T | null; failed: boolean }> {
  try {
    return { data: await request, failed: false };
  } catch {
    return { data: null, failed: true };
  }
}

// v1 business endpoints use BASE_URL; migrated Go v2 endpoints use LMS_BASE_URL.
export async function callApi<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    backend?: "legacy" | "lms";
  } = {},
): Promise<ApiEnvelope<T>> {
  const envName = options.backend === "lms" ? "LMS_BASE_URL" : "BASE_URL";
  const baseUrl = process.env[envName];
  if (!baseUrl) {
    throw new Error(`${envName} is not configured`);
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
  } catch (err) {
    await LogError(`callApi ${method} ${path}`, "fetch failed", err);
    return {
      success: false,
      code: 502,
      status: "BAD_GATEWAY",
      message: "Could not reach the server. Please try again.",
    };
  }

  const rawBody = await response.text();
  const data = safeJsonParse<ApiEnvelope<T>>(rawBody);

  if (!data) {
    await LogError(
      `callApi ${method} ${path}`,
      `non-JSON response (${response.status})`,
      rawBody.slice(0, 500),
    );
    return {
      success: false,
      code: response.status,
      status: "INTERNAL_SERVER_ERROR",
      message: "Invalid response from server",
    };
  }

  return data;
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

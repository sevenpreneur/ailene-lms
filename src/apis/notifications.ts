import "server-only";

import { cookies } from "next/headers";
import { callApi } from "./api";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import LogError from "@/lib/log-error";

export type NotificationType = "session_reminder" | "post_test_reminder";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  ref_id: string | null;
  event_at: string | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationList = {
  list: NotificationItem[];
  metapaging: {
    total_data: number;
    total_page: number;
    current_page: number;
    page_size: number;
  };
  unread_count: number;
};

export type NotificationReadResult = {
  updated: number;
  unread_count: number;
};

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// Notification v2 endpoints use the caller's active LMS session JWT.
export async function getNotifications(
  projectId: string,
  options: { unreadOnly?: boolean; page?: number; pageSize?: number } = {}
): Promise<NotificationList | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<NotificationList>("/api/v2/notifications", {
    method: "POST",
    body: {
      project_id: projectId,
      unread_only: options.unreadOnly ?? false,
      page: options.page ?? 1,
      page_size: options.pageSize ?? 20,
    },
    token: sessionToken,
    backend: "lms",
  });

  if (!result.success || !result.data) {
    await LogError("getNotifications", result.code, result.status, result.message);
    return null;
  }
  return result.data;
}

export async function getUnreadNotificationCount(
  projectId: string
): Promise<number | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<{ unread_count: number }>(
    "/api/v2/notifications/unread-count",
    {
      method: "POST",
      body: { project_id: projectId },
      token: sessionToken,
      backend: "lms",
    }
  );

  if (!result.success || !result.data) {
    await LogError(
      "getUnreadNotificationCount",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data.unread_count;
}

export async function markNotificationsRead(
  projectId: string,
  notificationIds: number[]
): Promise<NotificationReadResult | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<NotificationReadResult>(
    "/api/v2/notifications/read",
    {
      method: "POST",
      body: { project_id: projectId, notification_ids: notificationIds },
      token: sessionToken,
      backend: "lms",
    }
  );

  if (!result.success || !result.data) {
    await LogError(
      "markNotificationsRead",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data;
}

export async function markAllNotificationsRead(
  projectId: string
): Promise<NotificationReadResult | null> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) return null;

  const result = await callApi<NotificationReadResult>(
    "/api/v2/notifications/read-all",
    {
      method: "POST",
      body: { project_id: projectId },
      token: sessionToken,
      backend: "lms",
    }
  );

  if (!result.success || !result.data) {
    await LogError(
      "markAllNotificationsRead",
      result.code,
      result.status,
      result.message
    );
    return null;
  }
  return result.data;
}

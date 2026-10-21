"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Refreshes on navigation and when the tab regains focus, never on a timer, so an idle tab never wakes the DB.
export function useUnreadNotifications(projectId: string, enabled: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const fetchUnreadCount = useCallback(async (): Promise<number | null> => {
    if (!enabled || !projectId) return null;
    try {
      const response = await fetch("/api/notifications/unread-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { unread_count: number };
      return data.unread_count;
    } catch {
      return null;
    }
  }, [enabled, projectId]);

  useEffect(() => {
    let cancelled = false;
    fetchUnreadCount().then((count) => {
      if (!cancelled && count !== null) setUnreadCount(count);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchUnreadCount, pathname]);

  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      fetchUnreadCount().then((count) => {
        if (count !== null) setUnreadCount(count);
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, fetchUnreadCount]);

  return { unreadCount, setUnreadCount };
}

import type { NotificationItem, NotificationType } from "@/apis/notifications";
import { formatChapterSessionDate } from "@/lib/date-time-manipulation";
import {
  CalendarClock,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

export const NOTIFICATION_ICON: Record<NotificationType, LucideIcon> = {
  session_reminder: CalendarClock,
  post_test_reminder: ClipboardCheck,
};

// Both v2 reminder types carry a chapter ID in ref_id.
export function notificationHref(
  projectId: string,
  item: NotificationItem,
): string | null {
  const ref = item.ref_id;
  switch (item.type) {
    case "session_reminder":
    case "post_test_reminder":
      return ref ? `/${projectId}/student/learning-path/${ref}` : null;
    default:
      return null;
  }
}

export function notificationEventLabel(item: NotificationItem): string | null {
  if (!item.event_at) return null;
  const when = formatChapterSessionDate(item.event_at, "D MMM · HH:mm [WIB]");
  return `Pesan otomatis pada ${when}`;
}

import type { NotificationItem, NotificationType } from "@/apis/notifications";
import { formatChapterSessionDate } from "@/lib/date-time-manipulation";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Hourglass,
  LockOpen,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

export const NOTIFICATION_ICON: Record<NotificationType, LucideIcon> = {
  chapter_reminder: CalendarClock,
  chapter_unlocked: LockOpen,
  prompt_assigned: ClipboardList,
  use_case_assigned: ClipboardList,
  prompt_deadline: Hourglass,
  use_case_deadline: Hourglass,
  prompt_reviewed: CheckCircle2,
  use_case_reviewed: CheckCircle2,
  coaching_note: MessageSquareText,
  prompt_submitted: ClipboardCheck,
  use_case_submitted: ClipboardCheck,
};

// ref_id is whatever id the target page takes, so the backend's type alone picks the route.
export function notificationHref(
  projectId: string,
  item: NotificationItem
): string | null {
  const ref = item.ref_id;
  switch (item.type) {
    case "chapter_reminder":
    case "chapter_unlocked":
      return ref ? `/${projectId}/student/learning-path/${ref}` : null;
    case "prompt_assigned":
    case "prompt_deadline":
    case "prompt_reviewed":
      return ref ? `/${projectId}/student/skill-practice/prompts/${ref}` : null;
    case "use_case_assigned":
    case "use_case_deadline":
    case "use_case_reviewed":
      return ref
        ? `/${projectId}/student/skill-practice/use-cases/${ref}`
        : null;
    case "coaching_note":
      return `/${projectId}/student`;
    case "prompt_submitted":
      return ref ? `/${projectId}/champion/submissions/prompts/${ref}` : null;
    case "use_case_submitted":
      return ref ? `/${projectId}/champion/submissions/use-cases/${ref}` : null;
    default:
      return null;
  }
}

export function notificationEventLabel(item: NotificationItem): string | null {
  if (!item.event_at) return null;
  const when = formatChapterSessionDate(item.event_at, "D MMM · HH:mm [WIB]");
  switch (item.type) {
    case "chapter_reminder":
    case "chapter_unlocked":
      return `Sesi ${when}`;
    case "prompt_assigned":
    case "use_case_assigned":
    case "prompt_deadline":
    case "use_case_deadline":
      return `Deadline ${when}`;
    default:
      return null;
  }
}

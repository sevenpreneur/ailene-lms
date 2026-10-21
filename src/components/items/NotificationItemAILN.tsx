import type { NotificationItem } from "@/apis/notifications";
import { formatRelativeTime } from "@/lib/date-time-manipulation";
import { NOTIFICATION_ICON, notificationEventLabel } from "@/lib/notifications";

export default function NotificationItemAILN({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: (item: NotificationItem) => void;
}) {
  const Icon = NOTIFICATION_ICON[item.type];
  const unread = item.read_at === null;
  const eventLabel = notificationEventLabel(item);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:cursor-pointer hover:bg-card-2 ${
        unread ? "bg-claude/[0.06] dark:bg-claude/15" : ""
      }`}
    >
      <span
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
          unread
            ? "bg-claude/15 text-claude dark:text-lime-bright"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={`text-sm text-foreground ${unread ? "font-medium" : "font-normal"}`}
        >
          {item.title}
        </span>
        {item.body && (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {item.body}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {eventLabel ? `${eventLabel} · ` : ""}
          {formatRelativeTime(item.created_at)}
        </span>
      </span>
      {unread && (
        <span
          aria-label="Belum dibaca"
          className="mt-2 size-2 shrink-0 rounded-full bg-claude"
        />
      )}
    </button>
  );
}

import { Bell } from "lucide-react";

// Looks like a nav item but opens the notification sheet instead of routing.
export default function SidebarNotificationButtonAILN({
  unreadCount,
  collapsed,
  onClick,
}: {
  unreadCount: number;
  collapsed: boolean;
  onClick: () => void;
}) {
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);
  const label =
    unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi";

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={`relative flex h-9 w-full items-center rounded-lg text-sm font-normal text-sb-text transition-colors hover:cursor-pointer hover:bg-sb-item-hover hover:text-sb-text-strong lg:h-8 ${
        collapsed ? "justify-center" : "gap-2.5 px-2.5"
      }`}
    >
      <Bell className="size-4 shrink-0" />
      {!collapsed && <span className="flex-1 truncate text-left">Notifikasi</span>}
      {unreadCount > 0 &&
        (collapsed ? (
          <span className="absolute right-2 top-1.5 size-2 rounded-full bg-claude" />
        ) : (
          <span className="rounded-full bg-claude px-1.5 py-0.5 text-[11px] font-medium leading-none text-white">
            {badge}
          </span>
        ))}
    </button>
  );
}

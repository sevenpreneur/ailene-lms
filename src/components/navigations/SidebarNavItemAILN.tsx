import type { LucideIcon } from "lucide-react";
import Link from "next/link";

// Quiet by default: the active item gets a soft fill and a brand-coloured icon, nothing else.
export default function SidebarNavItemAILN({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`flex h-9 items-center rounded-lg text-sm transition-colors lg:h-8 ${
        collapsed ? "justify-center" : "gap-2.5 px-2.5"
      } ${
        active
          ? "bg-sb-item-active-bg font-medium text-sb-text-strong"
          : "font-normal text-sb-text hover:bg-sb-item-hover hover:text-sb-text-strong"
      }`}
    >
      <Icon
        className={`size-4 shrink-0 ${active ? "text-sb-item-active-text" : ""}`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

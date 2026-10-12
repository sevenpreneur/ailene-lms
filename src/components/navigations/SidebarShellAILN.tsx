"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import { Menu, PanelLeft, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const ICON_BUTTON =
  "flex size-8 shrink-0 items-center justify-center rounded-lg text-sb-text transition-colors hover:bg-sb-item-hover hover:text-sb-text-strong";

// Small muted heading above a group of nav items; hidden on the collapsed rail.
export function SidebarGroupLabelAILN({
  children,
  collapsed,
}: {
  children: ReactNode;
  collapsed: boolean;
}) {
  if (collapsed) return null;
  return (
    <div className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-sb-text/70">
      {children}
    </div>
  );
}

// Shared frame for every sidebar: mobile top bar + drawer, and the collapsible desktop rail.
export default function SidebarShellAILN({
  mobileBrand,
  header,
  nav,
  footer,
}: {
  mobileBrand: ReactNode;
  header: (collapsed: boolean) => ReactNode;
  nav: (collapsed: boolean) => ReactNode;
  footer: (collapsed: boolean) => ReactNode;
}) {
  const { isCollapsed, toggleSidebar, isMobileOpen, openMobile, closeMobile } =
    useSidebar();
  const pathname = usePathname();

  // Navigating away should never leave the drawer covering the new page.
  useEffect(() => {
    closeMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes the drawer, matching every other overlay in the app.
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileOpen, closeMobile]);

  return (
    <>
      {/* ---------- Mobile top bar (<lg) ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-sb-border bg-sb-bg px-3 lg:hidden">
        <button
          onClick={openMobile}
          aria-label="Buka menu"
          aria-expanded={isMobileOpen}
          className={ICON_BUTTON}
        >
          <Menu className="size-[18px]" />
        </button>
        <div className="min-w-0 flex-1">{mobileBrand}</div>
      </header>

      {/* ---------- Mobile drawer (<lg) ---------- */}
      <div
        inert={!isMobileOpen}
        className={`fixed inset-0 z-[60] lg:hidden ${
          isMobileOpen ? "" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Tutup menu"
          onClick={closeMobile}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className={`absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-sb-border bg-sb-bg transition-transform duration-200 ease-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full w-full flex-col gap-3 p-3">
            <div className="flex shrink-0 items-center gap-1">
              <div className="min-w-0 flex-1">{header(false)}</div>
              <button
                onClick={closeMobile}
                aria-label="Tutup menu"
                className={ICON_BUTTON}
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
              {nav(false)}
            </nav>
            <div className="shrink-0 border-t border-sb-border pt-3">
              {footer(false)}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Desktop rail (lg+) ---------- */}
      <aside
        className={`fixed left-0 z-50 hidden h-full w-full flex-col border-r border-sb-border bg-sb-bg transition-[max-width] duration-150 lg:flex ${
          isCollapsed ? "max-w-16" : "max-w-64"
        }`}
      >
        <div
          className={`flex h-full w-full flex-col gap-3 py-3 ${
            isCollapsed ? "items-center px-2" : "px-3"
          }`}
        >
          <div
            className={`flex shrink-0 items-center gap-1 ${
              isCollapsed ? "flex-col" : ""
            }`}
          >
            <div className={isCollapsed ? "" : "min-w-0 flex-1"}>
              {header(isCollapsed)}
            </div>
            <button
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
              title={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
              className={ICON_BUTTON}
            >
              <PanelLeft className="size-4" />
            </button>
          </div>

          <nav
            className={`flex flex-1 flex-col gap-0.5 overflow-y-auto ${
              isCollapsed ? "w-full" : ""
            }`}
          >
            {nav(isCollapsed)}
          </nav>

          <div
            className={`shrink-0 border-t border-sb-border pt-3 ${
              isCollapsed ? "flex w-full justify-center" : ""
            }`}
          >
            {footer(isCollapsed)}
          </div>
        </div>
      </aside>
    </>
  );
}

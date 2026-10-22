"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";

import { useSidebar } from "@/contexts/SidebarContext";
import { Menu, PanelLeft, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { useEffect, useRef, type ReactNode } from "react";

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
  const menuTrigger = useRef<HTMLButtonElement>(null);

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
        <ButtonAILN
          variant="ghost"
          size="icon"
          ref={menuTrigger}
          onClick={openMobile}
          aria-label="Buka menu"
          aria-expanded={isMobileOpen}
        >
          <Menu className="size-[18px]" />
        </ButtonAILN>
        <div className="min-w-0 flex-1">{mobileBrand}</div>
      </header>

      <Dialog.Root
        open={isMobileOpen}
        onOpenChange={(open) => {
          if (!open) closeMobile();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 lg:hidden" />
          <Dialog.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              menuTrigger.current?.focus();
            }}
            className="fixed inset-y-0 left-0 z-[61] flex w-[17rem] max-w-[85vw] flex-col border-r border-sb-border bg-sb-bg p-3 outline-none lg:hidden"
          >
            <Dialog.Title className="sr-only">Menu navigasi</Dialog.Title>
            <Dialog.Description className="sr-only">
              Pilih halaman atau program.
            </Dialog.Description>
            <div className="flex shrink-0 items-center gap-1">
              <div className="min-w-0 flex-1">{header(false)}</div>
              <Dialog.Close asChild>
                <ButtonAILN variant="ghost" size="icon" aria-label="Tutup menu">
                  <X className="size-4" />
                </ButtonAILN>
              </Dialog.Close>
            </div>
            <nav className="my-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
              {nav(false)}
            </nav>
            <div className="shrink-0 border-t border-sb-border pt-3">
              {footer(false)}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
            <ButtonAILN
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
              title={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
            >
              <PanelLeft className="size-4" />
            </ButtonAILN>
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

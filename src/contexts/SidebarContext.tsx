"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type SidebarContextType = {
  /** Desktop (lg+) rail collapse — persisted to localStorage. */
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (value: boolean) => void;
  /** Mobile (<lg) off-canvas drawer — transient, never persisted. */
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

interface SidebarProviderCMSProps {
  children: ReactNode;
}

export function SidebarProvider(props: SidebarProviderCMSProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("sidebar");
    return saved === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar", String(isCollapsed));
  }, [isCollapsed]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!isMobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileOpen]);

  // Resizing up to desktop leaves no drawer to close.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const handle = () => {
      if (query.matches) setIsMobileOpen(false);
    };
    query.addEventListener("change", handle);
    return () => query.removeEventListener("change", handle);
  }, []);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setCollapsed: setIsCollapsed,
        isMobileOpen,
        openMobile: () => setIsMobileOpen(true),
        closeMobile: () => setIsMobileOpen(false),
        toggleMobile: () => setIsMobileOpen((prev) => !prev),
      }}
    >
      {props.children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

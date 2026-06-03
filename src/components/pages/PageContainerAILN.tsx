"use client";
import { useSidebar } from "@/contexts/SidebarContext";
import { HTMLAttributes, ReactNode } from "react";

interface PageContainerAILNProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function PageContainerAILN(props: PageContainerAILNProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`page-root font-sans hidden lg:flex w-full items-center justify-center ${props.className} ${isCollapsed ? "pl-16" : "pl-64"}`}
    >
      <div className="page-container mx-auto flex h-full w-full max-w-[1400px] gap-5 px-4 py-6 md:px-6 xl:px-8">
        {props.children}
      </div>
    </div>
  );
}

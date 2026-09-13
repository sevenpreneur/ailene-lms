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
      // Rail offset only from lg up; pt-14 clears the fixed mobile top bar.
      className={`page-root flex w-full items-center justify-center pt-14 lg:pt-0 ${props.className ?? ""} ${
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      }`}
    >
      <div className="page-container flex h-full w-full min-w-0 gap-5 px-4 py-6 md:px-6 xl:px-8">
        {props.children}
      </div>
    </div>
  );
}

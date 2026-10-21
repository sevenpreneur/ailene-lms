"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useState, type ReactNode } from "react";

export default function GuidedHintAILN({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          asChild
          onClick={(event) => {
            event.preventDefault();
            setOpen(true);
          }}
        >
          <button
            type="button"
            aria-label={label}
            aria-expanded={open}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-claude"
          >
            <Info className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={8}
          className="z-[90] max-w-64 whitespace-pre-line px-3 py-2 text-xs leading-relaxed"
        >
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

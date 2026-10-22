"use client";

import type { GuidedSession } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedUseCaseAILN from "@/components/forms/GuidedUseCaseAILN";
import { PlusCircle } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

export default function RecordUseCaseButtonAILN({
  projectId,
  useCaseId,
  useCaseName,
  championName,
  initialSession,
  children,
}: {
  projectId: string;
  useCaseId?: number;
  useCaseName?: string;
  championName?: string | null;
  initialSession?: GuidedSession;
  children?: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <ButtonAILN
        ref={triggerRef}
        variant="lime"
        size="medium"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        {children ?? (
          <>
            <PlusCircle className="size-4" />
            Catat Use Case
          </>
        )}
      </ButtonAILN>
      {isOpen && (
        <GuidedUseCaseAILN
          projectId={projectId}
          useCaseId={useCaseId}
          useCaseName={useCaseName}
          championName={championName}
          initialSession={initialSession}
          launchInModal
          onClose={() => setIsOpen(false)}
          triggerRef={triggerRef}
        />
      )}
    </>
  );
}

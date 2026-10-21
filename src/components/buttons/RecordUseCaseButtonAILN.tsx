"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedUseCaseAILN from "@/components/forms/GuidedUseCaseAILN";
import { PlusCircle } from "lucide-react";
import { useRef, useState } from "react";

export default function RecordUseCaseButtonAILN({
  projectId,
}: {
  projectId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <ButtonAILN
        ref={triggerRef}
        type="button"
        variant="lime"
        size="medium"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <PlusCircle className="size-4" />
        Catat Use Case
      </ButtonAILN>
      <GuidedUseCaseAILN
        key={projectId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
      />
    </>
  );
}

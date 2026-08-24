"use client";

import ButtonAILN, { type ButtonAILNProps } from "@/components/buttons/ButtonAILN";
import { Lock } from "lucide-react";
import { toast } from "sonner";

// Drop-in replacement for a ButtonAILN that used to trigger a tRPC mutation —
// the mutation is retired along with Prisma/tRPC, so this renders the same
// look but never actually submits. Swap back to a real ButtonAILN once the
// equivalent ailene-lms-backend endpoint exists.
export default function DisabledActionButtonAILN({
  children,
  reason = "Fitur ini sedang dalam migrasi ke backend baru.",
  className,
  ...props
}: Omit<ButtonAILNProps, "onClick" | "disabled"> & { reason?: string }) {
  return (
    <ButtonAILN
      {...props}
      disabled
      title={reason}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        toast.info(reason);
      }}
    >
      <Lock className="size-3.5" />
      {children}
    </ButtonAILN>
  );
}

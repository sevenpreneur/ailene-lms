"use client";

import ButtonAILN, {
  type ButtonAILNProps,
} from "@/components/buttons/ButtonAILN";
import { Lock } from "lucide-react";

// Drop-in replacement for a ButtonAILN that used to trigger a tRPC mutation —
// the mutation is retired along with Prisma/tRPC, so this renders the same
// look but never actually submits. Swap back to a real ButtonAILN once the
// equivalent ailene-lms-backend endpoint exists.
export default function DisabledActionButtonAILN({
  children,
  reason = "Pengiriman belum tersedia. Isian ini belum dapat disimpan.",
  ...props
}: Omit<ButtonAILNProps, "onClick" | "disabled"> & { reason?: string }) {
  return (
    <span className="inline-flex flex-col gap-1">
      <ButtonAILN {...props} disabled title={reason}>
        <Lock className="size-3.5" />
        {children}
      </ButtonAILN>
      <span className="text-xs font-normal text-muted-foreground">
        {reason}
      </span>
    </span>
  );
}

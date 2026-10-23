import type { ReactNode } from "react";
import { LogoAileneAILN } from "@/components/elements/LogoAileneAILN";

export default function AuthFormHeadingAILN({
  title,
  description,
  icon,
}: {
  title: string;
  description: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-7 text-center">
      <div aria-label="Ailene">
        <LogoAileneAILN className="h-10 w-auto" />
      </div>
      {icon && (
        <span className="flex size-14 items-center justify-center rounded-full bg-stakeholder-student-soft text-stakeholder-student-foreground">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-2.5">
        <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
        <div className="text-sm leading-6 text-muted-foreground">
          {description}
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { fieldLabelClass } from "./field-styles";

export default function FieldAILN({
  id,
  label,
  required,
  hint,
  errorMessage,
  children,
}: {
  id: string;
  label?: string;
  required?: boolean;
  hint?: ReactNode;
  errorMessage?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className={fieldLabelClass}>
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && (
        <p
          id={`${id}-hint`}
          className="text-xs leading-5 text-muted-foreground"
        >
          {hint}
        </p>
      )}
      {errorMessage && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs leading-5 text-destructive"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

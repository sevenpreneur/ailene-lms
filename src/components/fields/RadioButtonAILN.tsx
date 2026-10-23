"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface RadioButtonAILNProps<T> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> {
  radioName: string;
  label: string;
  description?: string;
  value: T;
  selectedValue: T | null;
  onChange: (value: T) => void;
}

export default function RadioButtonAILN<T extends string | number | boolean>({
  radioName,
  label,
  description,
  value,
  selectedValue,
  onChange,
  disabled,
  className,
  ...rest
}: RadioButtonAILNProps<T>) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-lg border border-dashboard-border bg-card-1 p-3 transition-colors focus-within:ring-2 focus-within:ring-claude/15",
        selectedValue === value &&
          "border-claude bg-stakeholder-student-soft dark:border-lime-bright",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-claude/50",
        className,
      )}
    >
      <input
        {...rest}
        type="radio"
        name={radioName}
        value={String(value)}
        checked={selectedValue === value}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="mt-0.5 size-4 shrink-0 accent-claude dark:accent-lime-bright"
      />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

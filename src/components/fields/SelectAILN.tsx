"use client";

import type { ReactNode } from "react";
import type { StakeholderVariant } from "@/lib/app-types";
import SelectControlAILN, { type OptionType } from "./SelectControlAILN";
export type { OptionType } from "./SelectControlAILN";

export interface SelectAILNProps {
  selectId: string;
  selectName?: string;
  selectIcon?: ReactNode;
  selectPlaceholder: string;
  value: string | number | null;
  variant?: StakeholderVariant;
  onChange?: (value: string | number | null) => void;
  disabled?: boolean;
  required?: boolean;
  options?: OptionType[];
  onOpenChange?: (open: boolean) => void;
  errorMessage?: string;
  hint?: ReactNode;
  name?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export default function SelectAILN({
  selectPlaceholder,
  value,
  variant: _variant,
  onChange,
  options = [],
  onOpenChange,
  ...rest
}: SelectAILNProps) {
  void _variant;
  return (
    <SelectControlAILN
      {...rest}
      placeholder={selectPlaceholder}
      value={options.find((option) => option.value === value) ?? null}
      options={options}
      isSearchable={false}
      onChange={(option) => onChange?.(option?.value ?? null)}
      onMenuOpen={() => onOpenChange?.(true)}
      onMenuClose={() => onOpenChange?.(false)}
    />
  );
}

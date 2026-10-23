"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import type { StakeholderVariant } from "@/lib/app-types";
import FieldAILN from "./FieldAILN";
import {
  fieldControlClass,
  fieldDescriptionId,
  fieldIconClass,
} from "./field-styles";

export interface InputAILNProps extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  inputName?: string;
  inputType?: string;
  inputIcon?: ReactNode;
  inputPlaceholder?: string;
  characterLength?: number;
  errorMessage?: string;
  hint?: ReactNode;
  trailing?: ReactNode;
  variant?: StakeholderVariant;
  onInputChange?: (value: string) => void;
}

export default function InputAILN({
  inputId,
  inputName,
  inputType,
  inputIcon,
  inputPlaceholder,
  characterLength,
  errorMessage,
  hint,
  trailing,
  variant: _variant,
  onInputChange,
  required,
  className,
  onChange,
  maxLength,
  type,
  placeholder,
  ...rest
}: InputAILNProps) {
  void _variant; // Kept for existing callers; all roles share the same field styling.
  return (
    <FieldAILN
      id={inputId}
      label={inputName}
      required={required}
      hint={hint}
      errorMessage={errorMessage}
    >
      <div className="relative">
        {inputIcon && <span className={fieldIconClass}>{inputIcon}</span>}
        <input
          {...rest}
          id={inputId}
          type={inputType ?? type ?? "text"}
          placeholder={inputPlaceholder ?? placeholder}
          required={required}
          maxLength={characterLength ?? maxLength}
          aria-invalid={errorMessage ? true : rest["aria-invalid"]}
          aria-describedby={fieldDescriptionId(
            inputId,
            errorMessage,
            hint,
            rest["aria-describedby"],
          )}
          className={fieldControlClass(
            Boolean(errorMessage),
            [inputIcon ? "pl-10" : "", trailing ? "pr-12" : "", className]
              .filter(Boolean)
              .join(" "),
          )}
          onChange={(event) => {
            onChange?.(event);
            onInputChange?.(event.target.value);
          }}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </div>
        )}
      </div>
    </FieldAILN>
  );
}

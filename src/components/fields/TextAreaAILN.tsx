"use client";

import type { ReactNode, TextareaHTMLAttributes } from "react";
import type { StakeholderVariant } from "@/lib/app-types";
import FieldAILN from "./FieldAILN";
import { fieldControlClass, fieldDescriptionId } from "./field-styles";

export interface TextAreaAILNProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  textAreaId: string;
  textAreaName?: string;
  textAreaHeight?: string;
  textAreaPlaceholder?: string;
  characterLength?: number;
  errorMessage?: string;
  hint?: ReactNode;
  variant?: StakeholderVariant;
  onTextAreaChange?: (value: string) => void;
}

export default function TextAreaAILN({
  textAreaId,
  textAreaName,
  textAreaHeight,
  textAreaPlaceholder,
  characterLength,
  errorMessage,
  hint,
  variant: _variant,
  onTextAreaChange,
  required,
  className,
  onChange,
  maxLength,
  placeholder,
  rows = 4,
  ...rest
}: TextAreaAILNProps) {
  void _variant;
  return (
    <FieldAILN
      id={textAreaId}
      label={textAreaName}
      required={required}
      hint={hint}
      errorMessage={errorMessage}
    >
      <textarea
        {...rest}
        id={textAreaId}
        placeholder={textAreaPlaceholder ?? placeholder}
        required={required}
        rows={rows}
        maxLength={characterLength ?? maxLength}
        aria-invalid={errorMessage ? true : rest["aria-invalid"]}
        aria-describedby={fieldDescriptionId(
          textAreaId,
          errorMessage,
          hint,
          rest["aria-describedby"],
        )}
        className={fieldControlClass(
          Boolean(errorMessage),
          ["resize-y", textAreaHeight, className].filter(Boolean).join(" "),
        )}
        onChange={(event) => {
          onChange?.(event);
          onTextAreaChange?.(event.target.value);
        }}
      />
    </FieldAILN>
  );
}

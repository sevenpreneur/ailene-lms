"use client";
import { StakeholderVariant } from "@/lib/app-types";
import React, { TextareaHTMLAttributes, useState } from "react";

const variantStyles: Record<
  StakeholderVariant,
  { focus: string; border: string; background: string; disabled: string }
> = {
  STUDENT: {
    focus:
      "focus:outline-black/10 focus:border-black dark:focus:outline-white/15 dark:focus:border-white",
    border: "border border-dashboard-border",
    background: "bg-card-2",
    disabled: "bg-card-2 text-muted-foreground dark:text-foreground/30",
  },
  CHAMPION: {
    focus:
      "focus:outline-emerald-500/15 focus:border-emerald-600 dark:focus:outline-emerald-400/15 dark:focus:border-emerald-400",
    border: "border border-dashboard-border",
    background: "bg-card-2",
    disabled: "bg-card-2 text-muted-foreground dark:text-foreground/30",
  },
  SPONSOR: {
    focus:
      "focus:outline-blue-500/15 focus:border-blue-600 dark:focus:outline-blue-400/15 dark:focus:border-blue-400",
    border: "border border-dashboard-border",
    background: "bg-card-2",
    disabled: "bg-card-2 text-muted-foreground dark:text-foreground/30",
  },
};

interface TextAreaAILNProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  textAreaId: string;
  textAreaName?: string;
  textAreaHeight?: string;
  textAreaPlaceholder?: string;
  characterLength?: number;
  errorMessage?: string;
  value: string;
  variant: StakeholderVariant;
  onTextAreaChange?: (value: string) => void;
}

export default function TextAreaAILN({
  textAreaId,
  textAreaName,
  textAreaHeight,
  textAreaPlaceholder,
  characterLength,
  errorMessage,
  value,
  variant,
  onTextAreaChange,
  required,
  disabled,
  ...rest
}: TextAreaAILNProps) {
  const [textValue, setTextValue] = useState(value);
  const [internalError, setInternalError] = useState("");
  const styles = variantStyles[variant];

  // Sync only when parent value changes AND it's different
  if (textValue !== value) {
    setTextValue(value ?? "");
  }

  const maxLength = characterLength ?? 520;
  const characterLimitErrorMessage =
    "Oops, you've reached the character limit.";

  // Character Limitation on Text Area
  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    if (newValue.length > maxLength) {
      setInternalError(characterLimitErrorMessage);
      return;
    } else {
      setInternalError("");
    }
    setTextValue(newValue.slice(0, maxLength));
    if (onTextAreaChange) onTextAreaChange(newValue.slice(0, maxLength));
  };

  // Reset internalError if get any errorMessage from parent
  if (errorMessage && internalError !== "") {
    setInternalError("");
  }

  // Compute error (parent > internal)
  const computedError = errorMessage || internalError;

  return (
    <div className="text-area-box flex flex-col gap-1">
      {textAreaName && (
        <label
          htmlFor={textAreaId}
          className={`label-text-area flex pl-1 gap-0.5 text-sm text-sb-text-strong font-semibold`}
        >
          {textAreaName}
          {required && (
            <span className="label-required text-destructive">*</span>
          )}
        </label>
      )}

      <div className="text-area-container relative">
        <textarea
          id={textAreaId}
          placeholder={textAreaPlaceholder}
          {...rest}
          className={`text-area-placeholder flex w-full p-2 ${textAreaHeight} text-sm rounded-md resize-none transform transition-all placeholder:text-emphasis/60 placeholder:text-sm focus:outline-4 invalid:border-destructive required:border-destructive ${styles.border} ${
            computedError
              ? "border-destructive focus:outline-semi-destructive"
              : styles.focus
          } ${
            disabled
              ? `${styles.disabled} cursor-not-allowed`
              : styles.background
          }`}
          value={textValue}
          onChange={handleTextAreaChange}
          disabled={disabled}
        />
        {computedError && (
          <p className="text-area-error-message inline-flex text-red-600 text-xs">
            {computedError}
          </p>
        )}
      </div>
    </div>
  );
}

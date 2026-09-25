"use client";
import { NumberConfig, StakeholderVariant } from "@/lib/app-types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, {
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const variantStyles: Record<
  StakeholderVariant,
  {
    focus: string;
    focusWithin: string;
    border: string;
    background: string;
    disabled: string;
  }
> = {
  STUDENT: {
    focus:
      "focus:outline-claude/15 focus:border-claude dark:focus:outline-claude/25 dark:focus:border-lime-bright",
    focusWithin:
      "focus-within:outline-claude/15 focus-within:border-claude dark:focus-within:outline-claude/25 dark:focus-within:border-lime-bright",
    border: "border border-dashboard-border",
    background: "bg-card-2",
    disabled: "bg-card-2 text-muted-foreground dark:text-foreground/30",
  },
  CHAMPION: {
    focus:
      "focus:outline-claude/15 focus:border-claude dark:focus:outline-claude/25 dark:focus:border-lime-bright",
    focusWithin:
      "focus-within:outline-claude/15 focus-within:border-claude dark:focus-within:outline-claude/25 dark:focus-within:border-lime-bright",
    border: "border border-dashboard-border",
    background: "bg-card-2",
    disabled: "bg-card-2 text-muted-foreground dark:text-foreground/30",
  },
  SPONSOR: {
    focus:
      "focus:outline-claude/15 focus:border-claude dark:focus:outline-claude/25 dark:focus:border-lime-bright",
    focusWithin:
      "focus-within:outline-claude/15 focus-within:border-claude dark:focus-within:outline-claude/25 dark:focus-within:border-lime-bright",
    border: "border border-dashboard-border",
    background: "bg-card-2",
    disabled: "bg-card-2 text-muted-foreground dark:text-foreground/30",
  },
};

const countryCodes = [
  {
    id: 1,
    country_name: "Indonesia",
    phone_code: "62",
    emoji: "ID",
    icon: "",
  },
];

export const NumberVariant: Record<
  NumberConfig,
  {
    sanitize: (raw: string) => string;
    pattern: string;
    mode: "numeric" | "decimal";
  }
> = {
  numeric: {
    mode: "numeric",
    pattern: "[0-9]*",
    sanitize: (raw) => raw.replace(/\D/g, "").replace(/^0+/, ""),
  },
  decimal: {
    mode: "decimal",
    pattern: "^[0-9]*[.,]?[0-9]*$",
    sanitize: (raw) =>
      raw
        .replace(/[^0-9.,]/g, "")
        .replace(/,/g, ".")
        .replace(/(\..*)\./g, "$1"),
  },
  phone_number: {
    mode: "numeric",
    pattern: "[0-9]*",
    sanitize: (raw) => raw.replace(/\D/g, "").replace(/^0+/, ""),
  },
};

interface NumberInputAILNProps extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  inputName?: string;
  inputIcon?: string;
  inputConfig: NumberConfig;
  inputPlaceholder?: string;
  characterLength?: number;
  errorMessage?: string;
  value: string;
  variant: StakeholderVariant;
  defaultCountryId?: number | null;
  onInputChange?: (value: string) => void;
  onCountryChange?: (id: number, code: string) => void;
}

export default function NumberInputAILN({
  inputId,
  inputName,
  inputIcon,
  inputConfig,
  inputPlaceholder,
  characterLength,
  errorMessage,
  onInputChange,
  onCountryChange,
  value,
  variant,
  defaultCountryId,
  disabled,
  required,
  ...rest
}: NumberInputAILNProps) {
  const [textValue, setTextValue] = useState(value);
  const [internalError, setInternalError] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    defaultCountryId ?? null
  );
  const countryRef = useRef<HTMLDivElement>(null);
  const styles = variantStyles[variant];
  const isPhone = inputConfig === "phone_number";

  // Derive selected country: default to Indonesia, fall back to first in list.
  const selectedCountry = useMemo(() => {
    const list = countryCodes;
    if (selectedCountryId !== null) {
      return list.find((c) => c.id === selectedCountryId) ?? null;
    }
    return list.find((c) => c.phone_code === "62") ?? list[0] ?? null;
  }, [selectedCountryId]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        countryRef.current &&
        !countryRef.current.contains(e.target as Node)
      ) {
        setCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync only when parent value changes AND it's different
  if (textValue !== value) {
    setTextValue(value ?? "");
  }

  const maxLength = characterLength ?? 60;
  const characterLimitErrorMessage =
    "Oops, you've reached the character limit.";
  const { mode, pattern, sanitize } = NumberVariant[inputConfig];

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const sanitizedValue = sanitize(rawValue).slice(0, maxLength);
    if (rawValue.length > maxLength) {
      setInternalError(characterLimitErrorMessage);
    } else {
      setInternalError("");
    }
    setTextValue(sanitizedValue);
    if (onInputChange) onInputChange(sanitizedValue);
  };

  if (errorMessage && internalError !== "") {
    setInternalError("");
  }

  const computedError = errorMessage || internalError;

  return (
    <div className="input-box flex flex-col gap-1">
      {inputName && (
        <label
          htmlFor={inputId}
          className={`label-input flex pl-1 gap-0.5 text-sm text-foreground font-semibold`}
        >
          {inputName}
          {required && (
            <span className="label-required text-destructive">*</span>
          )}
        </label>
      )}

      <div
        className={`input-container relative flex ${
          isPhone
            ? `rounded-md ${styles.border} focus-within:outline-4 ${
                computedError
                  ? "border-destructive focus-within:outline-semi-destructive"
                  : styles.focusWithin
              } ${disabled ? styles.disabled : styles.background}`
            : ""
        }`}
      >
        {/* Country code selector — phone_number mode only */}
        {isPhone && (
          <div ref={countryRef} className="relative shrink-0">
            <button
              type="button"
              disabled={disabled as boolean}
              onClick={() => setCountryOpen((p) => !p)}
              className={`flex items-center gap-1.5 h-full px-3 border-r border-dashboard-border text-sm font-medium rounded-l-md transition hover:bg-card-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {selectedCountry?.icon ? (
                <Image
                  src={selectedCountry.icon}
                  alt={selectedCountry.country_name}
                  width={20}
                  height={14}
                  className="object-cover"
                />
              ) : (
                <span className="text-base leading-none">
                  {selectedCountry?.emoji ?? "🌐"}
                </span>
              )}
              <span className="text-xs text-emphasis">
                +{selectedCountry?.phone_code}
              </span>
              <ChevronDown className="size-3 text-emphasis shrink-0" />
            </button>

            {countryOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 w-60 max-h-56 overflow-y-auto rounded-md border border-dashboard-border bg-card-1 shadow-lg">
                {countryCodes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCountryId(c.id);
                      onCountryChange?.(c.id, c.phone_code);
                      setCountryOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition hover:bg-card-2 ${
                      selectedCountry?.id === c.id
                        ? "bg-primary/5 text-primary"
                        : ""
                    }`}
                  >
                    {c.icon ? (
                      <Image
                        src={c.icon}
                        alt={c.country_name}
                        width={20}
                        height={14}
                        className="object-cover shrink-0"
                      />
                    ) : (
                      <span className="text-base shrink-0">{c.emoji}</span>
                    )}
                    <span className="text-emphasis shrink-0">
                      +{c.phone_code}
                    </span>
                    <span className="truncate font-[450]">
                      {c.country_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Plain icon — non-phone mode */}
        {!isPhone && inputIcon && (
          <div className="input-icon absolute left-0 flex items-center p-[9px] pl-3 gap-1 pointer-events-none text-emphasis">
            <p className="input-emoji text-sm">{inputIcon}</p>
          </div>
        )}

        <input
          id={inputId}
          type="text"
          inputMode={mode}
          pattern={pattern}
          placeholder={inputPlaceholder}
          className={`input-placeholder flex w-full p-2 font-medium text-sm transform transition-all placeholder:text-emphasis/60 placeholder:font-medium placeholder:text-sm ${
            isPhone
              ? "flex-1 rounded-r-md border-0 focus:outline-none bg-transparent"
              : `rounded-md focus:outline-4 invalid:border-destructive required:border-destructive ${styles.border} ${
                  computedError
                    ? "border-destructive focus:outline-semi-destructive"
                    : styles.focus
                } ${
                  disabled
                    ? `${styles.disabled} cursor-not-allowed`
                    : styles.background
                } ${inputIcon ? "pl-16" : ""}`
          }`}
          value={textValue}
          onChange={handleInputChange}
          {...rest}
          suppressHydrationWarning
        />

        {computedError && (
          <p
            className={`input-error-message absolute -bottom-5 left-0 inline-flex text-red-600 text-xs `}
          >
            {computedError}
          </p>
        )}
      </div>
    </div>
  );
}

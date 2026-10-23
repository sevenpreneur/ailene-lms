"use client";

import type { NumberConfig } from "@/lib/app-types";
import InputAILN, { type InputAILNProps } from "./InputAILN";
import { Popover } from "radix-ui";
import { ChevronDown } from "lucide-react";

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
    pattern: "[0-9]*[.]?[0-9]*",
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

export interface NumberInputAILNProps extends Omit<
  InputAILNProps,
  "type" | "inputType"
> {
  inputConfig: NumberConfig;
  defaultCountryId?: number | null;
  onCountryChange?: (id: number, code: string) => void;
}

export default function NumberInputAILN({
  inputConfig,
  inputIcon,
  characterLength = 60,
  defaultCountryId: _country,
  onCountryChange: _onCountryChange,
  onChange,
  onInputChange,
  ...rest
}: NumberInputAILNProps) {
  void _country; // Indonesia is currently the only supported country.
  const { mode, pattern, sanitize } = NumberVariant[inputConfig];
  return (
    <InputAILN
      {...rest}
      inputType={inputConfig === "phone_number" ? "tel" : "text"}
      inputMode={mode}
      pattern={pattern}
      className={
        inputConfig === "phone_number"
          ? `pl-20 ${rest.className ?? ""}`
          : rest.className
      }
      inputIcon={
        inputConfig === "phone_number" ? (
          <Popover.Root>
            <Popover.Trigger
              type="button"
              disabled={rest.disabled}
              aria-label="Kode negara: Indonesia +62"
              className="pointer-events-auto flex h-9 items-center gap-1 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-claude disabled:cursor-not-allowed"
            >
              +62
              <ChevronDown className="size-3" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                align="start"
                className="z-[110] rounded-lg border border-dashboard-border bg-card-1 p-1 shadow-lg"
              >
                <Popover.Close asChild>
                  <button
                    type="button"
                    onClick={() => _onCountryChange?.(1, "62")}
                    className="cursor-pointer rounded-lg bg-stakeholder-student-soft px-3 py-2 text-sm text-stakeholder-student-foreground"
                  >
                    Indonesia (+62)
                  </button>
                </Popover.Close>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        ) : (
          inputIcon
        )
      }
      characterLength={characterLength}
      onChange={(event) => {
        event.target.value = sanitize(event.target.value).slice(
          0,
          characterLength,
        );
        onChange?.(event);
        onInputChange?.(event.target.value);
      }}
    />
  );
}

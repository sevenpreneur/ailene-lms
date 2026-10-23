"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import ReactSelect, { type Props } from "react-select";
import CreatableSelect from "react-select/creatable";
import FieldAILN from "./FieldAILN";
import {
  fieldControlClass,
  fieldDescriptionId,
  fieldIconClass,
} from "./field-styles";

export interface OptionType {
  label: string;
  value: string | number | null;
  image?: string | null;
  isDisabled?: boolean;
}

export interface SelectControlAILNProps extends Props<OptionType, false> {
  selectId: string;
  selectName?: string;
  selectIcon?: ReactNode;
  errorMessage?: string;
  hint?: ReactNode;
  disabled?: boolean;
  portalMenu?: boolean;
  onCreateOption?: (value: string) => void;
  createLabel?: (value: string) => string;
  "aria-describedby"?: string;
}

export default function SelectControlAILN({
  selectId,
  selectName,
  selectIcon,
  errorMessage,
  hint,
  disabled,
  required,
  portalMenu = false,
  onCreateOption,
  createLabel,
  className,
  ...rest
}: SelectControlAILNProps) {
  const Control = onCreateOption
    ? CreatableSelect<OptionType, false>
    : ReactSelect<OptionType, false>;
  return (
    <FieldAILN
      id={selectId}
      label={selectName}
      required={required}
      hint={hint}
      errorMessage={errorMessage}
    >
      <div className="relative">
        {selectIcon && (
          <span className={`${fieldIconClass} z-10`}>{selectIcon}</span>
        )}
        <Control
          {...rest}
          inputId={selectId}
          instanceId={selectId}
          required={required}
          isDisabled={disabled}
          aria-invalid={errorMessage ? true : rest["aria-invalid"]}
          aria-errormessage={
            errorMessage ? `${selectId}-error` : rest["aria-errormessage"]
          }
          aria-describedby={fieldDescriptionId(
            selectId,
            errorMessage,
            hint,
            rest["aria-describedby"],
          )}
          onCreateOption={onCreateOption}
          formatCreateLabel={createLabel ?? ((value) => `Tambah "${value}"`)}
          className={className}
          unstyled
          menuPlacement="auto"
          menuPortalTarget={
            portalMenu && typeof document !== "undefined"
              ? document.body
              : undefined
          }
          styles={{
            control: (base) => ({ ...base, minHeight: 44 }),
            menuPortal: (base) => ({ ...base, zIndex: 110 }),
          }}
          noOptionsMessage={() => "Tidak ada pilihan."}
          loadingMessage={() => "Memuat..."}
          formatOptionLabel={(option) => (
            <span className="flex min-w-0 items-center gap-2">
              {option.image && (
                <Image
                  src={option.image}
                  width={20}
                  height={20}
                  alt=""
                  className="size-5 rounded-full object-cover"
                />
              )}
              <span className="truncate">{option.label}</span>
            </span>
          )}
          classNames={{
            control: ({ isFocused, isDisabled }) =>
              fieldControlClass(
                Boolean(errorMessage),
                [
                  "cursor-pointer py-0",
                  selectIcon ? "pl-10" : "",
                  isFocused
                    ? errorMessage
                      ? "border-destructive ring-2 ring-destructive/15"
                      : "border-claude ring-2 ring-claude/15 dark:border-lime-bright dark:ring-lime-bright/15"
                    : "",
                  isDisabled
                    ? "cursor-not-allowed bg-card-2 text-muted-foreground opacity-60"
                    : "",
                ].join(" "),
              ),
            valueContainer: () => "gap-1 py-2.5",
            placeholder: () => "truncate text-muted-foreground",
            singleValue: () => "truncate",
            input: () => "text-foreground",
            indicatorsContainer: () => "gap-1 text-muted-foreground",
            indicatorSeparator: () => "hidden",
            dropdownIndicator: () => "cursor-pointer p-1",
            clearIndicator: () => "cursor-pointer p-1 hover:text-destructive",
            menu: () =>
              "z-50 my-1 overflow-hidden rounded-lg border border-dashboard-border bg-card-1 shadow-lg",
            menuPortal: () => "font-sans text-base sm:text-sm",
            menuList: () => "p-1",
            option: ({ isFocused, isSelected, isDisabled }) =>
              [
                "rounded-lg px-3 py-2.5 text-base sm:text-sm",
                isDisabled
                  ? "cursor-not-allowed text-muted-foreground opacity-60"
                  : "cursor-pointer",
                isFocused || isSelected
                  ? "bg-stakeholder-student-soft text-stakeholder-student-foreground"
                  : "text-foreground",
              ].join(" "),
            noOptionsMessage: () => "p-3 text-sm text-muted-foreground",
            loadingMessage: () => "p-3 text-sm text-muted-foreground",
          }}
        />
      </div>
    </FieldAILN>
  );
}

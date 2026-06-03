"use client";
import React, { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

export type VariantType =
  | "primary"
  | "secondary"
  | "tertiary"
  | "destructive"
  | "light"
  | "outline";

export type SizeType =
  | "default"
  | "medium"
  | "large"
  | "small"
  | "icon"
  | "largeRounded"
  | "defaultRounded"
  | "mediumRounded"
  | "smallRounded"
  | "iconRounded"
  | "smallIconRounded"
  | "mediumIcon"
  | "largeIconRounded";

interface ButtonAILNProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: VariantType;
  size?: SizeType;
}

// Use forwardRef for pass ref component. forwardRef cant directly use with 'export default function'
const ButtonAILN = forwardRef<HTMLButtonElement, ButtonAILNProps>(
  (
    {
      children,
      variant = "primary",
      size = "default",
      disabled = false,
      className,
      ...rest // -- ... rest for calls the remaining props that haven't been explicitly fetched from props.
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const baseClasses =
      "app-button font-geist-sans relative inline-flex gap-2 font-semibold items-center justify-center truncate transition transform hover:cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed";

    const variantClasses: Record<VariantType, string> = {
      primary:
        "bg-black text-white hover:bg-[#140303] active:bg-[#140303] disabled:bg-gray-300 disabled:text-gray-500 dark:border dark:border-dashboard-border dark:bg-dashboard-bg dark:text-white dark:hover:bg-card-bg dark:active:bg-card-bg dark:disabled:bg-card-bg/40 dark:disabled:text-red-100/40",
      secondary:
        "bg-[#107158] text-white hover:bg-[#0d5d48] active:bg-[#0a4a39] disabled:bg-emerald-200 disabled:text-emerald-50",
      tertiary:
        "bg-[#00359D] text-white hover:bg-[#002a7d] active:bg-[#001f5d] disabled:bg-blue-200 disabled:text-blue-50",
      destructive:
        "bg-destructive-background text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-active disabled:bg-destructive-muted dark:disabled:text-destructive-foreground/50",
      light:
        "bg-light-background text-light-foreground border hover:bg-light-hover active:bg-light-active disabled:bg-light-muted disabled:text-light-foreground/30",
      outline:
        "bg-light-background text-light-foreground border border-dashboard-border hover:bg-light-hover active:bg-light-active disabled:bg-light-muted disabled:text-light-foreground/30 dark:bg-dashboard-bg dark:text-white dark:hover:bg-card-bg dark:active:bg-card-bg dark:disabled:bg-card-bg/40 dark:disabled:text-red-100/40",
    };

    const sizeClasses: Record<SizeType, string> = {
      large: "py-3 px-7 h-[52px] text-lg rounded-xl",
      default: "py-2 px-4 h-10 text-sm rounded-lg",
      medium: "py-1.5 px-3 h-9 text-sm rounded-md",
      small: "py-1 px-2 h-8 text-xs rounded-md",
      icon: "size-9 rounded-md",
      mediumIcon: "size-7 rounded-md",
      largeRounded: "py-3 px-7 h-[52px] text-lg rounded-full",
      defaultRounded: "py-2 px-4 h-10 text-sm rounded-full",
      mediumRounded: "py-1.5 px-3 h-9 text-sm rounded-full",
      smallRounded: "py-1 px-2 h-8 text-xs rounded-full",
      iconRounded: "size-8 rounded-full",
      smallIconRounded: "size-6 rounded-full",
      largeIconRounded: "size-10 rounded-full",
    };

    const finalClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(" ");

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={finalClasses}
        {...rest}
        suppressHydrationWarning
      >
        {children}
      </button>
    );
  }
);
ButtonAILN.displayName = "ButtonAILN";
export default ButtonAILN;

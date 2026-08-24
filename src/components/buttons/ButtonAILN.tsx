"use client";
import React, { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

export type VariantType =
  | "primary"
  | "destructive"
  | "student"
  | "champion"
  | "sponsor"
  | "neutral"
  | "light";

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

export interface ButtonAILNProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
      "app-button  relative inline-flex gap-2 font-semibold items-center justify-center truncate transition transform hover:cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed";

    const primaryClasses =
      "bg-black text-white hover:bg-[#140303] active:bg-[#140303] disabled:bg-gray-300 disabled:text-gray-500 dark:border dark:border-dashboard-border dark:bg-dashboard-bg dark:text-white dark:hover:bg-card-1 dark:active:bg-card-1 dark:disabled:bg-card-1/40 dark:disabled:text-red-100/40";
    const studentClasses =
      "bg-stakeholder-student text-white hover:bg-[color-mix(in_oklch,var(--stakeholder-student)_88%,black)] active:bg-[color-mix(in_oklch,var(--stakeholder-student)_78%,black)] disabled:bg-stakeholder-student-soft disabled:text-stakeholder-student-foreground/50";
    const championClasses =
      "bg-stakeholder-champion text-white hover:bg-[color-mix(in_oklch,var(--stakeholder-champion)_88%,black)] active:bg-[color-mix(in_oklch,var(--stakeholder-champion)_78%,black)] disabled:bg-stakeholder-champion-soft disabled:text-stakeholder-champion-foreground/50";
    const sponsorClasses =
      "bg-stakeholder-sponsor text-white hover:bg-[color-mix(in_oklch,var(--stakeholder-sponsor)_88%,black)] active:bg-[color-mix(in_oklch,var(--stakeholder-sponsor)_78%,black)] disabled:bg-stakeholder-sponsor-soft disabled:text-stakeholder-sponsor-foreground/50";
    const destructiveClasses =
      "bg-destructive-background text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-active disabled:bg-destructive-muted dark:disabled:text-destructive-foreground/50";
    const lightClasses =
      "bg-light-background text-light-foreground border hover:bg-light-hover active:bg-light-active disabled:bg-light-muted disabled:text-light-foreground/30";
    const neutralClasses =
      "bg-light-background text-light-foreground border border-dashboard-border hover:bg-light-hover active:bg-light-active disabled:bg-light-muted disabled:text-light-foreground/30 dark:bg-dashboard-bg dark:text-white dark:hover:bg-card-1 dark:active:bg-card-1 dark:disabled:bg-card-1/40 dark:disabled:text-red-100/40";

    const variantClasses: Record<VariantType, string> = {
      primary: primaryClasses,
      destructive: destructiveClasses,
      student: studentClasses,
      champion: championClasses,
      sponsor: sponsorClasses,
      neutral: neutralClasses,
      light: lightClasses,
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

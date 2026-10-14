"use client";
import React, { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type VariantType =
  | "primary"
  | "destructive"
  | "student"
  | "champion"
  | "sponsor"
  | "neutral"
  | "light"
  | "forest"
  | "lime"
  | "ghost"
  | "ghostAccent"
  | "outline"
  | "outlineActive"
  | "chip"
  | "chipActive"
  | "menu"
  | "menuActive"
  | "card"
  | "cardActive"
  | "answer"
  | "answerActive"
  | "rating"
  | "ratingActive"
  | "question"
  | "questionAnswered"
  | "questionCurrent"
  | "text"
  | "textAccent"
  | "switch"
  | "backdrop"
  | "backdropAbsolute"
  | "backdropClear"
  | "accordion"
  | "bare";

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
  | "largeIconRounded"
  | "chip"
  | "choice"
  | "card"
  | "row"
  | "rating"
  | "question"
  | "switch"
  | "bare";

export interface ButtonAILNProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  children?: React.ReactNode;
  variant?: VariantType;
  size?: SizeType;
  width?: "auto" | "full" | "fit" | "responsive";
  alignSelf?: "end";
  shrink?: boolean;
  asChild?: boolean;
}

// Use forwardRef for pass ref component. forwardRef cant directly use with 'export default function'
const ButtonAILN = forwardRef<HTMLButtonElement, ButtonAILNProps>(
  (
    {
      children,
      variant = "primary",
      size = "default",
      width = "auto",
      alignSelf,
      shrink = true,
      asChild = false,
      type = "button",
      disabled = false,
      ...rest // -- ... rest for calls the remaining props that haven't been explicitly fetched from props.
    },
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const baseClasses =
      "app-button relative inline-flex items-center justify-center gap-2 font-medium transition hover:cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed";

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
    const forestClasses =
      "bg-forest-deep text-white hover:bg-forest-deep/90 active:bg-forest-deep/80 disabled:bg-forest-deep/40 disabled:text-white/40";
    const limeClasses =
      "bg-lime-bright text-forest-deep hover:bg-lime-bright/90 active:bg-lime-bright/80 disabled:bg-lime-bright/40 disabled:text-forest-deep/40";

    const variantClasses: Record<VariantType, string> = {
      primary: primaryClasses,
      destructive: destructiveClasses,
      student: studentClasses,
      champion: championClasses,
      sponsor: sponsorClasses,
      neutral: neutralClasses,
      light: lightClasses,
      forest: forestClasses,
      lime: limeClasses,
      ghost:
        "bg-transparent text-muted-foreground hover:bg-dashboard-bg hover:text-foreground disabled:opacity-50",
      ghostAccent:
        "bg-transparent text-claude hover:bg-hijau-t dark:text-lime-bright dark:hover:bg-claude/15 disabled:opacity-50",
      outline:
        "border border-dashboard-border bg-card-1 text-foreground hover:border-claude/40 hover:bg-card-2 disabled:opacity-50",
      outlineActive:
        "border border-claude bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright disabled:opacity-50",
      chip: "border border-dashboard-border bg-card-1 text-foreground hover:border-claude/50 hover:bg-hijau-t dark:hover:bg-claude/15 disabled:opacity-50",
      chipActive:
        "border border-forest-deep bg-forest-deep text-white dark:border-lime-bright dark:bg-lime-bright dark:text-forest-deep disabled:opacity-50",
      menu: "bg-transparent text-foreground hover:bg-card-2 disabled:opacity-50",
      menuActive:
        "bg-hijau-t text-claude hover:bg-hijau-t dark:bg-claude/15 dark:text-lime-bright",
      card: "border border-dashboard-border bg-card-1 text-foreground hover:border-claude/60 hover:bg-claude/[0.04]",
      cardActive:
        "border border-claude bg-card-1 text-foreground ring-1 ring-claude hover:bg-claude/[0.04]",
      answer:
        "border border-dashboard-border bg-card-1 text-foreground hover:border-claude/40 hover:bg-card-2 disabled:opacity-60",
      answerActive:
        "border border-claude bg-hijau-t text-foreground dark:bg-claude/10 dark:text-white disabled:opacity-60",
      rating:
        "border border-dashboard-border bg-card-2 text-gray-700 hover:border-claude/40 dark:text-gray-300 disabled:opacity-60",
      ratingActive:
        "border border-claude bg-claude text-white disabled:opacity-60",
      question:
        "border border-dashboard-border bg-card-2 text-gray-500 dark:text-gray-400 hover:opacity-80",
      questionAnswered:
        "bg-black text-white dark:border dark:border-claude/40 dark:bg-claude/20 dark:text-lime-bright hover:opacity-80",
      questionCurrent: "bg-claude text-white hover:opacity-80",
      text: "bg-transparent text-muted-foreground hover:text-foreground hover:underline disabled:opacity-50",
      textAccent:
        "bg-transparent text-claude hover:underline dark:text-lime-bright disabled:opacity-50",
      switch: "bg-gray-200 dark:bg-white/10",
      backdrop: "bg-black/50",
      backdropAbsolute: "absolute inset-0 bg-black/50",
      backdropClear: "fixed inset-0 z-10 cursor-default bg-transparent",
      accordion: "bg-transparent text-foreground hover:bg-card-2/70",
      bare: "bg-transparent",
    };

    const sizeClasses: Record<SizeType, string> = {
      large: "py-3 px-7 h-[52px] text-lg rounded-lg",
      default: "py-2 px-4 h-10 text-sm rounded-lg",
      medium: "py-1.5 px-3 h-9 text-sm rounded-lg",
      small: "py-1 px-2 h-8 text-xs rounded-lg",
      icon: "size-9 rounded-lg",
      mediumIcon: "size-7 rounded-lg",
      largeRounded: "py-3 px-7 h-[52px] text-lg rounded-full",
      defaultRounded: "py-2 px-4 h-10 text-sm rounded-full",
      mediumRounded: "py-1.5 px-3 h-9 text-sm rounded-full",
      smallRounded: "py-1 px-2 h-8 text-xs rounded-full",
      iconRounded: "size-8 rounded-full",
      smallIconRounded: "size-6 rounded-full",
      largeIconRounded: "size-10 rounded-full",
      chip: "min-h-8 px-3 py-1 text-xs rounded-full",
      choice: "min-h-11 px-4 py-3 text-sm rounded-lg",
      card: "flex-col items-start gap-3 p-4 text-sm text-left rounded-lg",
      row: "justify-start px-5 py-4 text-left text-sm rounded-lg",
      rating: "h-11 min-w-10 text-sm rounded-lg",
      question: "aspect-square w-full text-xs rounded-lg",
      switch: "relative h-7 w-12 rounded-full",
      bare: "",
    };

    const finalClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      width === "full" && "w-full",
      width === "fit" && "w-fit",
      width === "responsive" && "w-full sm:w-auto",
      alignSelf === "end" && "self-end",
      !shrink && "shrink-0",
    );

    if (asChild) {
      return (
        <Slot ref={ref} className={finalClasses} {...rest}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={finalClasses}
        {...rest}
        suppressHydrationWarning
      >
        {children}
      </button>
    );
  },
);
ButtonAILN.displayName = "ButtonAILN";
export default ButtonAILN;

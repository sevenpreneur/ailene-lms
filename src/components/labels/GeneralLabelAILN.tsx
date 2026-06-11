"use client";
import React from "react";

export type GeneralLabelVariantAILN =
  | "yellow"
  | "green"
  | "red"
  | "blue"
  | "white";

interface GeneralLabelAILNProps {
  children: React.ReactNode;
  variant?: GeneralLabelVariantAILN;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<GeneralLabelVariantAILN, string> = {
  yellow:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  red:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  blue:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  white:
    "border-dashboard-border bg-white text-gray-700 dark:bg-card-1 dark:text-gray-300",
};

export default function GeneralLabelAILN({
  children,
  variant = "white",
  icon,
  className,
}: GeneralLabelAILNProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${variantClasses[variant]} ${className ?? ""}`}
    >
      {icon}
      {children}
    </span>
  );
}

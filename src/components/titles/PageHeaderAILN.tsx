import { ReactNode } from "react";

interface PageHeaderAILNProps {
  title: string;
  desc?: string;
  /** Optional right-aligned content (e.g. stat pills, action buttons). */
  children?: ReactNode;
}

export default function PageHeaderAILN({
  title,
  desc,
  children,
}: PageHeaderAILNProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold dark:text-white sm:text-2xl">
          {title}
        </h1>
        {desc && (
          <p className="text-sm font-inter text-gray-500 dark:text-gray-400">
            {desc}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

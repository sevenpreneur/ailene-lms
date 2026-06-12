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
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
        {desc && (
          <p className="text-sm font-inter text-gray-500 dark:text-gray-400">
            {desc}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

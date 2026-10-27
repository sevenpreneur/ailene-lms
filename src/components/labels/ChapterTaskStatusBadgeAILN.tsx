import type { ChapterTaskStatus } from "@/apis/chapter-tasks";
import { CHAPTER_TASK_STATUS } from "@/lib/chapter-task";

export default function ChapterTaskStatusBadgeAILN({
  status,
}: {
  status: ChapterTaskStatus;
}) {
  const { label, className } = CHAPTER_TASK_STATUS[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}

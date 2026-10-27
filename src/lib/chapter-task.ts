import type { ChapterTaskStatus } from "@/apis/chapter-tasks";

// Matches the backend limits for a submission note and a review comment.
export const CHAPTER_TASK_NOTE_MAX = 5000;
export const CHAPTER_TASK_COMMENT_MAX = 5000;
export const CHAPTER_TASK_UPLOAD_FOLDER = "chapter-tasks";

export const CHAPTER_TASK_STATUS: Record<
  ChapterTaskStatus,
  { label: string; className: string }
> = {
  not_started: {
    label: "Belum dikerjakan",
    className: "bg-card-2 text-gray-600 dark:text-gray-300",
  },
  on_review: {
    label: "Sedang direview",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  },
  approved: {
    label: "Berhasil",
    className: "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright",
  },
  rejected: {
    label: "Perlu diperbaiki",
    className: "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300",
  },
};

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "avif"];

// Proofs may be any uploaded file; only image URLs are previewed inline.
export function isImageUrl(raw: string): boolean {
  try {
    const extension = new URL(raw).pathname.split(".").pop()?.toLowerCase();
    return !!extension && IMAGE_EXTENSIONS.includes(extension);
  } catch {
    return false;
  }
}

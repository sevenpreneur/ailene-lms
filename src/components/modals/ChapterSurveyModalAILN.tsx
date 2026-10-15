"use client";

import type {
  ChapterSurveyAnswer,
  ChapterSurveyDetail,
} from "@/apis/chapter-surveys";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import {
  CHAPTER_SURVEY_RATING_KEYS,
  CHAPTER_SURVEY_SECTIONS,
  CHAPTER_SURVEY_TEXT_MAX,
  type ChapterSurveyRatingKey,
  type ChapterSurveyTextKey,
} from "@/lib/chapter-evaluation";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  MessageSquare,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

type Ratings = Record<ChapterSurveyRatingKey, number>;
type Texts = Record<ChapterSurveyTextKey, string>;

const EMPTY_RATINGS: Ratings = {
  trainer_clarity: 0,
  trainer_mastery: 0,
  trainer_responsiveness: 0,
  trainer_engagement: 0,
  material_relevance: 0,
  material_flow: 0,
  material_depth: 0,
  learning_value: 0,
};
const EMPTY_TEXTS: Texts = {
  favorite_material: "",
  missing_topics: "",
  disliked_material: "",
  improvement_suggestion: "",
};
const SECTION_ICONS = [GraduationCap, BookOpen, MessageSquare];

function StarRating({
  id,
  value,
  disabled,
  onChange,
}: {
  id: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div
      role="radiogroup"
      aria-labelledby={id}
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-label={`${rating} dari 5`}
          aria-checked={value === rating}
          disabled={disabled}
          onMouseEnter={() => setHovered(rating)}
          onMouseLeave={() => setHovered(0)}
          onFocus={() => setHovered(rating)}
          onBlur={() => setHovered(0)}
          onClick={() => onChange(rating)}
          className="rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-claude disabled:cursor-default"
        >
          <Star
            className={`size-6 ${rating <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
            aria-hidden="true"
          />
        </button>
      ))}
      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
        {value ? `${value}/5` : "Belum dinilai"}
      </span>
    </div>
  );
}

export default function ChapterSurveyModalAILN({
  chapterId,
  isOpen,
  onClose,
  onSuccess,
}: {
  chapterId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [survey, setSurvey] = useState<ChapterSurveyDetail | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Ratings>(EMPTY_RATINGS);
  const [texts, setTexts] = useState<Texts>(EMPTY_TEXTS);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    setIsLoading(true);
    setError(null);
    setSurvey(null);
    fetch("/api/chapter-surveys/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter_id: chapterId }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Gagal memuat survei chapter.");
        return response.json() as Promise<ChapterSurveyDetail>;
      })
      .then((detail) => {
        if (cancelled) return;
        setSurvey(detail);
        const answer = detail.response;
        setRatings(
          answer
            ? (Object.fromEntries(
                CHAPTER_SURVEY_RATING_KEYS.map((key) => [key, answer[key]]),
              ) as Ratings)
            : EMPTY_RATINGS,
        );
        setTexts(
          answer
            ? {
                favorite_material: answer.favorite_material ?? "",
                missing_topics: answer.missing_topics ?? "",
                disliked_material: answer.disliked_material ?? "",
                improvement_suggestion: answer.improvement_suggestion ?? "",
              }
            : EMPTY_TEXTS,
        );
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat survei chapter. Coba lagi.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [chapterId, isOpen, onClose]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!survey || survey.response || isSubmitting) return;
    if (CHAPTER_SURVEY_RATING_KEYS.some((key) => ratings[key] < 1)) {
      toast.warning("Isi semua delapan penilaian terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/chapter-surveys/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter_id: chapterId,
          ...ratings,
          ...Object.fromEntries(
            Object.entries(texts).map(([key, value]) => [
              key,
              value.trim() || null,
            ]),
          ),
        }),
      });
      if (!response.ok) {
        if (response.status === 409) {
          toast.info("Kamu sudah mengisi survei chapter ini.");
          onSuccess?.();
          onClose();
          return;
        }
        throw new Error(
          response.status === 403
            ? "Survei chapter ini belum tersedia."
            : "Gagal mengirim survei. Coba lagi.",
        );
      }
      const answer = (await response.json()) as ChapterSurveyAnswer;
      setSurvey({ ...survey, response: answer });
      toast.success("Terima kasih, feedback kamu sudah terkirim.");
      onSuccess?.();
      onClose();
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Gagal mengirim survei. Coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;
  const readOnly = !!survey?.response;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-survey-title"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-card-1 shadow-2xl sm:flex-row"
      >
        <aside className="border-b border-dashboard-border bg-card-2 p-5 sm:w-56 sm:shrink-0 sm:border-b-0 sm:border-r">
          <p className="text-xs font-medium uppercase tracking-widest text-claude dark:text-lime-bright">
            Survei Chapter
          </p>
          <p className="mt-2 font-headline text-lg font-medium text-foreground">
            Pengalaman belajarmu
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
            Bantu kami meningkatkan kualitas sesi berikutnya.
          </p>
          <div className="mt-6 hidden space-y-4 sm:block">
            {CHAPTER_SURVEY_SECTIONS.map((section, index) => {
              const Icon = SECTION_ICONS[index];
              return (
                <div
                  key={section.title}
                  className="flex items-start gap-3 text-sm"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-claude dark:text-lime-bright" />
                  <span>{section.title}</span>
                </div>
              );
            })}
          </div>
        </aside>
        <form
          onSubmit={submit}
          className="flex min-h-0 min-w-0 flex-1 flex-col"
        >
          <header className="flex items-start justify-between gap-4 border-b border-dashboard-border px-5 py-4">
            <div>
              <h2
                id="chapter-survey-title"
                className="font-headline text-lg font-medium"
              >
                Survei Chapter
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {survey?.chapter.name ?? "Memuat chapter..."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup survei"
              className="rounded-lg p-1 text-gray-500 hover:text-foreground focus-visible:outline-2 focus-visible:outline-claude"
            >
              <X className="size-5" />
            </button>
          </header>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" />
                Memuat survei...
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {survey?.response && (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                Terkirim{" "}
                {dayjs(survey.response.submitted_at)
                  .locale("id")
                  .format("D MMMM YYYY, HH:mm")}
                . Terima kasih atas feedback-mu!
              </p>
            )}
            {survey &&
              CHAPTER_SURVEY_SECTIONS.map((section, index) => {
                const Icon = SECTION_ICONS[index];
                return (
                  <section key={section.title} className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-hijau-t p-3 dark:bg-claude/10">
                      <Icon className="size-5 text-claude dark:text-lime-bright" />
                      <div>
                        <h3 className="font-headline text-base font-medium">
                          {section.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    {section.ratings?.map((field, fieldIndex) => (
                      <div
                        key={field.key}
                        className="rounded-lg border border-dashboard-border p-4"
                      >
                        <p
                          id={`survey-${field.key}`}
                          className="mb-2 text-sm font-medium"
                        >
                          {index * 4 + fieldIndex + 1}. {field.question}{" "}
                          <span className="text-destructive">*</span>
                        </p>
                        <StarRating
                          id={`survey-${field.key}`}
                          value={ratings[field.key]}
                          disabled={readOnly || isSubmitting}
                          onChange={(value) =>
                            setRatings((previous) => ({
                              ...previous,
                              [field.key]: value,
                            }))
                          }
                        />
                      </div>
                    ))}
                    {section.texts?.map((field) => (
                      <div
                        key={field.key}
                        className="rounded-lg border border-dashboard-border p-4"
                      >
                        <TextAreaAILN
                          textAreaId={`survey-${field.key}`}
                          textAreaName={field.question}
                          textAreaPlaceholder={field.placeholder}
                          textAreaHeight="h-20"
                          characterLength={CHAPTER_SURVEY_TEXT_MAX}
                          value={texts[field.key]}
                          variant="STUDENT"
                          disabled={readOnly || isSubmitting}
                          onTextAreaChange={(value) =>
                            setTexts((previous) => ({
                              ...previous,
                              [field.key]: value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </section>
                );
              })}
          </div>
          <footer className="flex justify-end gap-2 border-t border-dashboard-border px-5 py-4">
            <ButtonAILN type="button" variant="neutral" onClick={onClose}>
              {readOnly ? "Tutup" : "Batal"}
            </ButtonAILN>
            {survey && !readOnly && (
              <ButtonAILN
                type="submit"
                variant="forest"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mengirim..." : "Kirim survei"}
              </ButtonAILN>
            )}
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}

"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import RatingScaleAILN from "@/components/fields/RatingScaleAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { ChapterSurveyDetail } from "@/apis/chapter-surveys";
import {
  CHAPTER_SURVEY_COMMENT_MAX,
  CHAPTER_SURVEY_QUESTIONS,
  type ChapterSurveyRatingKey,
} from "@/lib/chapter-evaluation";
import { useProjectId } from "@/lib/use-project-id";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import "dayjs/locale/id";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ChapterSurveyAILNProps {
  survey: ChapterSurveyDetail;
}

type Ratings = Record<ChapterSurveyRatingKey, number | null>;

export default function ChapterSurveyAILN({ survey }: ChapterSurveyAILNProps) {
  const router = useRouter();
  const projectId = useProjectId();
  const submitted = survey.response;

  const [ratings, setRatings] = useState<Ratings>({
    satisfaction: submitted?.satisfaction ?? null,
    relevance: submitted?.relevance ?? null,
    trainer_rating: submitted?.trainer_rating ?? null,
  });
  const [comment, setComment] = useState(submitted?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backHref = `/${projectId}/student/learning-path?chapter=${survey.chapter.id}`;
  const readOnly = !!submitted || isSubmitting;
  const complete = CHAPTER_SURVEY_QUESTIONS.every((q) => ratings[q.key] !== null);

  const submit = async () => {
    if (!complete) {
      toast.error("Isi ketiga penilaian dulu sebelum mengirim.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/chapter-surveys/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter_id: survey.chapter.id,
          ...ratings,
          comment: comment.trim() === "" ? null : comment.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Terima kasih, feedback kamu sudah terkirim.");
        router.refresh();
        return;
      }
      if (res.status === 409) {
        toast.info("Kamu sudah mengisi survei chapter ini.");
        router.refresh();
        return;
      }
      toast.error(
        res.status === 403
          ? "Survei ini baru dibuka setelah sesi chapter dimulai."
          : "Gagal mengirim survei. Coba lagi."
      );
    } catch {
      toast.error("Gagal mengirim survei. Coba lagi.");
    }
    setIsSubmitting(false);
  };

  return (
    <PageContainerAILN>
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <PageHeaderAILN
          title="Survei Chapter"
          desc={`Bantu kami memperbaiki program — ${survey.chapter.name}`}
        />

        {submitted && (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 shrink-0" />
            Terkirim{" "}
            {dayjs(submitted.submitted_at).locale("id").format("D MMMM YYYY, HH:mm")}
            . Terima kasih atas feedback-mu!
          </div>
        )}

        <div className="flex flex-col gap-6 rounded-lg border border-dashboard-border bg-card-1 p-5">
          {CHAPTER_SURVEY_QUESTIONS.map((q) => (
            <RatingScaleAILN
              key={q.key}
              id={`survey-${q.key}`}
              question={q.question}
              lowLabel={q.low}
              highLabel={q.high}
              value={ratings[q.key]}
              disabled={readOnly}
              onChange={(value) =>
                setRatings((prev) => ({ ...prev, [q.key]: value }))
              }
            />
          ))}

          <TextAreaAILN
            textAreaId="survey-comment"
            textAreaName="Ada masukan lain? (opsional)"
            textAreaHeight="h-28"
            textAreaPlaceholder="Apa yang paling membantu, atau yang perlu diperbaiki?"
            characterLength={CHAPTER_SURVEY_COMMENT_MAX}
            value={comment}
            variant="STUDENT"
            disabled={readOnly}
            onTextAreaChange={setComment}
          />

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end dark:border-dashboard-border">
            <Link href={backHref}>
              <ButtonAILN variant="neutral" className="w-full sm:w-auto">
                Kembali ke Alur Belajar
              </ButtonAILN>
            </Link>
            {!submitted && (
              <ButtonAILN
                variant="lime"
                disabled={isSubmitting}
                onClick={submit}
              >
                {isSubmitting ? "Mengirim..." : "Kirim survei"}
              </ButtonAILN>
            )}
          </div>
        </div>
      </div>
    </PageContainerAILN>
  );
}

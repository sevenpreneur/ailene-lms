"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { CheckSession } from "@/lib/actions";
import { PRE_ASSESSMENT_SECTIONS, scoreTone } from "@/lib/pre-assessment";
import { useProjectId } from "@/lib/use-project-id";
import type {
  PreAssessmentItem,
  PreAssessmentScore,
} from "@/apis/pre-assessment";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type PreAssessmentReportState =
  | { kind: "scored"; score: PreAssessmentScore }
  | { kind: "failed"; message: string }
  | { kind: "missing" };

export default function PreAssessmentReportAILN({
  state,
  items,
}: {
  state: PreAssessmentReportState;
  items: PreAssessmentItem[];
}) {
  // Renders *at* /student/pre-assessment, so a missing result shows an error rather than redirecting.
  if (state.kind === "missing") {
    return (
      <PageContainerAILN className="min-h-screen">
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }
  if (state.kind === "failed") {
    return <ScoreFailed message={state.message} />;
  }
  return <ReportContent score={state.score} items={items} />;
}

const MAX_BAND = 5;

function ReportContent({
  score,
  items,
}: {
  score: PreAssessmentScore;
  items: PreAssessmentItem[];
}) {
  const router = useRouter();
  const projectId = useProjectId();
  const userQ = useQuery({ queryKey: ["session"], queryFn: CheckSession });
  const firstName = userQ.data?.user?.full_name?.split(" ")[0] ?? "teman";

  const itemsByCode = new Map(items.map((item) => [item.item_code, item]));
  const notes = buildNotes(score);

  return (
    <PageContainerAILN className="min-h-screen items-start justify-start">
      <div className="flex w-full flex-col gap-5">
        <PageHeaderAILN
          title={`Hasil Pre-Assessment-mu, ${firstName}!`}
          desc="Titik berangkatmu di kerangka AI Proficiency, dihitung dari jawaban skenario, latihan prompt, dan kebiasaanmu."
        />

        <BandHero score={score} />

        {notes.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="size-4 shrink-0" />
              Perlu diperhatikan
            </div>
            <ul className="flex list-disc flex-col gap-1 pl-6 text-sm leading-6">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionContainerAILN
            title="Tiga dimensi"
            desc="Pengetahuan, keterampilan, dan kebiasaan, skala 0-100."
          >
            <div className="flex flex-col gap-4">
              <ScoreBar label="Pengetahuan" score={score.dimensions.knowledge} />
              <ScoreBar label="Keterampilan" score={score.dimensions.skills} />
              <ScoreBar
                label="Kebiasaan"
                score={score.dimensions.behaviours}
              />
            </div>
          </SectionContainerAILN>

          <SectionContainerAILN
            title="Penguasaan per level"
            desc="Persentase soal yang kamu kuasai di tiap tingkat kesulitan."
          >
            <div className="flex flex-col gap-4">
              <ScoreBar
                label="Level 1 · Dasar"
                score={score.level_mastery.p1}
              />
              <ScoreBar
                label="Level 2 · Menengah"
                score={score.level_mastery.p2}
              />
              <ScoreBar
                label="Level 3 · Lanjutan"
                score={score.level_mastery.p3}
              />
            </div>
          </SectionContainerAILN>
        </div>

        <SectionContainerAILN
          title="Peta kompetensi"
          desc="Skor per area, dikelompokkan ke empat kelompok kemampuan."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {score.clusters.map((cluster) => {
              const domains = score.domains.filter(
                (d) => d.cluster_code === cluster.code,
              );
              return (
                <div
                  key={cluster.code}
                  className="flex flex-col gap-3 rounded-lg border border-dashboard-border bg-card-2 p-4"
                >
                  <ScoreBar label={cluster.name} score={cluster.score} strong />
                  {domains.length > 0 && (
                    <div className="flex flex-col gap-2.5 border-t border-dashboard-border pt-3">
                      {domains.map((domain) => (
                        <ScoreBar
                          key={domain.code}
                          label={domain.name}
                          score={domain.score}
                          compact
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionContainerAILN>

        {score.feedback.length > 0 && (
          <SectionContainerAILN
            title="Masukan untuk jawaban tertulismu"
            desc="Dinilai oleh AI berdasarkan rubrik tiap soal."
          >
            <div className="flex flex-col gap-3">
              {score.feedback.map((fb) => {
                const item = itemsByCode.get(fb.item_code);
                return (
                  <article
                    key={fb.item_code}
                    className="flex gap-3 rounded-lg border border-dashboard-border bg-card-2 p-4"
                  >
                    <MessageSquareText className="mt-0.5 size-4 shrink-0 text-claude dark:text-lime-bright" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {item
                          ? PRE_ASSESSMENT_SECTIONS[item.section].label
                          : fb.item_code}
                      </div>
                      {item && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {item.question}
                        </p>
                      )}
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        {fb.text}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </SectionContainerAILN>
        )}

        <div className="flex justify-end">
          <ButtonAILN
            onClick={() => router.push(`/${projectId}/student/learning-path`)}
          >
            Mulai Belajar
            <ArrowRight className="size-4" />
          </ButtonAILN>
        </div>
      </div>
    </PageContainerAILN>
  );
}

function BandHero({ score }: { score: PreAssessmentScore }) {
  const { band, target_band: target } = score;
  return (
    <section className="ailn-card grid gap-5 border bg-card-1 p-5 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Band kamu saat ini
        </span>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-medium text-foreground">
            {band.name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Band {band.band} dari {MAX_BAND} · Level {band.level}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1">
          {Array.from({ length: MAX_BAND }, (_, i) => i + 1).map((b) => (
            <div key={b} className="flex flex-col gap-1.5">
              <div
                className={`h-2 rounded-full ${
                  b <= band.band
                    ? "bg-claude dark:bg-lime-bright"
                    : "bg-gray-200 dark:bg-dashboard-border"
                } ${b === target.band ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-card-1" : ""}`}
              />
              <span
                className={`text-[11px] tabular-nums ${
                  b === target.band
                    ? "font-medium text-amber-700 dark:text-amber-300"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                Band {b}
                {b === target.band && " · target"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
          score.meets_target
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
            : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
        }`}
      >
        <Target className="size-5 shrink-0" />
        <div className="text-sm">
          <div>
            Target: <span className="font-medium">{target.name}</span> (band{" "}
            {target.band})
          </div>
          <div>
            {score.meets_target
              ? "Kamu sudah mencapai target."
              : `Kurang ${score.gap} band lagi dari target.`}
          </div>
        </div>
      </div>
    </section>
  );
}

// Explains why the band may sit below the raw one, plus the risk flags.
function buildNotes(score: PreAssessmentScore): string[] {
  const notes: string[] = [];
  if (score.band.band === 0) {
    notes.push(
      "Band 0 berarti penguasaan soal Level 1 (dasar) belum mencapai batas minimal Band 1. Mulai dari materi dasar dulu.",
    );
  }
  // A failed gate only lowered the band when the raw band sat above it.
  const capped = score.raw_band.band > score.band.band;
  if (!score.gates.security_passed) {
    notes.push(
      capped
        ? "Ada jawaban keliru di soal keamanan yang kritis, sehingga band kamu dibatasi."
        : "Ada jawaban keliru di soal keamanan yang kritis. Selama belum dikuasai, ini membatasi band maksimalmu.",
    );
  }
  if (!score.gates.behaviour_passed) {
    notes.push(
      capped
        ? "Kebiasaan memakai AI yang kamu laporkan masih di bawah ambang, sehingga band kamu dibatasi."
        : "Kebiasaan memakai AI yang kamu laporkan masih di bawah ambang. Selama begitu, ini membatasi band maksimalmu.",
    );
  }
  if (capped) {
    notes.push(
      `Dari pengetahuan dan keterampilan saja, kamu ada di band ${score.raw_band.band} (${score.raw_band.name}).`,
    );
  }
  if (score.flags.overclaim) {
    notes.push(
      "Kebiasaan yang kamu laporkan belum sejalan dengan jawaban skenariomu.",
    );
  }
  if (score.flags.shadow_ai) {
    notes.push(
      "Kamu memakai akun AI pribadi untuk pekerjaan. Pastikan sesuai kebijakan data kantor.",
    );
  }
  if (score.flags.sensitive_data) {
    notes.push("Prompt latihanmu memuat data yang sensitif.");
  }
  return notes;
}

const TONE_BAR: Record<ReturnType<typeof scoreTone>, string> = {
  high: "bg-emerald-500",
  mid: "bg-amber-400",
  low: "bg-red-400",
};

function ScoreBar({
  label,
  score,
  strong,
  compact,
}: {
  label: string;
  score: number;
  strong?: boolean;
  compact?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`min-w-0 truncate ${
            compact ? "text-xs" : "text-sm"
          } ${strong ? "font-medium text-foreground" : "text-gray-600 dark:text-gray-300"}`}
        >
          {label}
        </span>
        <span
          className={`shrink-0 font-medium text-foreground ${compact ? "text-xs" : "text-sm"}`}
        >
          {formatScore(score)}
        </span>
      </div>
      <div
        className={`w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dashboard-border ${
          compact ? "h-1.5" : "h-2"
        }`}
      >
        <div
          className={`h-full rounded-full ${TONE_BAR[scoreTone(score)]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatScore(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(".", ",");
}

// A 502/503 from grading leaves the attempt submitted, so another score call retries it.
function ScoreFailed({ message }: { message: string }) {
  const router = useRouter();
  const projectId = useProjectId();
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      const res = await fetch("/api/pre-assessment/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        toast.error(payload?.message ?? "Hasil belum bisa dihitung.");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Gagal menghubungi server. Coba lagi.");
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <PageContainerAILN className="min-h-screen items-start justify-start">
      <div className="flex w-full flex-col gap-5">
        <PageHeaderAILN
          title="Hasil Pre-Assessment"
          desc="Jawabanmu sudah tersimpan."
        />
        <div className="flex flex-col items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-5 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="size-4 shrink-0" />
            Hasilmu belum bisa dihitung.
          </div>
          <p className="text-sm leading-6">
            Jawabanmu aman dan tidak perlu diisi ulang. Penilaian jawaban
            tertulis sedang gagal ({message}), coba hitung ulang sebentar lagi.
          </p>
          <ButtonAILN variant="neutral" onClick={retry} disabled={isRetrying}>
            {isRetrying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            Hitung ulang
          </ButtonAILN>
        </div>
      </div>
    </PageContainerAILN>
  );
}

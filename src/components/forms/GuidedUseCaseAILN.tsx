"use client";

import type { GuidedSession, GuidedStep } from "@/apis/use-cases";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import DisabledActionButtonAILN from "@/components/buttons/DisabledActionButtonAILN";
import GuidedUseCaseReviewAILN from "@/components/cards/GuidedUseCaseReviewAILN";
import GuidedIntakeAILN, {
  type GuidedIntake,
} from "@/components/forms/guided-use-case/GuidedIntakeAILN";
import GuidedEvidenceAILN, {
  type GuidedEvidence,
} from "@/components/forms/guided-use-case/GuidedEvidenceAILN";
import GuidedWorkflowAILN from "@/components/forms/guided-use-case/GuidedWorkflowAILN";
import GuidedUseCaseStepperAILN from "@/components/steppers/GuidedUseCaseStepperAILN";
import GuidedUseCaseModalAILN from "@/components/modals/GuidedUseCaseModalAILN";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import {
  GUIDED_FREQUENCIES,
  GUIDED_MOCK_REASON,
  GUIDED_HEADINGS,
  GUIDED_TYPES,
  isGuidedProofLink,
} from "@/lib/guided-use-case";
import { getGuidedUseCaseMock } from "@/mock-data/student";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState, type RefObject } from "react";

export default function GuidedUseCaseAILN({
  isOpen,
  onClose,
  triggerRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  // This is a new personal use case; the fixture ID is never submitted.
  const [sample] = useState(() => getGuidedUseCaseMock(0));
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [visitedStep, setVisitedStep] = useState(1);
  const [summary, setSummary] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [exampleFile, setExampleFile] = useState<File | null>(null);
  const [exampleMode, setExampleMode] = useState<"text" | "file">("text");
  const [outcomeFile, setOutcomeFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<GuidedStep[]>([]);
  const [intake, setIntake] = useState<GuidedIntake>({
    daily_task: "",
    frequency: null,
    example_text: "",
    sensitive_data_confirmed: false,
    minutes_without_ai: null,
    current_process: "",
    current_tools: [],
    pain_point: "",
  });
  const [evidence, setEvidence] = useState<GuidedEvidence>({
    outcome_proof: "",
    hours_with_ai: "",
    ai_tool: "",
    type: null,
    description: "",
    testimonial: "",
    helpfulness_rating: null,
    share_consent: false,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const valid = [
    (intake.daily_task ?? "").trim().length >= 30 && intake.frequency !== null,
    (!!intake.example_text?.trim() || exampleFile !== null) &&
      intake.sensitive_data_confirmed,
    intake.minutes_without_ai !== null &&
      Number.isFinite(intake.minutes_without_ai) &&
      intake.minutes_without_ai > 0 &&
      !!intake.current_process?.trim(),
    steps.length > 0 && accepted,
    steps.length > 0 &&
      steps.every((item) => item.is_done || !!item.skipped_reason?.trim()),
    (outcomeFile !== null || isGuidedProofLink(evidence.outcome_proof)) &&
      evidence.hours_with_ai.trim() !== "" &&
      Number.isFinite(Number(evidence.hours_with_ai)) &&
      Number(evidence.hours_with_ai) > 0 &&
      !!evidence.ai_tool.trim() &&
      evidence.type !== null &&
      !!evidence.description.trim() &&
      evidence.testimonial.trim().length >= 50 &&
      evidence.helpfulness_rating !== null,
  ];
  // Reopening an earlier step must not bypass prerequisites after an edit.
  const firstInvalid = valid.findIndex((value) => !value);
  const furthestStep = Math.min(
    visitedStep,
    firstInvalid < 0 ? 6 : firstInvalid + 1,
  );
  const canContinue = valid.slice(0, step).every(Boolean);

  function navigate(next: number) {
    setStep(next);
    setVisitedStep((previous) => Math.max(previous, next));
    setSummary(false);
    scrollRef.current?.scrollTo({ top: 0 });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function advance() {
    if (!canContinue || summary) return;
    if (step < 6) navigate(step + 1);
    else {
      setSummary(true);
      scrollRef.current?.scrollTo({ top: 0 });
      requestAnimationFrame(() => headingRef.current?.focus());
    }
  }

  function updateWorkflow(id: number, patch: Partial<GuidedStep>) {
    setSteps((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  const previewSession: GuidedSession = {
    ...sample,
    ...intake,
    id: 0,
    status: "intake",
    current_step: step as GuidedSession["current_step"],
    example_file_url: null,
    steps,
  };

  return (
    <GuidedUseCaseModalAILN
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      progress={
        <GuidedUseCaseStepperAILN
          currentStep={step}
          furthestStep={furthestStep}
          onStepChange={(next) => {
            if (next <= furthestStep) navigate(next);
          }}
        />
      }
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            advance();
          }
        }}
      >
        <div
          ref={scrollRef}
          data-guided-scroll
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-5 py-7 sm:px-8 sm:py-8"
        >
          <motion.section
            key={`${step}-${summary}`}
            initial={reducedMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className="min-w-0"
            aria-labelledby="guided-heading"
          >
            <div className="mb-6">
              <h2
                id="guided-heading"
                ref={headingRef}
                tabIndex={-1}
                className="max-w-lg text-2xl font-medium leading-tight tracking-tight focus:outline-none sm:text-3xl"
              >
                {summary ? "Siap untuk direview?" : GUIDED_HEADINGS[step - 1]}
              </h2>
            </div>
            {step <= 3 && (
              <GuidedIntakeAILN
                step={step}
                value={intake}
                onChange={(patch) =>
                  setIntake((previous) => ({ ...previous, ...patch }))
                }
                file={exampleFile}
                onFileChange={setExampleFile}
                exampleMode={exampleMode}
                onExampleModeChange={setExampleMode}
              />
            )}
            {step === 1 && !intake.daily_task && (
              <div className="mt-5">
                <ButtonAILN
                  variant="textAccent"
                  size="small"
                  onClick={() => {
                    setIntake({
                      daily_task: sample.daily_task,
                      frequency: sample.frequency,
                      example_text: sample.example_text,
                      sensitive_data_confirmed: false,
                      minutes_without_ai: sample.minutes_without_ai,
                      current_process: sample.current_process,
                      current_tools: [...sample.current_tools],
                      pain_point: sample.pain_point,
                    });
                    setExampleFile(null);
                    setExampleMode("text");
                  }}
                >
                  Coba isian contoh
                </ButtonAILN>
              </div>
            )}
            {(step === 4 || step === 5) && (
              <GuidedWorkflowAILN
                sample={sample}
                steps={steps}
                checklist={step === 5}
                onLoadSample={() => {
                  setSteps(sample.steps.map((item) => ({ ...item })));
                  setEvidence((previous) => ({
                    ...previous,
                    ai_tool:
                      previous.ai_tool ||
                      [
                        ...new Set(
                          sample.steps
                            .map((item) => item.suggested_tool)
                            .filter(
                              (tool) => tool !== "Manual" && tool !== "Excel",
                            ),
                        ),
                      ].join(", "),
                  }));
                }}
                onStepChange={updateWorkflow}
              />
            )}
            {step === 4 && steps.length > 0 && (
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg bg-card-2 p-4 text-sm">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-claude"
                />
                <span>Saya mau coba</span>
              </label>
            )}
            {step === 6 && !summary && (
              <GuidedEvidenceAILN
                value={evidence}
                onChange={(patch) =>
                  setEvidence((previous) => ({ ...previous, ...patch }))
                }
                file={outcomeFile}
                onFileChange={setOutcomeFile}
                minutesWithoutAi={intake.minutes_without_ai}
              />
            )}
            {step === 6 && summary && (
              <div className="flex flex-col gap-5">
                <dl className="grid gap-4 rounded-lg border border-dashboard-border bg-card-2 p-4 text-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="font-medium">Bukti hasil</dt>
                    <dd className="mt-1 break-all text-muted-foreground">
                      {outcomeFile
                        ? `${outcomeFile.name} (belum diunggah)`
                        : evidence.outcome_proof}
                    </dd>
                  </div>
                  {exampleFile && (
                    <div className="sm:col-span-2">
                      <dt className="font-medium">File contoh pekerjaan</dt>
                      <dd className="mt-1 break-all text-muted-foreground">
                        {exampleFile.name} (belum diunggah)
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium">Tanpa AI</dt>
                    <dd className="mt-1 text-muted-foreground">
                      {intake.minutes_without_ai} menit
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Dengan AI</dt>
                    <dd className="mt-1 text-muted-foreground">
                      {evidence.hours_with_ai} jam
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">AI tool</dt>
                    <dd className="mt-1 break-words text-muted-foreground">
                      {evidence.ai_tool}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Tipe</dt>
                    <dd className="mt-1 text-muted-foreground">
                      {
                        GUIDED_TYPES.find(
                          (item) => item.value === evidence.type,
                        )?.label
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Frekuensi</dt>
                    <dd className="mt-1 text-muted-foreground">
                      {
                        GUIDED_FREQUENCIES.find(
                          (item) => item.value === intake.frequency,
                        )?.label
                      }
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium">Penerapan & hasil</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                      {evidence.description}
                    </dd>
                  </div>
                </dl>
                <GuidedUseCaseReviewAILN
                  session={previewSession}
                  testimonial={evidence.testimonial}
                  helpfulness_rating={evidence.helpfulness_rating}
                  share_consent={evidence.share_consent}
                  preview
                />
              </div>
            )}
          </motion.section>
        </div>
      </div>
      <footer className="shrink-0 border-t border-dashboard-border bg-card-1 px-5 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-2">
          <ButtonAILN
            variant="ghost"
            disabled={step === 1}
            onClick={() => {
              if (summary) {
                setSummary(false);
                scrollRef.current?.scrollTo({ top: 0 });
                requestAnimationFrame(() => headingRef.current?.focus());
              } else navigate(step - 1);
            }}
          >
            <ArrowLeft className="size-4" />
            {summary ? "Ubah isian" : "Kembali"}
          </ButtonAILN>
          <div className="flex items-center gap-2">
            {!canContinue && !summary && (
              <GuidedHintAILN label="Yang perlu dilengkapi">
                {
                  [
                    "Isi pekerjaan minimal 30 karakter dan pilih frekuensi.",
                    "Tambahkan contoh dan konfirmasi penyamaran data.",
                    "Isi durasi lebih dari 0 menit dan proses kerjamu.",
                    "Buka contoh workflow, lalu centang Saya mau coba.",
                    "Tandai selesai atau isi alasan melewati setiap langkah.",
                    "Lengkapi bukti, durasi, tool, tipe, hasil, pengalaman (min. 50 karakter), dan rating.",
                  ][step - 1]
                }
              </GuidedHintAILN>
            )}
            {summary ? (
              <DisabledActionButtonAILN
                variant="student"
                reason={GUIDED_MOCK_REASON}
              >
                Kirim ke Champion
              </DisabledActionButtonAILN>
            ) : (
              <ButtonAILN
                variant="student"
                disabled={!canContinue}
                onClick={advance}
              >
                {step === 6 ? "Lihat ringkasan" : "Lanjut"}
                <ArrowRight className="size-4" />
              </ButtonAILN>
            )}
          </div>
        </div>
      </footer>
    </GuidedUseCaseModalAILN>
  );
}

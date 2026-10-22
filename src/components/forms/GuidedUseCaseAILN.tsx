"use client";

import type {
  GuidedSession,
  GuidedStep,
  GuidedSubmitResult,
} from "@/apis/use-cases";
import { useStudentIdentity } from "@/contexts/StudentIdentityContext";
import {
  browserDraftKey,
  readBrowserDraft,
  writeBrowserDraft,
} from "@/lib/browser-draft";
import ButtonAILN from "@/components/buttons/ButtonAILN";
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
  GUIDED_HEADINGS,
  GUIDED_TYPES,
  isGuidedProofLink,
} from "@/lib/guided-use-case";
import { formatDecimal } from "@/lib/format";
import { RefreshSkillPractice } from "@/lib/actions";
import { uploadPublicFile } from "@/lib/supabase";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
  UserRoundCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";

const EMPTY_INTAKE: GuidedIntake = {
  daily_task: "",
  frequency: null,
  example_text: "",
  sensitive_data_confirmed: false,
  minutes_without_ai: null,
  current_process: "",
  current_tools: [],
  pain_point: "",
};

const EMPTY_EVIDENCE: GuidedEvidence = {
  name: "",
  outcome_proof: "",
  minutes_with_ai: "",
  ai_tool: "",
  type: null,
  description: "",
  testimonial: "",
  helpfulness_rating: null,
  share_consent: false,
};

const REQUIREMENTS = [
  "Isi pekerjaan minimal 30 karakter dan pilih frekuensi.",
  "Tambahkan contoh dan konfirmasi penyamaran data.",
  "Isi durasi lebih dari 0 menit dan proses kerjamu.",
  "Centang Saya mau coba untuk melanjutkan ke checklist.",
  "Tandai selesai atau isi alasan melewati setiap langkah.",
  "Lengkapi bukti, durasi, tool, tipe, hasil, pengalaman (min. 50 karakter), dan rating.",
];

async function postGuided<T>(
  action: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const response = await fetch(`/api/use-cases/guided/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (
      !response.ok ||
      response.redirected ||
      !response.headers.get("content-type")?.includes("application/json") ||
      (action !== "details" && payload === null)
    ) {
      return {
        ok: false,
        message: payload?.message ?? "Gagal menyimpan. Coba lagi.",
      };
    }
    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, message: "Koneksi terputus. Coba lagi." };
  }
}

function intakeFrom(session: GuidedSession): GuidedIntake {
  return {
    daily_task: session.daily_task ?? "",
    frequency: session.frequency,
    example_text: session.example_text ?? "",
    sensitive_data_confirmed: session.sensitive_data_confirmed,
    minutes_without_ai: session.minutes_without_ai,
    current_process: session.current_process ?? "",
    current_tools: session.current_tools,
    pain_point: session.pain_point ?? "",
  };
}

function fileNameFromUrl(url: string): string {
  const last = decodeURIComponent(url.split("?")[0].split("/").pop() ?? "");
  return last.replace(/^\d+-/, "") || "File contoh";
}

export default function GuidedUseCaseAILN({
  projectId,
  useCaseId,
  useCaseName,
  championName,
  initialSession,
  submissionStatus,
  allowResubmit = false,
  launchInModal = false,
  onClose,
  triggerRef,
}: {
  projectId: string;
  useCaseId?: number;
  useCaseName?: string;
  championName?: string | null;
  initialSession?: GuidedSession | null;
  submissionStatus?: "accepted" | "awaiting_review" | "needs_revision";
  allowResubmit?: boolean;
  launchInModal?: boolean;
  onClose?: () => void;
  triggerRef?: RefObject<HTMLButtonElement | null>;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const userId = useStudentIdentity();
  const localKey = browserDraftKey(
    userId ?? "",
    projectId,
    `guided:${useCaseId ?? "personal"}`,
  );
  const [draftWarning, setDraftWarning] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<GuidedSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(launchInModal ? 1 : 4);
  const [visitedStep, setVisitedStep] = useState(launchInModal ? 1 : 4);
  const [redirecting, setRedirecting] = useState(false);
  const [summary, setSummary] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [exampleFile, setExampleFile] = useState<File | null>(null);
  const [exampleFileUrl, setExampleFileUrl] = useState("");
  const [exampleMode, setExampleMode] = useState<"text" | "file">("text");
  const [outcomeFile, setOutcomeFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<GuidedStep[]>([]);
  const [intake, setIntake] = useState<GuidedIntake>(EMPTY_INTAKE);
  const [evidence, setEvidence] = useState<GuidedEvidence>(EMPTY_EVIDENCE);
  const [busy, setBusy] = useState<
    null | "load" | "save" | "generate" | "submit"
  >(null);
  const [uploading, setUploading] = useState<null | "example" | "outcome">(
    null,
  );
  const [result, setResult] = useState<GuidedSubmitResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inIntake = launchInModal || (loaded && step <= 3 && !result);

  function workflowHref(next: GuidedSession) {
    const query = new URLSearchParams({ session_id: String(next.id) });
    if (next.use_case_id) query.set("use_case_id", String(next.use_case_id));
    return `/${projectId}/student/skill-practice/guided?${query}`;
  }

  function hydrate(next: GuidedSession) {
    setSession(next);
    setIntake(intakeFrom(next));
    setSteps(next.steps);
    setExampleFileUrl(next.example_file_url ?? "");
    setExampleMode(next.example_file_url ? "file" : "text");
    setAccepted(next.current_step >= 5 && next.steps.length > 0);
    // A revision only reopens the outcome; intake and workflow stay fixed.
    const current =
      next.status === "submitted"
        ? 6
        : next.steps.length === 0
          ? Math.min(Math.max(next.current_step, 1), 3)
          : Math.min(Math.max(next.current_step, 1), 6);
    setStep(current);
    setVisitedStep((previous) => Math.max(previous, current));
  }

  function restore(next: GuidedSession | null) {
    if (
      launchInModal &&
      next &&
      next.current_step >= 4 &&
      next.steps.length > 0
    ) {
      setRedirecting(true);
      router.push(workflowHref(next));
      return;
    }
    if (next) hydrate(next);
    else {
      setStep(1);
      setVisitedStep(1);
    }
    try {
      const draft = readBrowserDraft<{
        sessionId: number | null;
        serverUpdatedAt: string | null;
        intake: GuidedIntake;
        evidence: GuidedEvidence;
        exampleFileUrl: string;
        step: number;
        accepted: boolean;
      }>(window.localStorage, localKey);
      if (
        !draft ||
        draft.sessionId !== (next?.id ?? null) ||
        (next?.status === "submitted" && !allowResubmit)
      )
        return;
      if (draft.evidence && typeof draft.evidence.outcome_proof === "string") {
        const previousHours = (
          draft.evidence as GuidedEvidence & { hours_with_ai?: string }
        ).hours_with_ai;
        setEvidence({
          ...EMPTY_EVIDENCE,
          ...draft.evidence,
          minutes_with_ai:
            draft.evidence.minutes_with_ai ??
            (previousHours
              ? String(Number(previousHours.replace(",", ".")) * 60)
              : ""),
        });
      }
      if (
        next?.status !== "submitted" &&
        draft.serverUpdatedAt === (next?.updated_at ?? null) &&
        draft.intake &&
        typeof draft.intake.daily_task === "string"
      ) {
        setIntake({ ...EMPTY_INTAKE, ...draft.intake });
        setExampleFileUrl(draft.exampleFileUrl || "");
        setExampleMode(draft.exampleFileUrl ? "file" : "text");
        // Navigation remains subject to current server prerequisites.
        const restoredStep = Math.min(
          Math.max(Number(draft.step) || 1, 1),
          next?.current_step ?? 1,
          next?.steps.length ? 6 : 3,
        );
        setStep(restoredStep);
        setVisitedStep(restoredStep);
        setAccepted(!!draft.accepted && !!next?.steps.length);
      }
    } catch {
      setDraftWarning(true);
    }
  }

  // Resume the latest draft once when the page mounts.
  useEffect(() => {
    if (loaded || loadError) return;
    if (initialSession !== undefined) {
      restore(initialSession);
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setBusy("load");
    void postGuided<GuidedSession | null>(
      "details",
      useCaseId ? { use_case_id: useCaseId } : { project_id: projectId },
    ).then((response) => {
      if (cancelled) return;
      if (response.ok) {
        restore(response.data);
        setLoaded(true);
      } else setLoadError(response.message);
      setBusy(null);
    });
    return () => {
      cancelled = true;
    };
    // Restoration runs only when opening an unloaded form; edits must not rehydrate it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, initialSession, useCaseId, projectId, loadError]);

  const submitted = session?.status === "submitted";
  const revising = submitted && allowResubmit && !result;
  useEffect(() => {
    if (
      !loaded ||
      !userId ||
      result ||
      redirecting ||
      (submitted && !allowResubmit)
    )
      return;
    try {
      writeBrowserDraft(window.localStorage, localKey, {
        sessionId: session?.id ?? null,
        serverUpdatedAt: session?.updated_at ?? null,
        intake,
        evidence,
        exampleFileUrl,
        step,
        accepted,
      });
      queueMicrotask(() => setDraftWarning(false));
    } catch {
      queueMicrotask(() => setDraftWarning(true));
    }
  }, [
    loaded,
    userId,
    localKey,
    session?.id,
    session?.updated_at,
    intake,
    evidence,
    exampleFileUrl,
    step,
    accepted,
    result,
    submitted,
    allowResubmit,
    redirecting,
  ]);

  useEffect(() => {
    if (
      !loaded ||
      result ||
      (submitted && !allowResubmit) ||
      (!draftWarning && !uploading)
    )
      return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [loaded, result, submitted, allowResubmit, draftWarning, uploading]);

  const minutes = intake.minutes_without_ai;
  const minutesWithAi = Number(evidence.minutes_with_ai.replace(",", "."));

  const valid = [
    (intake.daily_task ?? "").trim().length >= 30 && intake.frequency !== null,
    (exampleMode === "file"
      ? !!exampleFileUrl
      : !!intake.example_text?.trim()) &&
      intake.sensitive_data_confirmed &&
      uploading !== "example",
    minutes !== null &&
      Number.isFinite(minutes) &&
      minutes > 0 &&
      !!intake.current_process?.trim(),
    steps.length > 0 && accepted,
    steps.length > 0 &&
      steps.every((item) => item.is_done || !!item.skipped_reason?.trim()),
    isGuidedProofLink(evidence.outcome_proof) &&
      uploading !== "outcome" &&
      Number.isFinite(minutesWithAi) &&
      minutesWithAi > 0 &&
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

  function focusTop() {
    if (inIntake) scrollRef.current?.scrollTo({ top: 0 });
    else
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  // Only intake steps send answers; workflow navigation saves the step alone.
  async function persist(nextStep: number): Promise<GuidedSession | null> {
    if (submitted) return session;
    setBusy("save");
    const response = await postGuided<GuidedSession>("save", {
      ...(session
        ? { session_id: session.id }
        : useCaseId
          ? { use_case_id: useCaseId }
          : { project_id: projectId }),
      current_step: nextStep,
      ...(step <= 3
        ? {
            ...intake,
            example_text: intake.example_text ?? "",
            example_file_url: exampleFileUrl,
            pain_point: intake.pain_point ?? "",
          }
        : {}),
    });
    setBusy(null);
    if (!response.ok) {
      toast.error(response.message);
      return null;
    }
    if (
      session &&
      session.steps.length > 0 &&
      response.data.steps.length === 0
    ) {
      toast.info("Isian berubah. Kirim langkah 3 untuk membuat workflow baru.");
    }
    setSession(response.data);
    setSteps(response.data.steps);
    if (response.data.steps.length === 0) setAccepted(false);
    return response.data;
  }

  async function navigate(next: number) {
    if (busy || redirecting || (inIntake && next > 3)) return;
    if (!(await persist(next))) return;
    setStep(next);
    setVisitedStep((previous) => Math.max(previous, next));
    setSummary(false);
    focusTop();
  }

  async function advance() {
    if (!canContinue || summary || busy || redirecting) return;
    if (step === 3) {
      const saved = await persist(4);
      if (!saved) return;
      const ready =
        saved.steps.length > 0 ? saved : await generate(undefined, saved.id);
      if (!ready) return;
      try {
        writeBrowserDraft(window.localStorage, localKey, {
          sessionId: ready.id,
          serverUpdatedAt: ready.updated_at,
          intake,
          evidence,
          exampleFileUrl,
          step: 4,
          accepted: false,
        });
      } catch {
        setDraftWarning(true);
      }
      setStep(4);
      setVisitedStep((previous) => Math.max(previous, 4));
      if (launchInModal) setRedirecting(true);
      else focusTop();
      router.push(workflowHref(ready));
    } else if (step < 6) void navigate(step + 1);
    else {
      setSummary(true);
      focusTop();
    }
  }

  async function generate(
    feedback?: string,
    sessionId?: number,
  ): Promise<GuidedSession | null> {
    if (busy === "generate" || !(sessionId ?? session?.id)) return null;
    setBusy("generate");
    const response = await postGuided<GuidedSession>("generate", {
      session_id: sessionId ?? session?.id,
      ...(feedback ? { feedback } : {}),
    });
    if (!response.ok) {
      setBusy(null);
      toast.error(response.message);
      return null;
    }
    setSession(response.data);
    setSteps(response.data.steps);
    setAccepted(false);
    await RefreshSkillPractice(projectId).catch(() => router.refresh());
    setBusy(null);
    return response.data;
  }

  function updateStep(id: number, patch: Partial<GuidedStep>) {
    setSteps((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function commitStep(id: number, patch: Partial<GuidedStep>) {
    const base = steps.find((item) => item.id === id);
    if (!base || !session) return;
    const merged = { ...base, ...patch };
    updateStep(id, patch);
    const response = await postGuided<GuidedStep>("check", {
      session_id: session.id,
      step_id: id,
      is_done: merged.is_done,
      note: merged.note ?? "",
      skipped_reason: merged.is_done ? "" : (merged.skipped_reason ?? ""),
    });
    if (!response.ok) {
      toast.error(response.message);
      updateStep(id, base);
      return;
    }
    updateStep(id, {
      is_done: response.data.is_done,
      done_at: response.data.done_at,
    });
  }

  async function upload(file: File | null, kind: "example" | "outcome") {
    if (kind === "example") {
      setExampleFile(file);
      setExampleFileUrl("");
    } else {
      setOutcomeFile(file);
      setEvidence((previous) => ({ ...previous, outcome_proof: "" }));
    }
    if (!file) return;
    setUploading(kind);
    try {
      const url = await uploadPublicFile(
        file,
        kind === "example" ? "guided-examples" : "use-case-outcomes",
      );
      if (kind === "example") setExampleFileUrl(url);
      else setEvidence((previous) => ({ ...previous, outcome_proof: url }));
    } catch {
      toast.error("Gagal mengunggah file. Coba lagi.");
      if (kind === "example") setExampleFile(null);
      else setOutcomeFile(null);
    } finally {
      setUploading(null);
    }
  }

  async function submit() {
    if (!session || busy) return;
    setBusy("submit");
    const response = await postGuided<GuidedSubmitResult>("submit", {
      session_id: session.id,
      ...(evidence.name.trim() ? { name: evidence.name.trim() } : {}),
      outcome_proof: evidence.outcome_proof.trim(),
      hours_with_ai: Math.round((minutesWithAi / 60) * 100) / 100,
      description: evidence.description.trim(),
      ai_tool: evidence.ai_tool.trim(),
      type: evidence.type,
      testimonial: evidence.testimonial.trim(),
      helpfulness_rating: evidence.helpfulness_rating,
      share_consent: evidence.share_consent,
    });
    setBusy(null);
    if (!response.ok) {
      toast.error(response.message);
      return;
    }
    try {
      writeBrowserDraft(window.localStorage, localKey, null);
    } catch {}
    setResult(response.data);
    setSession(response.data.session);
    await RefreshSkillPractice(projectId).catch(() => router.refresh());
    focusTop();
  }

  function handleClose() {
    if (busy || uploading || redirecting) {
      toast.info("Tunggu penyimpanan atau unggahan selesai sebelum menutup.");
      return;
    }
    if (
      draftWarning &&
      !result &&
      !window.confirm(
        "Draft belum tersimpan. Tutup sekarang dan kehilangan perubahan?",
      )
    )
      return;
    if (onClose) onClose();
    else router.push(`/${projectId}/student/skill-practice`);
  }

  const prefilled = !!championName && step <= 3 && !submitted;
  const editingAfterWorkflow = step <= 3 && steps.length > 0 && !submitted;
  const exampleFileLabel =
    exampleFile ??
    (exampleFileUrl ? new File([], fileNameFromUrl(exampleFileUrl)) : null);
  const reviewSession: GuidedSession | null = session
    ? { ...session, ...intake, example_file_url: exampleFileUrl || null, steps }
    : null;
  const previewing = step === 4 && !result && !submitted;

  const progress = !result && !submitted && !redirecting && (
    <GuidedUseCaseStepperAILN
      currentStep={step}
      furthestStep={furthestStep}
      maxStep={inIntake ? 3 : 6}
      onStepChange={(next) => {
        if (next <= furthestStep && next !== step) void navigate(next);
      }}
    />
  );

  const content = (
    <>
      {loadError ? (
        <div className="flex flex-col gap-3 p-6">
          <p role="alert">{loadError}</p>
          <ButtonAILN variant="outline" onClick={() => setLoadError(null)}>
            Coba lagi
          </ButtonAILN>
        </div>
      ) : busy === "load" || !loaded ? (
        <div className="flex min-h-48 flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Memuat isianmu…
        </div>
      ) : redirecting || (inIntake && busy === "generate") ? (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="flex min-h-64 flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center"
        >
          <Loader2 className="size-8 animate-spin text-claude dark:text-lime-bright" />
          <h2 className="text-xl font-medium">
            {redirecting ? "Workflow siap" : "AI sedang menyusun workflow"}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {redirecting
              ? "Membuka halaman untuk melanjutkan langkah 4–6…"
              : "Tunggu sebentar. Setelah selesai, kamu akan diarahkan ke halaman langkah 4–6."}
          </p>
        </div>
      ) : result || (submitted && !revising) ? (
        <SubmittedView
          headingRef={headingRef}
          result={result}
          submissionStatus={submissionStatus}
          session={reviewSession}
          evidence={result ? evidence : null}
          onClose={handleClose}
        />
      ) : (
        <>
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
              className={`min-w-0 ${previewing ? "py-4" : "px-5 py-7 sm:px-8 sm:py-8"} ${inIntake ? "min-h-0 flex-1 overflow-y-auto overscroll-contain" : ""}`}
            >
              <motion.section
                key={`${step}-${summary}`}
                initial={reducedMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="min-w-0"
                aria-labelledby="guided-heading"
              >
                <div
                  className={
                    previewing ? "sr-only" : "mb-6 flex flex-col gap-3"
                  }
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-claude dark:text-lime-bright">
                    {summary
                      ? "Ringkasan"
                      : `Langkah ${step} dari ${inIntake ? 3 : 6}`}
                  </p>
                  <h2
                    id="guided-heading"
                    ref={headingRef}
                    tabIndex={-1}
                    className="max-w-lg text-xl font-medium leading-tight tracking-tight focus:outline-none sm:text-2xl"
                  >
                    {summary
                      ? "Siap untuk direview?"
                      : GUIDED_HEADINGS[step - 1]}
                  </h2>
                  {revising && !summary && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:bg-amber-500/10 dark:text-amber-200">
                      Champion meminta revisi. Catatan review dan hasil kiriman
                      lama belum tersedia di halaman ini. Hubungi Champion untuk
                      arahan perbaikan, lalu perbarui bukti dan ceritamu dan
                      kirim ulang.
                    </p>
                  )}
                  {prefilled && (
                    <div className="flex items-start gap-2 rounded-lg bg-hijau-t/70 px-3 py-2 text-xs text-claude dark:bg-claude/10 dark:text-lime-bright">
                      <UserRoundCheck className="mt-0.5 size-4 shrink-0" />
                      <span>
                        Disiapkan oleh {championName}. Sesuaikan jika ada yang
                        kurang tepat dengan pekerjaanmu.
                      </span>
                    </div>
                  )}
                  {editingAfterWorkflow && (
                    <p className="text-xs text-muted-foreground">
                      Mengubah isian di sini akan menghapus workflow yang sudah
                      dibuat.
                    </p>
                  )}
                </div>
                {step <= 3 && (
                  <GuidedIntakeAILN
                    step={step}
                    value={intake}
                    onChange={(patch) =>
                      setIntake((previous) => ({ ...previous, ...patch }))
                    }
                    file={exampleFileLabel}
                    onFileChange={(file) => void upload(file, "example")}
                    exampleMode={exampleMode}
                    onExampleModeChange={setExampleMode}
                    uploading={uploading === "example"}
                  />
                )}
                {(step === 4 || step === 5) && (
                  <GuidedWorkflowAILN
                    session={session}
                    steps={steps}
                    checklist={step === 5}
                    generating={busy === "generate" || !!session?.is_generating}
                    onGenerate={async (feedback) =>
                      !!(await generate(feedback))
                    }
                    onStepChange={updateStep}
                    onStepCommit={commitStep}
                  />
                )}
                {step === 4 && steps.length > 0 && busy !== "generate" && (
                  <label
                    className={`mt-5 flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm transition ${accepted ? "border-claude/30 bg-hijau-t/40 dark:border-lime-bright/30 dark:bg-claude/10" : "border-dashboard-border bg-card-1 hover:border-claude/30"}`}
                  >
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      className="mt-0.5 size-4 shrink-0 accent-claude"
                    />
                    <span>
                      <span className="font-medium">Saya mau coba</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Lanjutkan untuk menjalankan langkahnya satu per satu dan
                        mencatat hasilnya.
                      </span>
                    </span>
                  </label>
                )}
                {step === 6 && !summary && (
                  <GuidedEvidenceAILN
                    value={evidence}
                    onChange={(patch) =>
                      setEvidence((previous) => ({ ...previous, ...patch }))
                    }
                    file={outcomeFile}
                    onFileChange={(file) => void upload(file, "outcome")}
                    onLinkChange={(outcome_proof) => {
                      setOutcomeFile(null);
                      setEvidence((previous) => ({
                        ...previous,
                        outcome_proof,
                      }));
                    }}
                    minutesWithoutAi={minutes}
                    showName={!useCaseId}
                    uploading={uploading === "outcome"}
                  />
                )}
                {step === 6 && summary && reviewSession && (
                  <div className="flex flex-col gap-5">
                    <dl className="grid gap-4 rounded-lg border border-dashboard-border bg-card-2 p-4 text-sm sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <dt className="font-medium">Bukti hasil</dt>
                        <dd className="mt-1 break-all text-muted-foreground">
                          {outcomeFile?.name ?? evidence.outcome_proof}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium">Tanpa AI</dt>
                        <dd className="mt-1 text-muted-foreground">
                          {minutes} menit
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium">Dengan AI</dt>
                        <dd className="mt-1 text-muted-foreground">
                          {evidence.minutes_with_ai} menit
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
                      session={reviewSession}
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
          <footer
            className={
              previewing
                ? "sticky bottom-0 z-20 shrink-0 rounded-lg border border-dashboard-border bg-card-1/95 px-5 py-3 shadow-sm backdrop-blur sm:px-6"
                : "shrink-0 border-t border-dashboard-border bg-card-1 px-5 py-4 sm:px-8"
            }
          >
            <p
              role="status"
              className={
                previewing && !draftWarning && !busy
                  ? "sr-only"
                  : "mb-2 text-xs text-muted-foreground"
              }
            >
              {busy === "save"
                ? "Menyimpan langkah ke server..."
                : draftWarning
                  ? "Draft belum tersimpan. Jangan tutup halaman."
                  : previewing
                    ? "Workflow tersimpan. Lanjutkan saat siap."
                    : "Draft isian tersimpan di browser ini untuk akunmu. Pindah langkah juga menyimpan proses ke server."}
            </p>
            <div className="flex items-center justify-between gap-2">
              <ButtonAILN
                variant="ghost"
                disabled={step === 1 || !!busy || (revising && !summary)}
                onClick={() => {
                  if (summary) {
                    setSummary(false);
                    focusTop();
                  } else void navigate(step - 1);
                }}
              >
                <ArrowLeft className="size-4" />
                {summary
                  ? "Ubah isian"
                  : previewing
                    ? "Ubah jawaban"
                    : "Kembali"}
              </ButtonAILN>
              <div className="flex items-center gap-2">
                {!canContinue && !summary && (
                  <GuidedHintAILN label="Yang perlu dilengkapi">
                    {REQUIREMENTS[step - 1]}
                  </GuidedHintAILN>
                )}
                {summary ? (
                  <ButtonAILN
                    variant="student"
                    disabled={busy === "submit"}
                    onClick={() => void submit()}
                  >
                    {busy === "submit" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Kirim ke Champion
                  </ButtonAILN>
                ) : (
                  <ButtonAILN
                    variant="student"
                    disabled={!canContinue || !!busy}
                    onClick={advance}
                  >
                    {busy === "save" && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {step === 6
                      ? "Lihat ringkasan"
                      : step === 3
                        ? "Kirim & buat workflow AI"
                        : step === 4
                          ? "Mulai coba"
                          : "Lanjut"}
                    {busy !== "save" && <ArrowRight className="size-4" />}
                  </ButtonAILN>
                )}
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );

  if (inIntake) {
    return (
      <GuidedUseCaseModalAILN
        onClose={handleClose}
        triggerRef={triggerRef}
        title={useCaseName ?? "Catat Use Case"}
        progress={progress}
      >
        {content}
      </GuidedUseCaseModalAILN>
    );
  }

  return (
    <div
      className={`mx-auto flex w-full flex-col gap-5 ${previewing ? "max-w-6xl" : "max-w-4xl"}`}
    >
      <button
        type="button"
        onClick={handleClose}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Kembali ke Latihan AI
      </button>
      <div
        className={
          previewing
            ? "min-w-0"
            : "overflow-hidden rounded-lg border border-dashboard-border bg-card-1"
        }
      >
        <header
          className={`flex flex-wrap items-center justify-between gap-4 ${previewing ? "pb-2" : "border-b border-dashboard-border px-5 py-5 sm:px-8"}`}
        >
          <div>
            <p className="text-xs text-muted-foreground">
              {previewing
                ? "Langkah 4 dari 6 · Tinjau rencana kerjamu"
                : "Latihan AI terpandu · Langkah 4–6"}
            </p>
            <h1 className="mt-1 font-headline text-xl font-medium sm:text-2xl">
              {useCaseName ??
                (previewing ? "Saran workflow AI" : "Catat Use Case")}
            </h1>
          </div>
          {progress}
        </header>
        {content}
      </div>
    </div>
  );
}

function SubmittedView({
  headingRef,
  result,
  submissionStatus,
  session,
  evidence,
  onClose,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  result: GuidedSubmitResult | null;
  submissionStatus?: "accepted" | "awaiting_review" | "needs_revision";
  session: GuidedSession | null;
  evidence: GuidedEvidence | null;
  onClose: () => void;
}) {
  const accepted =
    submissionStatus === "accepted" || result?.submission_status === "accepted";
  return (
    <>
      <div className="px-5 py-8 sm:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex size-16 items-center justify-center rounded-full bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright"
          >
            <CheckCircle2 className="size-8" />
          </motion.span>
          <h2
            id="guided-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-medium tracking-tight focus:outline-none"
          >
            {accepted ? "Use case diterima" : "Terkirim ke Champion"}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {accepted
              ? "Champion sudah menerima use case ini."
              : "Champion akan mereview hasilmu. Kamu akan dapat notifikasi setelah direview."}
          </p>
          {result && (
            <div className="mt-2 grid w-full max-w-sm grid-cols-2 overflow-hidden rounded-lg border border-dashboard-border">
              <div className="bg-hijau-t/60 p-4 dark:bg-claude/10">
                <p className="text-xs text-muted-foreground">Waktu dihemat</p>
                <p className="mt-1 font-headline text-2xl font-medium text-claude dark:text-lime-bright">
                  {formatDecimal(result.hours_saved * 60)}{" "}
                  <span className="font-sans text-sm font-normal">menit</span>
                </p>
              </div>
              <div className="border-l border-dashboard-border p-4">
                <p className="text-xs text-muted-foreground">Langkah dicoba</p>
                <p className="mt-1 font-headline text-2xl font-medium">
                  {result.session.steps.filter((item) => item.is_done).length}
                  <span className="font-sans text-sm font-normal">
                    /{result.session.steps.length}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
        {session && (
          <div className="mt-8">
            <GuidedUseCaseReviewAILN
              session={session}
              testimonial={evidence?.testimonial}
              helpfulness_rating={evidence?.helpfulness_rating}
              share_consent={evidence?.share_consent}
            />
          </div>
        )}
      </div>
      <footer className="shrink-0 border-t border-dashboard-border bg-card-1 px-5 py-4 sm:px-8">
        <div className="flex justify-end">
          <ButtonAILN variant="student" onClick={onClose}>
            Selesai
          </ButtonAILN>
        </div>
      </footer>
    </>
  );
}

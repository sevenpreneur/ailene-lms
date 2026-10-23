"use client";

import type { TeamMember } from "@/apis/champion";
import type { Category } from "@/apis/categories";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GuidedHintAILN from "@/components/elements/GuidedHintAILN";
import InputAILN from "@/components/fields/InputAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import GuidedIntakeAILN, {
  type GuidedIntake,
} from "@/components/forms/guided-use-case/GuidedIntakeAILN";
import {
  GUIDED_CHAMPION_HEADINGS,
  GUIDED_CHAMPION_STAGES,
  GUIDED_FREQUENCIES,
} from "@/lib/guided-use-case";
import { useProjectId } from "@/lib/use-project-id";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useRef, useState } from "react";
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

const REQUIREMENTS = [
  "Isi pekerjaan minimal 30 karakter dan pilih frekuensi.",
  "Tempel contoh dan konfirmasi data sudah disamarkan.",
  "Isi durasi lebih dari 0 menit dan proses kerjanya.",
  "Isi judul, pilih 1–2 kategori, minimal satu anggota, dan deadline di masa depan.",
];

export default function CreateGuidedUseCaseFormAILN({
  isOpen,
  onClose,
  members,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  categories: Category[];
}) {
  const projectId = useProjectId();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [intake, setIntake] = useState<GuidedIntake>(EMPTY_INTAKE);
  const [name, setName] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [deadlineDate, setDeadlineDate] = useState(
    dayjs().add(7, "day").format("YYYY-MM-DD"),
  );
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assignedCount, setAssignedCount] = useState<number | null>(null);

  const deadline = dayjs(`${deadlineDate}T${deadlineTime}`);
  const minutes = intake.minutes_without_ai;
  const valid = [
    (intake.daily_task ?? "").trim().length >= 30 && intake.frequency !== null,
    !!intake.example_text?.trim() && intake.sensitive_data_confirmed,
    minutes !== null &&
      Number.isFinite(minutes) &&
      minutes > 0 &&
      !!intake.current_process?.trim(),
    !!name.trim() &&
      categoryIds.length >= 1 &&
      memberIds.length > 0 &&
      deadline.isValid() &&
      deadline.isAfter(dayjs()),
  ];
  const canContinue = valid.slice(0, step).every(Boolean);
  const furthest = Math.max(1, valid.findIndex((value) => !value) + 1 || 4);

  function go(next: number) {
    setStep(next);
    scrollRef.current?.scrollTo({ top: 0 });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function reset() {
    setStep(1);
    setIntake(EMPTY_INTAKE);
    setName("");
    setCategoryIds([]);
    setMemberIds([]);
    setMessage("");
    setAssignedCount(null);
  }

  function handleClose() {
    if (assignedCount !== null) {
      reset();
      router.refresh();
    }
    onClose();
  }

  async function submit() {
    if (!canContinue || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/champion/use-cases/create-guided", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          name: name.trim(),
          category_ids: categoryIds,
          assignment: {
            target_type: "MEMBER",
            target_access_ids: memberIds,
            deadline: deadline.toISOString(),
            message: message.trim() || null,
          },
          intake: {
            ...intake,
            daily_task: intake.daily_task?.trim(),
            example_text: intake.example_text?.trim(),
            current_process: intake.current_process?.trim(),
            pain_point: intake.pain_point?.trim() || null,
            sensitive_data_confirmed: true,
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (
        !response.ok ||
        response.redirected ||
        !response.headers.get("content-type")?.includes("application/json")
      ) {
        toast.error(payload?.message ?? "Gagal membuat guided use case.");
        return;
      }
      setAssignedCount(payload?.assigned_count ?? memberIds.length);
    } catch {
      toast.error("Gagal membuat guided use case.");
    } finally {
      setSubmitting(false);
    }
  }

  const allSelected = members.length > 0 && memberIds.length === members.length;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[71] flex h-[min(720px,94dvh)] w-[calc(100%-1rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-dashboard-border bg-card-1 shadow-2xl outline-none sm:w-[calc(100%-3rem)] motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95"
          onPointerDownOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            headingRef.current?.focus();
          }}
        >
          <aside className="relative hidden w-64 shrink-0 flex-col justify-between overflow-hidden bg-claude p-6 text-white md:flex dark:bg-claude/30">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-lime-bright/25 blur-3xl"
            />
            <div className="relative flex flex-col gap-8">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
                  <Sparkles className="size-4" />
                </span>
                <Dialog.Title className="text-sm font-medium">
                  Guided Use Case
                </Dialog.Title>
              </div>
              <ol className="flex flex-col gap-1">
                {GUIDED_CHAMPION_STAGES.map((stage, index) => {
                  const number = index + 1;
                  const active = number === step;
                  const done = number < step && valid[index];
                  const locked = number > furthest || assignedCount !== null;
                  return (
                    <li key={stage.title}>
                      <button
                        type="button"
                        disabled={locked}
                        aria-current={active ? "step" : undefined}
                        onClick={() => go(number)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition disabled:cursor-not-allowed",
                          active ? "bg-white/15" : "hover:bg-white/10",
                          locked && !active && "opacity-50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                            active || done
                              ? "border-transparent bg-lime-bright text-claude"
                              : "border-white/40",
                          )}
                        >
                          {done ? <Check className="size-3.5" /> : number}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">
                            {stage.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-white/70">
                            {stage.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
            <p className="relative text-xs leading-relaxed text-white/70">
              Anda mengisi langkah 1–3. Setiap anggota lalu membuat workflow AI
              sendiri, mencobanya, dan mengirim hasilnya ke Anda.
            </p>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-dashboard-border px-5 py-3 sm:px-8">
              <p className="text-xs text-muted-foreground">
                <span className="md:hidden">Guided Use Case · </span>
                {assignedCount === null ? `Langkah ${step} dari 4` : "Selesai"}
              </p>
              <Dialog.Description className="sr-only">
                Siapkan langkah 1 sampai 3 guided use case lalu kirim ke anggota
                tim.
              </Dialog.Description>
              <Dialog.Close asChild>
                <ButtonAILN variant="ghost" size="icon" aria-label="Tutup">
                  <X className="size-5" />
                </ButtonAILN>
              </Dialog.Close>
            </header>

            {assignedCount !== null ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <motion.span
                  initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="flex size-16 items-center justify-center rounded-full bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright"
                >
                  <CheckCircle2 className="size-8" />
                </motion.span>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-2xl font-medium tracking-tight focus:outline-none"
                >
                  Terkirim ke {assignedCount} anggota
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Mereka mendapat notifikasi dan langsung mulai dari langkah 4.
                  Hasilnya akan masuk ke antrean review use case Anda.
                </p>
                <ButtonAILN variant="primary" onClick={handleClose}>
                  Selesai
                </ButtonAILN>
              </div>
            ) : (
              <>
                <div
                  ref={scrollRef}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-7 sm:px-8"
                >
                  <motion.section
                    key={step}
                    initial={reducedMotion ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18 }}
                    aria-labelledby="champion-guided-heading"
                  >
                    <div className="mb-6 flex flex-col gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-claude dark:text-lime-bright">
                        {GUIDED_CHAMPION_STAGES[step - 1].title}
                      </p>
                      <h2
                        id="champion-guided-heading"
                        ref={headingRef}
                        tabIndex={-1}
                        className="max-w-lg text-xl font-medium leading-tight tracking-tight focus:outline-none sm:text-2xl"
                      >
                        {GUIDED_CHAMPION_HEADINGS[step - 1]}
                      </h2>
                    </div>

                    {step <= 3 && (
                      <GuidedIntakeAILN
                        step={step}
                        value={intake}
                        onChange={(patch) =>
                          setIntake((previous) => ({ ...previous, ...patch }))
                        }
                        file={null}
                        onFileChange={() => undefined}
                        exampleMode="text"
                        onExampleModeChange={() => undefined}
                        allowFile={false}
                        variant="CHAMPION"
                        headingId="champion-guided-heading"
                      />
                    )}

                    {step === 4 && (
                      <div className="flex flex-col gap-6">
                        <InputAILN
                          inputId="champion-guided-name"
                          inputName="Judul use case"
                          inputType="text"
                          variant="CHAMPION"
                          value={name}
                          onInputChange={setName}
                          characterLength={255}
                          inputPlaceholder="Mis. Rekap laporan penjualan mingguan"
                          required
                        />

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              Kategori{" "}
                              <span className="text-destructive">*</span>
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {categoryIds.length}/2
                            </span>
                          </div>
                          <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                            {categories.map((category) => {
                              const selected = categoryIds.includes(
                                category.id,
                              );
                              return (
                                <ButtonAILN
                                  key={category.id}
                                  size="chip"
                                  variant={selected ? "chipActive" : "chip"}
                                  aria-pressed={selected}
                                  disabled={
                                    !selected && categoryIds.length >= 2
                                  }
                                  onClick={() =>
                                    setCategoryIds((previous) =>
                                      selected
                                        ? previous.filter(
                                            (id) => id !== category.id,
                                          )
                                        : [...previous, category.id],
                                    )
                                  }
                                >
                                  {category.name}
                                </ButtonAILN>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              Anggota{" "}
                              <span className="text-destructive">*</span>
                            </p>
                            {members.length > 0 && (
                              <ButtonAILN
                                variant="textAccent"
                                size="small"
                                onClick={() =>
                                  setMemberIds(
                                    allSelected
                                      ? []
                                      : members.map((m) => m.access_id),
                                  )
                                }
                              >
                                {allSelected ? "Kosongkan" : "Pilih semua"}
                              </ButtonAILN>
                            )}
                          </div>
                          {members.length === 0 ? (
                            <p className="rounded-lg bg-card-2 p-4 text-sm text-muted-foreground">
                              Belum ada anggota di tim Anda.
                            </p>
                          ) : (
                            <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                              {members.map((member) => {
                                const checked = memberIds.includes(
                                  member.access_id,
                                );
                                return (
                                  <label
                                    key={member.access_id}
                                    className={cn(
                                      "flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-sm transition",
                                      checked
                                        ? "border-claude bg-hijau-t/60 dark:border-lime-bright/60 dark:bg-claude/10"
                                        : "border-dashboard-border hover:bg-card-2",
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        setMemberIds((previous) =>
                                          checked
                                            ? previous.filter(
                                                (id) => id !== member.access_id,
                                              )
                                            : [...previous, member.access_id],
                                        )
                                      }
                                      className="sr-only"
                                    />
                                    <MemberAvatar
                                      name={member.user.full_name}
                                      src={member.user.avatar}
                                      checked={checked}
                                    />
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate font-medium">
                                        {member.user.full_name}
                                      </span>
                                      <span className="block truncate text-xs text-muted-foreground">
                                        {member.user.email}
                                      </span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <InputAILN
                            inputId="champion-guided-deadline-date"
                            inputName="Deadline"
                            inputType="date"
                            variant="CHAMPION"
                            value={deadlineDate}
                            onInputChange={setDeadlineDate}
                            required
                          />
                          <InputAILN
                            inputId="champion-guided-deadline-time"
                            inputName="Jam"
                            inputType="time"
                            variant="CHAMPION"
                            value={deadlineTime}
                            onInputChange={setDeadlineTime}
                            required
                          />
                        </div>

                        <TextAreaAILN
                          textAreaId="champion-guided-message"
                          textAreaName="Catatan untuk anggota (opsional)"
                          variant="CHAMPION"
                          value={message}
                          onTextAreaChange={setMessage}
                          textAreaHeight="h-20"
                          characterLength={500}
                          textAreaPlaceholder="Mis. Pakai data minggu lalu, cukup satu cabang."
                        />

                        <div className="rounded-lg border border-dashboard-border bg-card-2 p-4 text-sm">
                          <p className="mb-2 font-medium">
                            Ringkasan langkah 1–3
                          </p>
                          <dl className="grid gap-x-4 gap-y-1 text-muted-foreground sm:grid-cols-[auto_1fr]">
                            <dt>Pekerjaan</dt>
                            <dd className="line-clamp-2 text-foreground">
                              {intake.daily_task}
                            </dd>
                            <dt>Frekuensi</dt>
                            <dd className="text-foreground">
                              {
                                GUIDED_FREQUENCIES.find(
                                  (item) => item.value === intake.frequency,
                                )?.label
                              }
                            </dd>
                            <dt>Durasi sekarang</dt>
                            <dd className="text-foreground">{minutes} menit</dd>
                          </dl>
                        </div>
                      </div>
                    )}
                  </motion.section>
                </div>
                <footer className="shrink-0 border-t border-dashboard-border bg-card-1 px-5 py-4 sm:px-8">
                  <div className="flex items-center justify-between gap-2">
                    <ButtonAILN
                      variant="ghost"
                      disabled={step === 1 || submitting}
                      onClick={() => go(step - 1)}
                    >
                      <ArrowLeft className="size-4" />
                      Kembali
                    </ButtonAILN>
                    <div className="flex items-center gap-2">
                      {!canContinue && (
                        <GuidedHintAILN label="Yang perlu dilengkapi">
                          {REQUIREMENTS[step - 1]}
                        </GuidedHintAILN>
                      )}
                      {step < 4 ? (
                        <ButtonAILN
                          variant="primary"
                          disabled={!canContinue}
                          onClick={() => go(step + 1)}
                        >
                          Lanjut
                          <ArrowRight className="size-4" />
                        </ButtonAILN>
                      ) : (
                        <ButtonAILN
                          variant="primary"
                          disabled={!canContinue || submitting}
                          onClick={() => void submit()}
                        >
                          {submitting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Send className="size-4" />
                          )}
                          {memberIds.length > 0
                            ? `Kirim ke ${memberIds.length} anggota`
                            : "Kirim"}
                        </ButtonAILN>
                      )}
                    </div>
                  </div>
                </footer>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MemberAvatar({
  name,
  src,
  checked,
}: {
  name: string;
  src: string | null;
  checked: boolean;
}) {
  if (checked)
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-claude text-white dark:bg-lime-bright dark:text-claude">
        <Check className="size-4" />
      </span>
    );
  if (src)
    return (
      <Image
        src={src}
        alt=""
        width={32}
        height={32}
        unoptimized
        className="size-8 shrink-0 rounded-full object-cover"
      />
    );
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card-2 text-xs font-medium">
      {initials}
    </span>
  );
}

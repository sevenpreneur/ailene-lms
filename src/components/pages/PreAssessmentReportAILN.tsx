"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import PageContainerSVP from "@/components/pages/PageContainerSVP";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import AppLoadingComponents from "@/components/states/AppLoadingComponents";
import { setSessionToken, trpc } from "@/trpc/client";
import type { AilPreAssessment } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PreAssessmentResultData = Omit<AilPreAssessment, "created_at"> & {
  created_at: string | Date;
};

interface PreAssessmentReportAILNProps {
  sessionToken: string;
}

export default function PreAssessmentReportAILN({
  sessionToken,
}: PreAssessmentReportAILNProps) {
  const router = useRouter();

  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading, isError } = trpc.read.preAssessment.mine.useQuery();

  // Belum mengisi pre-assessment → arahkan ke form-nya.
  useEffect(() => {
    if (data && !data.pre_assessment) {
      router.replace("/student/pre-assessment");
    }
  }, [data, router]);

  if (isLoading || (data && !data.pre_assessment)) {
    return (
      <PageContainerSVP className="flex min-h-screen justify-center">
        <AppLoadingComponents />
      </PageContainerSVP>
    );
  }
  if (isError || !data || !data.pre_assessment) {
    return (
      <PageContainerSVP className="flex min-h-screen justify-center">
        <AppErrorComponents />
      </PageContainerSVP>
    );
  }

  return <PreAssessmentReportContent preAssessment={data.pre_assessment} />;
}

function PreAssessmentReportContent({
  preAssessment,
}: {
  preAssessment: PreAssessmentResultData;
}) {
  const router = useRouter();
  const userQ = trpc.auth.checkSession.useQuery();
  const firstName = userQ.data?.user?.full_name?.split(" ")[0] ?? "teman";

  return (
    <PageContainerSVP className="flex min-h-screen justify-center">
      <div className="flex w-full flex-col gap-6 py-8 lg:py-12">
        <div className="flex items-center justify-between border-b border-emerald-600 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
              A
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              Atlas LMS
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-600" />
              Pre-Assessment selesai
            </span>
          </div>
          <div className="hidden items-center gap-4 text-sm text-gray-500 dark:text-gray-400 md:flex">
            <span>Langkah 3 / 3</span>
            <span className="h-5 w-px bg-gray-200 dark:bg-dashboard-border" />
            <span>Tersimpan - baru saja</span>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Onboarding - selesai
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">
              Terima kasih, {firstName}. Jawabanmu sudah kami simpan.
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
              Pre-assessment bukan ujian dan <b>bukan nilai</b> — ini cara kami
              memahami titik berangkatmu supaya bisa menyiapkan jalur belajar
              yang paling relevan. Kamu bisa langsung mulai belajar sekarang.
            </p>
          </div>

          <section className="rounded-lg border border-dashboard-border bg-white p-6 shadow-sm dark:bg-card-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Yang kamu tulis sendiri
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <QuoteBlock
                label="Yang ingin kamu capai"
                text={preAssessment.training_expectation}
              />
              <QuoteBlock
                label="Tantangan yang kamu rasa"
                text={preAssessment.biggest_challenge}
              />
            </div>
            <p className="mt-5 text-sm text-gray-400 dark:text-gray-500">
              Tujuan ini kami simpan — nanti kami tunjukkan lagi di akhir program
              untuk lihat seberapa jauh kamu sampai.
            </p>
          </section>

          <div className="flex justify-end">
            <ButtonAILN
              variant="champion"
              size="medium"
              onClick={() => router.push("/student/learning-path")}
            >
              Mulai Jalur Belajar
              <ArrowRight className="size-4" />
            </ButtonAILN>
          </div>
        </div>
      </div>
    </PageContainerSVP>
  );
}

function QuoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="border-l-4 border-emerald-700 pl-5">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <p className="mt-3 text-lg italic leading-7 text-gray-900 dark:text-white">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

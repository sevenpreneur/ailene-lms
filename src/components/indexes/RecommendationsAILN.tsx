"use client";
import { trpc } from "@/trpc/client";
import {
  ArrowRight,
  BarChart3,
  FilePenLine,
  Loader2,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type RecItem = {
  id: number;
  title: string;
  description: string;
  category: string | null;
  level_number: number;
};

const cardIcons = [FilePenLine, Target, BarChart3] as const;

function categoryLabelClass(category: string) {
  if (category.trim().toLowerCase() === "human capital") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
  }
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300";
}

export default function RecommendationsAILN() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const q = trpc.ailene.read.recommendations.useQuery();
  const selfAssignM = trpc.ailene.create.selfAssignUseCase.useMutation();
  const [startingId, setStartingId] = useState<number | null>(null);

  const items = q.data?.items ?? [];
  const levelNumber = q.data?.level_number ?? 0;
  const roleLabel = q.data?.role ?? q.data?.department ?? "role Anda";

  const handleStart = (item: RecItem) => {
    setStartingId(item.id);
    selfAssignM.mutate(
      { use_case_id: item.id },
      {
        onSuccess: () => {
          utils.ailene.list.memberUseCaseLibrary.invalidate();
          utils.ailene.list.practiceSubmissions.invalidate();
          router.push(`/student/practice/use-cases/${item.id}`);
        },
        onError: (err) => {
          toast.error("Gagal membuka use case", {
            description: err.message,
          });
        },
        onSettled: () => setStartingId(null),
      }
    );
  };

  if (q.isLoading) {
    return (
      <section className="flex flex-col gap-4">
        <RecommendationHeader
          levelNumber={levelNumber}
          roleLabel={roleLabel}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg border border-dashboard-border bg-card-1"
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-4">
        <RecommendationHeader
          levelNumber={levelNumber}
          roleLabel={roleLabel}
        />
        <div className="rounded-lg border border-dashed border-dashboard-border bg-card-1 px-4 py-10 text-center text-sm text-muted-foreground">
          Semua rekomendasi use case yang tersedia sudah pernah kamu kerjakan.
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <RecommendationHeader levelNumber={levelNumber} roleLabel={roleLabel} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <RecommendationCard
            key={item.id}
            item={item}
            iconIndex={index}
            isStarting={startingId === item.id}
            onStart={() => handleStart(item)}
          />
        ))}
      </div>
    </section>
  );
}

function RecommendationHeader({
  levelNumber,
  roleLabel,
}: {
  levelNumber: number;
  roleLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold leading-tight text-foreground dark:text-white">
          Rekomendasi Use Case untuk Anda
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ide use case dari role ({roleLabel}) + level (L{levelNumber}) - klik
          untuk mencatatnya
        </p>
      </div>
      <Link
        href="/student/practice?tab=library"
        className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 transition hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300"
      >
        Lihat semua
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function RecommendationCard({
  item,
  iconIndex,
  isStarting,
  onStart,
}: {
  item: RecItem;
  iconIndex: number;
  isStarting: boolean;
  onStart: () => void;
}) {
  const Icon = cardIcons[iconIndex % cardIcons.length];
  const category = item.category ?? "Use Case";

  return (
    <article className="flex min-h-72 flex-col rounded-lg border border-dashboard-border bg-card-1 p-5 transition hover:border-red-300 hover:shadow-sm dark:hover:border-red-500/50">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-black dark:bg-white dark:text-black">
          <Icon className="size-5" />
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${categoryLabelClass(category)}`}
        >
          {category}
        </span>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        <h3 className="text-lg font-bold leading-snug text-foreground dark:text-white">
          {item.title}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground line-clamp-3">
          {item.description}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-dashboard-border bg-white px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-card-1 dark:text-gray-300">
          L{item.level_number}
        </span>
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Belum dicatat
        </span>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-bold text-red-600 transition hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:text-red-300"
        onClick={onStart}
        disabled={isStarting}
      >
        {isStarting ? <Loader2 className="size-4 animate-spin" /> : null}
        Catat use case ini
        {!isStarting ? <ArrowRight className="size-4" /> : null}
      </button>
    </article>
  );
}

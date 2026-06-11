"use client";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import { trpc } from "@/trpc/client";
import {
  ArrowRight,
  BarChart3,
  FilePenLine,
  Loader2,
  Megaphone,
  Search,
  UsersRound,
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

function categoryLabelVariant(category: string): GeneralLabelVariantAILN {
  if (category.trim().toLowerCase() === "human capital") {
    return "green";
  }
  return "red";
}

function RecommendationIcon({ item }: { item: RecItem }) {
  const text =
    `${item.category ?? ""} ${item.title} ${item.description}`.toLowerCase();

  if (text.includes("human capital") || text.includes("hr")) {
    return <UsersRound className="size-5" />;
  }
  if (
    text.includes("analytics") ||
    text.includes("analysis") ||
    text.includes("analisis") ||
    text.includes("data") ||
    text.includes("performa")
  ) {
    return <BarChart3 className="size-5" />;
  }
  if (
    text.includes("research") ||
    text.includes("riset") ||
    text.includes("kompetitor")
  ) {
    return <Search className="size-5" />;
  }
  if (
    text.includes("content") ||
    text.includes("marketing") ||
    text.includes("campaign") ||
    text.includes("caption")
  ) {
    return <Megaphone className="size-5" />;
  }
  return <FilePenLine className="size-5" />;
}

export default function RecommendationsAILN() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const q = trpc.read.recommendations.useQuery();
  const selfAssignM = trpc.create.selfAssignUseCase.useMutation();
  const [startingId, setStartingId] = useState<number | null>(null);

  const items = q.data?.items ?? [];
  const levelNumber = q.data?.level_number ?? 0;

  const handleStart = (item: RecItem) => {
    setStartingId(item.id);
    selfAssignM.mutate(
      { use_case_id: item.id },
      {
        onSuccess: () => {
          utils.list.memberUseCaseLibrary.invalidate();
          utils.list.practiceSubmissions.invalidate();
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
      <section className="mt-6 flex flex-col gap-4">
        <RecommendationHeader levelNumber={levelNumber} />
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
      <section className="mt-6 flex flex-col gap-4">
        <RecommendationHeader levelNumber={levelNumber} />
        <div className="rounded-lg border border-dashed border-dashboard-border bg-card-1 px-4 py-10 text-center text-sm text-muted-foreground">
          Semua rekomendasi use case yang tersedia sudah pernah kamu kerjakan.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 flex flex-col gap-4">
      <RecommendationHeader levelNumber={levelNumber} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <RecommendationCard
            key={item.id}
            item={item}
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
}: {
  levelNumber: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-bold text-foreground">
          Rekomendasi Use Case untuk Anda
        </h2>
        <p className="text-sm text-muted-foreground">
          Ide use case dari role kamu di level {levelNumber}
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
  isStarting,
  onStart,
}: {
  item: RecItem;
  isStarting: boolean;
  onStart: () => void;
}) {
  const category = item.category ?? "Use Case";

  return (
    <Link
      href={`/student/practice/use-cases/${item.id}`}
      onClick={(event) => {
        event.preventDefault();
        if (!isStarting) onStart();
      }}
      aria-disabled={isStarting}
      className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <article className="flex h-full min-h-72 flex-col rounded-lg border border-dashboard-border bg-card-1 p-5 transition group-hover:border-red-200 group-hover:bg-red-50/40 dark:group-hover:border-red-500/50 dark:group-hover:bg-red-500/5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-dashboard-border bg-gray-100 text-black dark:bg-white dark:text-black">
            <RecommendationIcon item={item} />
          </span>
          <GeneralLabelAILN variant={categoryLabelVariant(category)}>
            {category}
          </GeneralLabelAILN>
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
          <GeneralLabelAILN variant="white">
            L{item.level_number}
          </GeneralLabelAILN>
          <GeneralLabelAILN variant="yellow">Belum dicatat</GeneralLabelAILN>
        </div>

        <span className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-bold text-red-600 transition group-hover:text-red-700 group-hover:underline dark:text-red-400 dark:group-hover:text-red-300">
          {isStarting ? <Loader2 className="size-4 animate-spin" /> : null}
          Catat use case ini
          {!isStarting ? <ArrowRight className="size-4" /> : null}
        </span>
      </article>
    </Link>
  );
}

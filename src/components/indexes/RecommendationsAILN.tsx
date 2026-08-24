"use client";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import { useProjectId } from "@/lib/use-project-id";
import { getRecommendationsMock } from "@/mock-data/student";
import {
  ArrowRight,
  BarChart3,
  FilePenLine,
  Megaphone,
  Search,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
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
  const data = getRecommendationsMock();
  const items = data.items;
  const levelNumber = data.level_number;

  const handleStart = () => {
    toast.info("Fitur ini sedang dalam migrasi ke backend baru.");
  };

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
          <RecommendationCard key={item.id} item={item} onStart={handleStart} />
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
  const projectId = useProjectId();

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
        href={`/${projectId}/student/skill-practice?tab=library`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-claude transition hover:text-claude/80 hover:underline dark:text-lime-bright dark:hover:text-lime-bright/80"
      >
        Lihat semua
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function RecommendationCard({
  item,
  onStart,
}: {
  item: RecItem;
  onStart: () => void;
}) {
  const category = item.category ?? "Use Case";

  return (
    <Link
      href="#"
      onClick={(event) => {
        event.preventDefault();
        onStart();
      }}
      className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <article className="flex h-full min-h-72 flex-col rounded-lg border border-dashboard-border bg-card-1 p-5 transition group-hover:border-hijau-t group-hover:bg-hijau-t/40 dark:group-hover:border-claude/50 dark:group-hover:bg-claude/5">
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

        <span className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-bold text-claude transition group-hover:text-claude/80 group-hover:underline dark:text-lime-bright dark:group-hover:text-lime-bright/80">
          Catat use case ini
          <ArrowRight className="size-4" />
        </span>
      </article>
    </Link>
  );
}

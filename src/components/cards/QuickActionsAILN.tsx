"use client";

import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import {
  BookOpen,
  ClipboardList,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

export default function QuickActionsAILN() {
  return (
    <SectionContainerAILN
      title="Aksi Cepat"
      desc="Pintasan ke aktivitas yang paling sering kamu pakai."
      className="bg-[#FCFCFD] dark:bg-card-1"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ActionTileAILN
          href="/student/modules"
          icon={BookOpen}
          title="Lanjutkan Belajar"
          desc="Modul & materi level kamu"
        />
        <ActionTileAILN
          href="/student/practice"
          icon={ClipboardList}
          title="Latihan Prompt"
          desc="Skill practice dari Champion"
        />
        <ActionTileAILN
          href="/student/my-progress"
          icon={LineChart}
          title="Lihat Progres"
          desc="Level, streak & kompetensi"
        />
      </div>
    </SectionContainerAILN>
  );
}

function ActionTileAILN({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-lg border border-dashboard-border bg-gray-50/60 p-4 transition hover:border-red-300 hover:bg-white dark:bg-card-2 dark:hover:border-red-500/40"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white text-red-500 shadow-sm dark:bg-card-1 dark:text-red-400">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground dark:text-white">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
          {desc}
        </span>
      </span>
    </Link>
  );
}

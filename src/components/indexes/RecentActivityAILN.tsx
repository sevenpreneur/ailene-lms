"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { trpc } from "@/trpc/client";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ClipboardList,
  Eye,
  FileText,
  Star,
  type LucideIcon,
} from "lucide-react";

dayjs.extend(relativeTime);

type ActivityKind = "submission" | "accepted" | "review" | "assessment";

// Icon + tint per event type. Colors are AILN-aligned semantic tints:
// blue = new submission, emerald = accepted (positive), slate = reviewed,
// violet = assessment milestone.
const KIND_META: Record<
  ActivityKind,
  { icon: LucideIcon; tile: string; icon_color: string }
> = {
  submission: {
    icon: ClipboardList,
    tile: "bg-blue-100 dark:bg-blue-500/15",
    icon_color: "text-blue-600 dark:text-blue-300",
  },
  accepted: {
    icon: Star,
    tile: "bg-emerald-100 dark:bg-emerald-500/15",
    icon_color: "text-emerald-600 dark:text-emerald-300",
  },
  review: {
    icon: Eye,
    tile: "bg-slate-100 dark:bg-slate-500/20",
    icon_color: "text-slate-600 dark:text-slate-300",
  },
  assessment: {
    icon: FileText,
    tile: "bg-violet-100 dark:bg-violet-500/15",
    icon_color: "text-violet-600 dark:text-violet-300",
  },
};

export default function RecentActivityAILN() {
  const q = trpc.read.recentActivity.useQuery();
  const activity = q.data?.activity ?? [];

  return (
    <SectionContainerAILN title="Aktivitas Terkini">
      {q.isLoading ? (
        <ul className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted/60" />
              </div>
            </li>
          ))}
        </ul>
      ) : q.error ? (
        <p className="text-sm text-muted-foreground">Gagal memuat aktivitas.</p>
      ) : activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
      ) : (
        <ul className="-mx-5 -mb-5 divide-y divide-dashboard-border/60">
          {activity.map((item, i) => {
            const meta = KIND_META[item.type as ActivityKind];
            const Icon = meta.icon;
            return (
              <li key={i} className="flex items-start gap-3 px-5 py-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${meta.tile}`}
                >
                  <Icon size={16} className={meta.icon_color} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground">
                    <span className="font-semibold">{item.actor}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>
                    {item.meta && (
                      <span className="text-muted-foreground">
                        {" · "}
                        {item.meta}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {dayjs(item.at).locale("id").fromNow()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionContainerAILN>
  );
}

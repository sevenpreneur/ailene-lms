"use client";

import { trpc } from "@/trpc/client";
import dayjs from "dayjs";
import { Megaphone } from "lucide-react";

export default function AnnouncementTickerAILN() {
  const announcementQ = trpc.read.announcement.useQuery();

  if (announcementQ.isLoading || !announcementQ.data?.announcement) return null;

  const ann = announcementQ.data.announcement;
  const now = dayjs();
  const active =
    ann.status === "ACTIVE" &&
    now.isAfter(dayjs(ann.start_date)) &&
    now.isBefore(dayjs(ann.end_date));
  if (!active) return null;

  const segment = (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex shrink-0 items-center gap-3 px-8">
          <span className="text-sm text-white">{ann.title}</span>
          <span className="text-white/30">&bull;</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex w-full items-stretch overflow-hidden rounded-md bg-black">
      <div className="flex shrink-0 items-center gap-2 bg-black px-4 py-3">
        <Megaphone className="h-4 w-4 text-white" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
          {ann.callout ?? "PENGUMUMAN"}
        </span>
        <span className="ml-1 h-4 w-px bg-white/15" />
      </div>

      <div className="relative flex-1 overflow-hidden py-3">
        <div
          className="flex items-center"
          style={{
            animation: "cat-marquee 60s linear infinite",
            width: "max-content",
          }}
        >
          {segment}
          {segment}
        </div>
      </div>
    </div>
  );
}

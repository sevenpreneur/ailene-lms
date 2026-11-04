"use client";

import type { ChapterVideo } from "@/apis/learnings";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import { getDurationFromSeconds } from "@/lib/date-time-manipulation";
import { httpHref } from "@/lib/utils";
import {
  AudioLines,
  Check,
  ExternalLink,
  MonitorPlay,
  Play,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const YOUTUBE_EMBED_ORIGIN = "https://www.youtube-nocookie.com";

const VIDEO_TYPE_LABEL: Record<ChapterVideo["type"], string> = {
  recording: "Rekaman sesi",
  short: "Video pendek",
};

function youtubeVideoId(raw: string): string | null {
  if (!raw || raw === "#") return null;
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtu.be",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      const id = host.includes("youtu.be")
        ? path.split("/")[1]
        : url.searchParams.get("v") ||
          path.split("/").filter(Boolean).slice(-1)[0];
      if (id && /^[\w-]{11}$/.test(id)) return id;
    }
    return null;
  } catch {
    return null;
  }
}

function formatMinute(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function postToPlayer(player: HTMLIFrameElement | null, message: object) {
  player?.contentWindow?.postMessage(
    JSON.stringify(message),
    YOUTUBE_EMBED_ORIGIN,
  );
}

function VideoOption({
  video,
  typeLabel,
  active,
  done,
  onSelect,
}: {
  video: ChapterVideo;
  typeLabel: string | null;
  active: boolean;
  done: boolean;
  onSelect: () => void;
}) {
  const youtubeId = youtubeVideoId(video.video_url);
  const status = [
    active && "Sedang diputar",
    done ? "Sudah ditonton" : !active && "Belum ditonton",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-card-1 p-2 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-card-2 dark:focus-visible:outline-white ${active ? "border-black ring-1 ring-black dark:border-white dark:ring-white" : "border-dashboard-border hover:border-gray-400 dark:hover:border-gray-500"}`}
    >
      <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
        {youtubeId ? (
          <Image
            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <MonitorPlay className="absolute inset-0 m-auto size-5 text-white/70" />
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-colors duration-200 ${active ? "bg-black/60" : "bg-black/10 group-hover:bg-black/30"}`}
        >
          {active ? (
            <AudioLines className="size-5 text-white" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-black/70 text-white">
              <Play className="size-3.5 fill-current" />
            </span>
          )}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        {typeLabel && (
          <span className="block text-xs text-gray-600 dark:text-gray-400">
            {typeLabel}
          </span>
        )}
        <span className="mt-0.5 line-clamp-2 block text-sm font-medium leading-5 text-gray-950 dark:text-white">
          {video.title}
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          {done && <Check className="size-3.5 shrink-0" />}
          {status}
        </span>
      </span>
    </button>
  );
}

export default function ChapterVideoCardAILN({
  videos,
  durationMinutes,
}: {
  videos: ChapterVideo[];
  durationMinutes: number;
}) {
  const router = useRouter();
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [positions, setPositions] = useState<Record<number, number>>({});
  const [startSeconds, setStartSeconds] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [savingVideoId, setSavingVideoId] = useState<number | null>(null);

  // The recording is the default; the sort is stable, so order_index decides the rest.
  const orderedVideos = useMemo(
    () =>
      [...videos].sort(
        (a, b) =>
          Number(b.type === "recording") - Number(a.type === "recording"),
      ),
    [videos],
  );
  const video =
    orderedVideos.find((item) => item.id === selectedVideoId) ??
    orderedVideos[0];
  const videoId = video.id;
  // "Video pendek" would mislabel a recording still saved with the default type.
  const showTypeLabels = orderedVideos[0].type === "recording";

  const isDone = (item: ChapterVideo) =>
    item.completed || completedIds.has(item.id);
  const youtubeId = youtubeVideoId(video.video_url);
  // Admins can save any HTTP(S) video link; non-YouTube ones open in a new tab.
  const externalVideoUrl = youtubeId ? null : httpHref(video.video_url);
  const currentTime = positions[videoId] ?? 0;
  const timestamps = video.timestamps;
  const activeTimestampIndex = timestamps.reduce(
    (found, timestamp, index) =>
      timestamp.start_seconds <= currentTime ? index : found,
    -1,
  );
  // Minute shortcuts follow the session length, so only a recording can use them.
  const shortcuts =
    video.type === "recording"
      ? Array.from(
          { length: Math.max(0, Math.floor(durationMinutes / 5)) + 1 },
          (_, index) => index * 300,
        )
      : [];
  // Only a click on another video starts playback; the first load stays paused.
  const playerSrc = `${YOUTUBE_EMBED_ORIGIN}/embed/${youtubeId}?enablejsapi=1${selectedVideoId !== null ? "&autoplay=1" : ""}${startSeconds > 0 ? `&start=${startSeconds}` : ""}`;

  const selectVideo = (nextId: number) => {
    if (nextId === videoId) return;
    // Coming back to a video resumes where the learner left it.
    setStartSeconds(Math.floor(positions[nextId] ?? 0));
    setSelectedVideoId(nextId);
  };

  const seekVideo = (seconds: number) => {
    setPositions((previous) => ({ ...previous, [videoId]: seconds }));
    postToPlayer(playerRef.current, {
      event: "command",
      func: "seekTo",
      args: [seconds, true],
    });
    postToPlayer(playerRef.current, {
      event: "command",
      func: "playVideo",
      args: [],
    });
  };

  // The embed reports its playback position once told we are listening.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_EMBED_ORIGIN) return;
      if (event.source !== playerRef.current?.contentWindow) return;
      try {
        const data = JSON.parse(String(event.data));
        const time = data?.info?.currentTime;
        if (data?.event === "infoDelivery" && typeof time === "number") {
          setPositions((previous) => ({ ...previous, [videoId]: time }));
        }
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [videoId]);

  const markComplete = async (target: ChapterVideo) => {
    if (isDone(target) || savingVideoId !== null) return;
    setSavingVideoId(target.id);
    try {
      const response = await fetch("/api/videos/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: target.id }),
      });
      if (!response.ok) throw new Error("Video completion failed");
      setCompletedIds((previous) => new Set(previous).add(target.id));
      toast.success("Video ditandai selesai");
      router.refresh();
    } catch {
      toast.error("Gagal menandai video. Coba lagi.");
    } finally {
      setSavingVideoId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-dashboard-border bg-gray-50 dark:bg-card-1">
      <div className="p-3 sm:p-5">
        <div className="overflow-hidden rounded-lg border border-dashboard-border bg-neutral-900">
          {!youtubeId ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center text-white">
              <MonitorPlay className="size-10 text-white/70" />
              {externalVideoUrl ? (
                <>
                  <p className="font-headline text-lg font-medium">
                    Video diputar di tab baru
                  </p>
                  <ButtonAILN asChild variant="outline" size="small">
                    <a
                      href={externalVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tonton video
                      <ExternalLink className="size-3.5" />
                    </a>
                  </ButtonAILN>
                </>
              ) : (
                <>
                  <p className="font-headline text-lg font-medium">
                    Video YouTube belum tersedia
                  </p>
                  <p className="text-sm text-white/60">
                    Lanjutkan dengan materi chapter di bawah.
                  </p>
                </>
              )}
            </div>
          ) : (
            <iframe
              key={videoId}
              ref={playerRef}
              src={playerSrc}
              onLoad={() =>
                postToPlayer(playerRef.current, {
                  event: "listening",
                  channel: "widget",
                })
              }
              title={video.title}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="aspect-video w-full"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-950 dark:text-white">
              {video.title}
            </p>
            {video.description && (
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {video.description}
              </p>
            )}
          </div>
          {isDone(video) ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-hijau-t px-2.5 py-1 text-xs font-medium text-claude dark:bg-claude/15 dark:text-lime-bright">
              <Check className="size-3.5" />
              Sudah ditonton
            </span>
          ) : (
            (youtubeId || externalVideoUrl) && (
              <ButtonAILN
                variant="outline"
                size="small"
                disabled={savingVideoId !== null}
                onClick={() => void markComplete(video)}
              >
                {savingVideoId === videoId
                  ? "Menyimpan..."
                  : "Tandai sudah ditonton"}
              </ButtonAILN>
            )
          )}
        </div>
      </div>
      {orderedVideos.length > 1 && (
        <div className="border-t border-dashboard-border bg-sb-bg/60 px-3 py-4 sm:px-5">
          <p
            id="chapter-video-options"
            className="mb-3 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-600 dark:text-gray-400"
          >
            Pilih video
          </p>
          <ul
            aria-labelledby="chapter-video-options"
            className="grid gap-2 sm:grid-cols-2"
          >
            {orderedVideos.map((item) => (
              <li key={item.id}>
                <VideoOption
                  video={item}
                  typeLabel={
                    showTypeLabels ? VIDEO_TYPE_LABEL[item.type] : null
                  }
                  active={item.id === videoId}
                  done={isDone(item)}
                  onSelect={() => selectVideo(item.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {youtubeId && (timestamps.length > 0 || shortcuts.length > 0) && (
        <div className="border-t border-dashboard-border bg-sb-bg/60 px-3 py-4 sm:px-5">
          <p className="mb-3 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-600 dark:text-gray-400">
            {timestamps.length
              ? "Lompat ke bagian"
              : "Lompat ke menit · setiap 5 menit"}
          </p>
          {timestamps.length ? (
            <ol className="grid gap-1.5 sm:grid-cols-2">
              {timestamps.map((timestamp, index) => {
                const active = index === activeTimestampIndex;
                return (
                  <li key={timestamp.start_seconds}>
                    <button
                      type="button"
                      onClick={() => seekVideo(timestamp.start_seconds)}
                      aria-current={active ? "true" : undefined}
                      className={`group flex w-full cursor-pointer items-start gap-3 rounded-lg border bg-card-1 px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white ${active ? "border-black dark:border-white" : "border-dashboard-border hover:border-gray-400 dark:hover:border-gray-500"}`}
                    >
                      <span
                        className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium tabular-nums ${active ? "bg-sevenpreneur-coal text-white dark:bg-white dark:text-sevenpreneur-coal" : "bg-sb-bg text-gray-700 dark:text-gray-200"}`}
                      >
                        {getDurationFromSeconds(timestamp.start_seconds)}
                      </span>
                      <span
                        className={`min-w-0 text-sm leading-5 ${active ? "font-medium text-gray-950 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {timestamp.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              {shortcuts.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => seekVideo(seconds)}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white ${Math.floor(currentTime / 300) * 300 === seconds ? "border-sevenpreneur-coal bg-sevenpreneur-coal text-white dark:border-white dark:bg-white dark:text-sevenpreneur-coal" : "border-dashboard-border bg-card-1 text-gray-700 hover:border-gray-400 dark:text-gray-200 dark:hover:border-gray-500"}`}
                >
                  {formatMinute(seconds)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

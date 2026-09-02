"use client";
import { GraduationCap, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const YOUTUBE_VIDEO_ID = "K27diMbCsuw";

export default function HeroHomeAILN() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-b from-hijau-t to-white dark:from-claude/10 dark:to-card-1">
      <div className="grid grid-cols-1 items-center gap-6 p-6 sm:p-10 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-forest-deep shadow-sm dark:bg-card-1 dark:text-lime-bright">
            <GraduationCap size={20} />
          </span>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-forest-deep dark:text-white sm:text-4xl">
            Welcome to Ailene Learn
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-forest-deep/70 dark:text-gray-300 sm:text-base">
            Ailene Learn gives you the skills to design, build, and execute
            AI-powered workflows that drive real results for your team.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-forest-deep/70 dark:text-gray-300 sm:text-base">
            Master the fundamentals of today&apos;s AI tools and learn how to
            apply them across your day-to-day work. Build confidence,
            accelerate your output, and transform the way you work.
          </p>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
          {isPlaying ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1`}
              title="Welcome to Ailene Learn"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Play video"
              className="group relative h-full w-full"
            >
              <Image
                src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
                alt="Welcome to Ailene Learn"
                fill
                unoptimized
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-forest-deep shadow-lg transition-transform group-hover:scale-105">
                <Play size={26} className="ml-1" fill="currentColor" />
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

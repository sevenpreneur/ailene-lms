"use client";
import CompleteLearningButtonAILN from "@/components/buttons/CompleteLearningButtonAILN";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { VideoDetail } from "@/apis/learnings";
import {
  faCalendarDay,
  faCirclePlay,
  faCircleCheck,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

interface VideoDetailsAILNProps {
  video: VideoDetail;
}

export default function VideoDetailsAILN({ video }: VideoDetailsAILNProps) {
  const hasVideoUrl = Boolean(video.video_url && video.video_url !== "#");
  const publishedAt = video.created_at
    ? dayjs(video.created_at).format("D MMMM YYYY")
    : null;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6 py-4">
        <div className="flex flex-col gap-3">
          <PageHeaderAILN
            title={video.title}
            desc={video.description ?? undefined}
          />

          <div className="mt-1 flex flex-wrap items-center gap-2">
            {publishedAt && (
              <GeneralLabelAILN
                variant="white"
                icon={
                  <FontAwesomeIcon
                    icon={faCalendarDay}
                    className="h-3 w-3 text-gray-500 dark:text-gray-400"
                  />
                }
              >
                Terbit: {publishedAt}
              </GeneralLabelAILN>
            )}
            <GeneralLabelAILN
              variant="white"
              icon={
                <FontAwesomeIcon
                  icon={faStar}
                  className="h-3 w-3 text-yellow-500"
                />
              }
            >
              +{video.xp_reward} XP
            </GeneralLabelAILN>

            {video.completed && (
              <GeneralLabelAILN
                variant="green"
                icon={
                  <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                }
              >
                Ditonton
              </GeneralLabelAILN>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashboard-border bg-card-1 px-4 py-16 text-center dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
          <FontAwesomeIcon
            icon={faCirclePlay}
            className="h-12 w-12 text-claude dark:text-lime-bright"
          />
          <CompleteLearningButtonAILN
            kind="videos"
            id={video.id}
            completed={video.completed}
          />
          {hasVideoUrl ? (
            <>
              <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Video ini diputar di tab baru.
              </p>
              <ButtonAILN asChild size="medium">
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tonton Video
                </a>
              </ButtonAILN>
            </>
          ) : (
            <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
              Link video belum tersedia untuk sesi ini.
            </p>
          )}
        </div>
      </div>
    </PageContainerAILN>
  );
}

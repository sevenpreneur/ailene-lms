import { completeVideo, getVideoDetails } from "@/apis/learnings";
import VideoDetailsAILN from "@/components/pages/VideoDetailsAILN";
import AppPageState from "@/components/states/AppPageState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video",
};

export default async function VideoPage({
  params,
}: {
  params: Promise<{ project_id: string; video_id: string }>;
}) {
  const { video_id: videoIdParam } = await params;
  const videoId = Number(videoIdParam);

  if (!Number.isInteger(videoId)) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const result = await getVideoDetails(videoId);
  if (result.kind === "forbidden") {
    return (
      <AppPageState
        variant="FORBIDDEN"
        message={
          result.reason === "level_locked"
            ? "Video ini belum bisa diakses. Selesaikan bagian sebelumnya untuk membukanya."
            : "Kamu belum memiliki akses untuk menonton video ini."
        }
      />
    );
  }
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const completion = await completeVideo(videoId);
  const resolvedVideo = completion
    ? {
        ...result.data,
        completed: completion.completed,
        completed_at: completion.completed_at,
      }
    : result.data;

  return <VideoDetailsAILN video={resolvedVideo} />;
}

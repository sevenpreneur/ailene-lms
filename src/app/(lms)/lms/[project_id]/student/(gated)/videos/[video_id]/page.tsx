import { getVideoDetails } from "@/apis/learnings";
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

  const video = await getVideoDetails(videoId);
  if (!video) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  return <VideoDetailsAILN video={video} />;
}

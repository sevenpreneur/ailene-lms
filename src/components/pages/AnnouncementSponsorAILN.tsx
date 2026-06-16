"use client";

import AnnouncementFormAILN from "@/components/forms/AnnouncementFormAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import SkeletonAnnouncementAILN from "@/components/states/SkeletonAnnouncementAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { setSessionToken, trpc } from "@/trpc/client";
import dayjs from "dayjs";
import { useEffect } from "react";

export default function AnnouncementSponsorAILN({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();
  const announcementQ = trpc.read.announcement.useQuery();
  const announcement = announcementQ.data?.announcement ?? null;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Pengumuman"
          desc="Atur banner pengumuman yang tampil di halaman Hari Ini untuk semua peserta."
        />

        {announcementQ.isLoading ? (
          <SkeletonAnnouncementAILN />
        ) : announcementQ.error ? (
          <AppErrorComponents />
        ) : (
          <AnnouncementFormAILN
            key={
              announcement?.updated_at
                ? dayjs(announcement.updated_at).toISOString()
                : "empty"
            }
            announcement={announcement}
            invalidateAnnouncement={() => utils.read.announcement.invalidate()}
          />
        )}
      </div>
    </PageContainerAILN>
  );
}

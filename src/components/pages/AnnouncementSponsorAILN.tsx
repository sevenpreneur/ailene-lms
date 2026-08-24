"use client";

import AnnouncementFormAILN from "@/components/forms/AnnouncementFormAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { getAnnouncementMock } from "@/mock-data/shared";

export default function AnnouncementSponsorAILN() {
  const announcement = getAnnouncementMock();

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Pengumuman"
          desc="Atur banner pengumuman yang tampil di halaman Hari Ini untuk semua peserta."
        />

        <AnnouncementFormAILN announcement={announcement} />
      </div>
    </PageContainerAILN>
  );
}

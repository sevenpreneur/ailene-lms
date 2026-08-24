"use client";

import DisabledActionButtonAILN from "@/components/buttons/DisabledActionButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import InputAILN from "@/components/fields/InputAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import dayjs from "dayjs";
import { CalendarDays, Megaphone, Save } from "lucide-react";
import { useMemo, useState } from "react";

const MAX_MESSAGE_LENGTH = 500;

export type Announcement = {
  title: string;
  callout: string | null;
  status: string;
  start_date: string | Date | null;
  end_date: string | Date | null;
  updated_at?: string | Date;
};

/**
 * Sponsor announcement editor: message + date range form on the left, live
 * "Hari Ini" banner preview + note on the right.
 */
export default function AnnouncementFormAILN({
  announcement,
}: {
  announcement: Announcement | null;
}) {
  const [message, setMessage] = useState(announcement?.title ?? "");
  const [startDate, setStartDate] = useState(
    announcement ? dayjs(announcement.start_date).format("YYYY-MM-DD") : ""
  );
  const [endDate, setEndDate] = useState(
    announcement ? dayjs(announcement.end_date).format("YYYY-MM-DD") : ""
  );

  const isActive = useMemo(() => {
    if (!announcement) return false;
    const now = dayjs();
    return (
      announcement.status === "ACTIVE" &&
      now.isAfter(dayjs(startDate).startOf("day")) &&
      now.isBefore(dayjs(endDate).endOf("day"))
    );
  }, [announcement, startDate, endDate]);

  const dateRangeLabel = useMemo(() => {
    if (!startDate || !endDate) return "Tanggal belum lengkap";
    return `${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(endDate).format("DD MMM YYYY")}`;
  }, [startDate, endDate]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
      <SectionContainerAILN
        title="Update pengumuman"
        headerRight={<Megaphone className="size-4 text-muted-foreground" />}
        className="dark:shadow-[0_0_16px_rgba(26,122,82,0.06)]"
      >
        <form className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <TextAreaAILN
              textAreaId="announcement-message"
              textAreaName="Isi Pesan"
              textAreaPlaceholder="Tulis pengumuman untuk peserta..."
              textAreaHeight="min-h-40"
              characterLength={MAX_MESSAGE_LENGTH}
              value={message}
              onTextAreaChange={setMessage}
              rows={7}
              required
              variant="SPONSOR"
            />
            <span className="text-right text-xs text-gray-400">
              {message.length} / {MAX_MESSAGE_LENGTH}
            </span>
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <InputAILN
                inputId="announcement-start-date"
                inputName="Start date"
                inputType="date"
                inputIcon={<CalendarDays className="size-4" />}
                value={startDate}
                onInputChange={setStartDate}
                required
                variant="SPONSOR"
              />
            </label>

            <label className="flex flex-col gap-2">
              <InputAILN
                inputId="announcement-end-date"
                inputName="End date"
                inputType="date"
                inputIcon={<CalendarDays className="size-4" />}
                value={endDate}
                onInputChange={setEndDate}
                required
                variant="SPONSOR"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <DisabledActionButtonAILN type="button" variant="primary" size="medium">
              <Save className="size-4" />
              Simpan
            </DisabledActionButtonAILN>
          </div>
        </form>
      </SectionContainerAILN>

      <aside className="flex flex-col gap-4">
        <SectionContainerAILN
          title="Pratinjau di halaman Hari Ini"
          className="dark:shadow-[0_0_16px_rgba(26,122,82,0.06)]"
        >
          <div className="overflow-hidden rounded-md border border-dashboard-border bg-gray-50 dark:bg-dashboard-bg">
            <div className="flex w-full items-stretch overflow-hidden bg-black">
              <div className="flex shrink-0 items-center gap-2 bg-black px-4 py-3">
                <Megaphone className="h-4 w-4 text-white" />
                <GeneralLabelAILN
                  variant="white"
                  className="border-white/15 bg-white/10 text-white"
                >
                  {announcement?.callout ?? "PENGUMUMAN"}
                </GeneralLabelAILN>
                <span className="ml-1 h-4 w-px bg-white/15" />
              </div>
              <div className="flex min-h-11 flex-1 items-center overflow-hidden px-4">
                <span className="line-clamp-1 text-sm leading-5 text-white">
                  {message.trim() || "Pesan pengumuman akan tampil di sini."}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="h-2 w-28 rounded bg-gray-200 dark:bg-dashboard-border" />
              <div className="mt-4 h-20 rounded-md border border-dashboard-border bg-white dark:bg-card-1" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <GeneralLabelAILN variant={isActive ? "green" : "white"}>
              {isActive ? "Aktif" : "Tidak aktif saat ini"}
            </GeneralLabelAILN>
            <GeneralLabelAILN variant="blue">{dateRangeLabel}</GeneralLabelAILN>
          </div>
        </SectionContainerAILN>

        <SectionContainerAILN
          title="Catatan"
          className="dark:shadow-[0_0_16px_rgba(26,122,82,0.06)]"
        >
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
            Form ini hanya mengubah isi pesan, start date, dan end date. Status
            dan label pengumuman tetap mengikuti data yang sudah ada.
          </p>
        </SectionContainerAILN>
      </aside>
    </div>
  );
}

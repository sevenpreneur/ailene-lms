import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/id";

dayjs.locale("id");
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

export function formatChapterSessionDate(
  value: string,
  format = "D MMM YYYY · HH:mm [WIB]"
): string {
  const session = dayjs.utc(value).tz("Asia/Jakarta");
  return session.isValid()
    ? session.locale("id").format(format)
    : "Belum dijadwalkan";
}

export function formatChapterDuration(minutes: number): string {
  const sessionDuration = dayjs.duration(minutes, "minutes");
  const hours = Math.floor(sessionDuration.asHours());
  const remainingMinutes = sessionDuration.minutes();
  if (hours === 0) return `${remainingMinutes} menit`;
  return remainingMinutes === 0
    ? `${hours} jam`
    : `${hours} jam ${remainingMinutes} menit`;
}

// Format 04:28:21
export function getDurationFromSeconds(seconds: number): string {
  const dur = dayjs.duration(seconds, "seconds");
  const hours = dur.hours().toString().padStart(2, "0");
  const minutes = dur.minutes().toString().padStart(2, "0");
  const secs = dur.seconds().toString().padStart(2, "0");

  if (dur.asHours() >= 1) {
    return `${hours}:${minutes}:${secs}`;
  } else {
    return `${minutes}:${secs}`;
  }
}

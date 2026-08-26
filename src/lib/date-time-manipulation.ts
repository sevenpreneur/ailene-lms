import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/id";

dayjs.locale("id");
dayjs.extend(duration);

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

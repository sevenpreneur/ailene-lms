import type { UseCaseFrequency, UseCaseType } from "@/apis/use-cases";

export const GUIDED_HEADINGS = [
  "Apa pekerjaan yang paling menyita waktumu?",
  "Tunjukkan contohnya.",
  "Bagaimana prosesmu saat ini?",
  "Saran Workflow",
  "Coba di pekerjaanmu.",
  "Bagaimana hasilnya?",
] as const;

export const GUIDED_STAGES = [
  {
    title: "Pekerjaan harian",
    description: "Mulai dari pekerjaan yang paling menyita waktumu.",
  },
  {
    title: "Kirim contoh",
    description: "Pakai contoh nyata yang sudah disamarkan.",
  },
  {
    title: "Proses sekarang",
    description: "Ceritakan caramu menyelesaikan pekerjaan ini.",
  },
  {
    title: "Saran Workflow",
    description: "Temukan workflow yang bisa langsung kamu coba.",
  },
  {
    title: "Coba & centang",
    description: "Jalankan di pekerjaanmu, lalu cek hasil setiap langkah.",
  },
  {
    title: "Bukti & cerita",
    description: "Tunjukkan hasilnya dan ceritakan pengalamanmu.",
  },
] as const;

export const GUIDED_FREQUENCIES: { value: UseCaseFrequency; label: string }[] =
  [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
    { value: "occasionally", label: "Sesekali" },
  ];

export const GUIDED_TYPES: { value: UseCaseType; label: string }[] = [
  { value: "workflow_automation", label: "Otomatisasi alur kerja" },
  { value: "content_creation", label: "Pembuatan konten" },
  { value: "data_analysis", label: "Analisis data" },
  { value: "research", label: "Riset" },
  { value: "communication", label: "Komunikasi" },
  { value: "decision_support", label: "Pendukung keputusan" },
  { value: "learning", label: "Pembelajaran" },
  { value: "other", label: "Lainnya" },
];

// Champion-facing headings for the same first three steps.
export const GUIDED_CHAMPION_HEADINGS = [
  "Pekerjaan apa yang ingin dibantu AI?",
  "Berikan contoh nyatanya.",
  "Bagaimana prosesnya sekarang?",
  "Kirim ke siapa?",
] as const;

export const GUIDED_CHAMPION_STAGES = [
  { title: "Pekerjaan", description: "Tugas rutin yang ingin dipercepat." },
  { title: "Contoh", description: "Contoh data yang sudah disamarkan." },
  { title: "Proses", description: "Langkah dan durasi saat ini." },
  { title: "Assign", description: "Judul, anggota, dan deadline." },
] as const;

export function isGuidedProofLink(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") && !!url.hostname
    );
  } catch {
    return false;
  }
}

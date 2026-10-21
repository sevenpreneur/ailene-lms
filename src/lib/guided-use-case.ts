import type { UseCaseFrequency, UseCaseType } from "@/apis/use-cases";

export const GUIDED_HEADINGS = [
  "Apa pekerjaan yang paling menyita waktumu?",
  "Tunjukkan contohnya.",
  "Bagaimana prosesmu saat ini?",
  "Workflow yang bisa kamu coba.",
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
    title: "Langkah AI",
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

export const GUIDED_TASK_EXAMPLES = [
  {
    label: "Laporan",
    text: "Saya merekap laporan penjualan mingguan dari beberapa cabang, memeriksa total, lalu menulis ringkasan untuk atasan.",
  },
  {
    label: "Email",
    text: "Saya membalas email komplain pelanggan, mencari konteks masalahnya, lalu menyusun jawaban yang jelas dan sopan.",
  },
  {
    label: "Notulen",
    text: "Saya membuat notulen meeting dari catatan diskusi, merangkum keputusan, dan menyusun daftar tindak lanjut untuk tim.",
  },
  {
    label: "Presentasi",
    text: "Saya menyusun materi presentasi dari beberapa dokumen, memilih informasi utama, lalu membuat alur cerita untuk setiap slide.",
  },
  {
    label: "Excel",
    text: "Saya memeriksa dan merapikan data di Excel, menyamakan format, mencari data ganda, dan menandai kolom yang belum lengkap.",
  },
] as const;

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

// A fixed, explicitly labelled example for the "Coba isian contoh" shortcut.
export const GUIDED_SAMPLE_INTAKE = {
  daily_task:
    "Saya merekap laporan penjualan mingguan dari beberapa cabang, memeriksa total, lalu menulis ringkasan untuk atasan.",
  frequency: "weekly",
  example_text:
    "Contoh data fiktif (juta rupiah):\nCabang A: target 50, realisasi 45\nCabang B: target 40, realisasi 44\nCabang C: target 30, realisasi 27",
  minutes_without_ai: 90,
  current_process:
    "1. Kumpulkan laporan dari setiap cabang.\n2. Rapikan format dan cek total di Excel.\n3. Bandingkan realisasi dengan target.\n4. Tulis ringkasan dan tindak lanjut untuk atasan.",
  current_tools: ["Excel", "Email"],
  pain_point: "Menyatukan format laporan dan menulis ringkasan yang tetap akurat.",
} as const;

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

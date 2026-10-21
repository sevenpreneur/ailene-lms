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

export const GUIDED_MOCK_REASON =
  "Belum tersedia di pratinjau. Data tidak disimpan atau dikirim.";

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

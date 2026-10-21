import { LEVELS, PILLAR_DEFS, levelByNumber } from "./shared";
import { daysAgo, relativeDayStrip, round1 } from "./utils";
import type { GuidedSession } from "@/apis/use-cases";
import dayjs from "dayjs";

const CURRENT_LEVEL_NUMBER = 3;
const CURRENT_XP = 1050;

// A fixed, explicitly labelled example, never an AI response to the student's input.
export function getGuidedUseCaseMock(useCaseId: number): GuidedSession {
  return {
    id: 1,
    use_case_id: useCaseId,
    status: "steps_ready",
    current_step: 4,
    daily_task:
      "Saya merekap laporan penjualan mingguan dari beberapa cabang, memeriksa total, lalu menulis ringkasan untuk atasan.",
    frequency: "weekly",
    example_text:
      "Contoh data fiktif (juta rupiah):\nCabang A: target 50, realisasi 45\nCabang B: target 40, realisasi 44\nCabang C: target 30, realisasi 27",
    example_file_url: null,
    sensitive_data_confirmed: false,
    minutes_without_ai: 90,
    current_process:
      "1. Kumpulkan laporan dari setiap cabang.\n2. Rapikan format dan cek total di Excel.\n3. Bandingkan realisasi dengan target.\n4. Tulis ringkasan dan tindak lanjut untuk atasan.",
    current_tools: ["Excel", "Email"],
    pain_point:
      "Menyatukan format laporan dan menulis ringkasan yang tetap akurat.",
    estimated_minutes_with_ai: 35,
    risks: [
      "Gunakan data fiktif atau data yang sudah disamarkan. Ikuti kebijakan penggunaan AI di perusahaanmu.",
      "AI bisa keliru membaca angka dan menyimpulkan penyebab. Cocokkan kembali dengan sumber sebelum membagikan laporan.",
    ],
    regenerate_remaining: 3,
    created_at: dayjs(daysAgo(1)).toISOString(),
    updated_at: dayjs(daysAgo(1)).toISOString(),
    steps: [
      {
        id: 1,
        order: 1,
        title: "Siapkan data yang aman",
        suggested_tool: "Manual",
        instruction:
          "Salin data yang diperlukan ke lembar kerja terpisah. Ganti nama cabang, pelanggan, dan identitas lain dengan label anonim. Hapus informasi rahasia.",
        prompt_template: "",
        estimated_minutes: 10,
        verification:
          "Pastikan tidak ada identitas pribadi atau data rahasia. Cocokkan angka dengan sumber aslinya.",
        is_done: false,
        skipped_reason: null,
        note: null,
        done_at: null,
      },
      {
        id: 2,
        order: 2,
        title: "Susun draf ringkasan dengan AI",
        suggested_tool: "ChatGPT",
        instruction:
          "Tempel data yang sudah disamarkan. Minta AI merangkum capaian dan menandai informasi yang masih perlu dicek.",
        prompt_template:
          "Kamu adalah asisten analis penjualan. Bantu saya menyusun ringkasan mingguan untuk atasan berdasarkan data fiktif atau tersamarkan berikut:\n[DATA PENJUALAN YANG SUDAH DISAMARKAN]\n\nBuat tabel target dan realisasi per cabang, 3 poin temuan, serta usulan tindak lanjut. Gunakan hanya data yang tersedia. Jangan mengarang angka atau penyebab. Tandai asumsi dan data yang belum lengkap. Tulis dalam Bahasa Indonesia yang ringkas.",
        estimated_minutes: 10,
        verification:
          "Cek setiap angka dan nama kolom. Pastikan temuan tidak menyebut penyebab yang belum didukung data.",
        is_done: false,
        skipped_reason: null,
        note: null,
        done_at: null,
      },
      {
        id: 3,
        order: 3,
        title: "Verifikasi angka dan temuan",
        suggested_tool: "Excel",
        instruction:
          "Bandingkan tabel dan ringkasan AI dengan lembar sumber. Koreksi selisih dan hapus kesimpulan yang belum punya bukti.",
        prompt_template: "",
        estimated_minutes: 10,
        verification:
          "Total dan realisasi per cabang sesuai sumber. Setiap temuan memiliki data pendukung yang bisa ditelusuri.",
        is_done: false,
        skipped_reason: null,
        note: null,
        done_at: null,
      },
      {
        id: 4,
        order: 4,
        title: "Rapikan laporan untuk dibagikan",
        suggested_tool: "ChatGPT",
        instruction:
          "Gunakan ringkasan yang sudah diverifikasi untuk menyiapkan draf email. Periksa sekali lagi sebelum mengirim lewat email kantor.",
        prompt_template:
          "Kamu adalah asisten komunikasi bisnis. Ubah ringkasan terverifikasi ini menjadi draf email laporan mingguan untuk atasan:\n[RINGKASAN YANG SUDAH DIVERIFIKASI]\n\nFormat: subjek, pembuka singkat, 3 temuan utama, dan tindak lanjut. Maksimal 200 kata. Pertahankan angka persis seperti sumber. Jangan menambah klaim, penerima, atau informasi baru.",
        estimated_minutes: 5,
        verification:
          "Baca ulang draf, pastikan angka benar, bahasa sesuai, dan penerima berwenang melihat laporan.",
        is_done: false,
        skipped_reason: null,
        note: null,
        done_at: null,
      },
    ],
  };
}

export function getLevelProgressMock() {
  const nextLevel = levelByNumber(Math.min(4, CURRENT_LEVEL_NUMBER + 1));
  return {
    total_xp: CURRENT_XP,
    max_min_xp: LEVELS[LEVELS.length - 1].min_xp,
    levels: LEVELS,
    current_level_number: CURRENT_LEVEL_NUMBER,
    tasks_required: 3,
    tasks_done: CURRENT_XP >= nextLevel.min_xp ? 3 : 2,
    next_level_unlockable: CURRENT_XP >= nextLevel.min_xp,
  };
}

export function getCompetencyProfileMock() {
  const dimensions = PILLAR_DEFS.map((p, i) => ({
    key: p.key,
    name: p.name,
    score: Math.min(5, round1(2.6 + (i % 3) * 0.4)),
  }));
  const avg = round1(
    dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length,
  );
  return {
    dimensions,
    avg,
    current_level_number: CURRENT_LEVEL_NUMBER,
    target_level_number: CURRENT_LEVEL_NUMBER + 1,
    tier_number: 2,
    tier_name: "Practitioner",
    next_tier: { number: 3, name: "Expert", avg_needed: 4 },
  };
}

export function getFirstWinMock() {
  return {
    first_win: {
      kind: "use_case" as const,
      name: "Otomatisasi Laporan Mingguan",
      hours_with_ai: 2,
      hours_without_ai: 6,
      submitted_at: daysAgo(20),
    },
  };
}

export function getStreakMock() {
  const pattern = [true, true, false, true, true, true, true];
  return {
    from: relativeDayStrip(pattern)[0].date,
    to: relativeDayStrip(pattern)[pattern.length - 1].date,
    days: relativeDayStrip(pattern).map((d) => ({
      date: d.date,
      count: d.value ? 1 : 0,
    })),
    current_streak: 4,
  };
}

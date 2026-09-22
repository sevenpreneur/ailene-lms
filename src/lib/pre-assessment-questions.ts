// Pre-assessment questions; `valueCodes` lines up with `options` and holds the enum literal sent to the server.

export type PreAssessmentCategory =
  | "Profil Dasar"
  | "Literasi AI"
  | "Penggunaan di Pekerjaan"
  | "Kemampuan Prompting"
  | "Keamanan & Etika"
  | "Refleksi"
  | "Ekspektasi Pelatihan";

export type PreAssessmentQuestionType = "single" | "multi" | "short" | "long";

interface BaseQuestion {
  id: number;
  field: string;
  category: PreAssessmentCategory;
  question: string;
  required: boolean;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: "single";
  options: string[];
  valueCodes: string[];
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: "multi";
  options: string[];
}

export interface ShortTextQuestion extends BaseQuestion {
  type: "short";
  placeholder: string;
}

export interface LongTextQuestion extends BaseQuestion {
  type: "long";
  placeholder: string;
}

export type PreAssessmentQuestion =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | ShortTextQuestion
  | LongTextQuestion;

// Reusable 5-point frequency scale (single-choice).
const FREQ_OPTIONS = ["Tidak pernah", "Jarang", "Kadang", "Sering", "Selalu"];
const FREQ_CODES = ["never", "rarely", "sometimes", "often", "always"];

export const PRE_ASSESSMENT_QUESTIONS: PreAssessmentQuestion[] = [
  {
    id: 1,
    field: "ai_use_frequency",
    type: "single",
    category: "Profil Dasar",
    required: true,
    question:
      "Seberapa sering kamu menggunakan alat bantu AI (seperti ChatGPT, Copilot, Gemini, dll.) dalam pekerjaan sehari-hari?",
    options: [
      "Belum pernah sama sekali",
      "Pernah mencoba, tapi tidak rutin",
      "1–2 kali seminggu",
      "Hampir setiap hari",
      "Beberapa kali dalam sehari",
    ],
    valueCodes: ["never", "tried", "weekly", "daily", "intensive"],
  },
  {
    id: 2,
    field: "ai_tools_used",
    type: "multi",
    category: "Profil Dasar",
    required: true,
    question:
      "Alat AI mana saja yang pernah kamu gunakan? (Pilih semua yang pernah dipakai)",
    options: [
      "ChatGPT (OpenAI)",
      "Copilot (Microsoft)",
      "Gemini (Google)",
      "Claude (Anthropic)",
      "Perplexity AI",
      "Midjourney / DALL·E / image generator",
      "GitHub Copilot (coding)",
      "Belum pernah menggunakan satupun",
    ],
  },
  {
    id: 3,
    field: "ai_limitations",
    type: "multi",
    category: "Literasi AI",
    required: true,
    question:
      "Menurut kamu, apa saja keterbatasan AI yang kamu ketahui? (Pilih semua yang kamu tahu)",
    options: [
      "AI bisa memberikan informasi yang salah (hallucination)",
      "AI tidak bisa mengakses data real-time (kecuali ada tool khusus)",
      "AI tidak memiliki pemahaman konteks panjang dengan sempurna",
      "AI bisa bias tergantung data pelatihannya",
      "AI tidak bisa berpikir kreatif seperti manusia",
      "AI tidak punya kesadaran atau perasaan",
      "Saya belum tahu keterbatasan spesifiknya",
    ],
  },
  {
    id: 4,
    field: "output_review",
    type: "single",
    category: "Literasi AI",
    required: true,
    question:
      "Ketika AI menghasilkan sebuah jawaban atau konten, apa yang biasanya kamu lakukan?",
    options: [
      "Langsung pakai tanpa diperiksa",
      "Kadang saya cek, kadang tidak",
      "Selalu saya review dulu sebelum dipakai",
      "Saya cross-check dengan sumber lain sebelum menggunakan",
      "Saya belum pernah menggunakan output AI",
    ],
    valueCodes: ["no_check", "sometimes", "always", "cross_check", "no_use"],
  },
  {
    id: 5,
    field: "use_cases",
    type: "multi",
    category: "Penggunaan di Pekerjaan",
    required: true,
    question:
      "Untuk keperluan apa kamu (atau ingin) memanfaatkan AI dalam pekerjaan? (Pilih semua yang relevan)",
    options: [
      "Menulis email, laporan, atau dokumen",
      "Meringkas konten panjang (artikel, notulen, laporan)",
      "Riset dan pengumpulan informasi",
      "Membuat presentasi atau visual",
      "Analisis data dan insight",
      "Coding / debugging / otomasi",
      "Brainstorming dan ideasi",
      "Layanan pelanggan / customer support",
      "Pemasaran dan pembuatan konten",
    ],
  },
  {
    id: 6,
    field: "team_adoption",
    type: "single",
    category: "Penggunaan di Pekerjaan",
    required: true,
    question: "Bagaimana kondisi adopsi AI di tim atau departemen kamu saat ini?",
    options: [
      "Tim kami belum menggunakan AI sama sekali",
      "Beberapa orang mencoba secara personal, tapi tidak terstruktur",
      "Ada inisiatif kecil, tapi belum ada panduan resmi",
      "Ada kebijakan dan tools AI yang sudah disetujui kantor",
      "Tim kami sudah rutin mengintegrasikan AI dalam workflow",
    ],
    valueCodes: ["none", "personal", "pilot", "policy", "integrated"],
  },
  {
    id: 7,
    field: "concrete_example",
    type: "short",
    category: "Penggunaan di Pekerjaan",
    required: false,
    question:
      "Jika pernah menggunakan AI untuk pekerjaan, sebutkan satu contoh konkret penggunaan yang paling berkesan atau paling membantu.",
    placeholder:
      "Contoh: Saya pakai ChatGPT untuk draft proposal klien dalam 10 menit…",
  },
  {
    id: 8,
    field: "model_selection",
    type: "single",
    category: "Penggunaan di Pekerjaan",
    required: true,
    question:
      "Seberapa sering kamu memilih model/tool AI tertentu secara sadar sesuai tugasnya (mis. model reasoning untuk analisis, model cepat untuk draft)?",
    options: FREQ_OPTIONS,
    valueCodes: FREQ_CODES,
  },
  {
    id: 9,
    field: "multimodal_use",
    type: "single",
    category: "Penggunaan di Pekerjaan",
    required: true,
    question:
      "Seberapa sering kamu pakai AI di luar teks/chat — misalnya untuk gambar, suara, video, atau code?",
    options: FREQ_OPTIONS,
    valueCodes: FREQ_CODES,
  },
  {
    id: 10,
    field: "workflow_reuse",
    type: "single",
    category: "Penggunaan di Pekerjaan",
    required: true,
    question:
      "Seberapa sering kamu membuat & menyimpan workflow/template/automation AI yang kamu pakai ulang lintas tugas?",
    options: FREQ_OPTIONS,
    valueCodes: FREQ_CODES,
  },
  {
    id: 11,
    field: "prompt_comfort",
    type: "single",
    category: "Kemampuan Prompting",
    required: true,
    question:
      "Seberapa nyaman kamu dalam menulis prompt (instruksi) ke AI agar hasilnya sesuai yang diinginkan?",
    options: [
      "Tidak tahu cara menulis prompt yang baik",
      "Cukup tahu cara dasar bertanya, tapi hasilnya sering kurang tepat",
      "Bisa menulis prompt yang cukup jelas dan hasilnya lumayan",
      "Terbiasa menggunakan teknik seperti konteks, persona, atau format output",
      "Mahir — bisa membuat prompt kompleks dengan hasil yang konsisten",
    ],
    valueCodes: ["none", "basic", "decent", "structured", "expert"],
  },
  {
    id: 12,
    field: "prompt_iteration",
    type: "single",
    category: "Kemampuan Prompting",
    required: true,
    question:
      "Seberapa sering kamu mengiterasi/memperbaiki prompt beberapa kali demi hasil lebih baik, bukan menerima jawaban pertama?",
    options: FREQ_OPTIONS,
    valueCodes: FREQ_CODES,
  },
  {
    id: 13,
    field: "refine_scenario",
    type: "single",
    category: "Kemampuan Prompting",
    required: true,
    question:
      "Hasil AI sudah 80% bagus, strukturnya oke, tapi satu paragraf nadanya terlalu formal dan kaku. Apa yang kamu lakukan?",
    options: [
      "Tunjuk paragraf itu, minta AI tulis ulang bagian itu saja dengan nada lebih natural, di thread yang sama.",
      "Pindah ke tool AI lain yang katanya lebih kuat di tulisan kreatif, lalu tempel ulang seluruh konteks dan instruksinya supaya bisa mulai mengerjakan dari sana.",
      "Buka paragrafnya, baca ulang kalimat per kalimat, lalu rapikan sendiri frasa yang kaku itu secara manual sampai nadanya pas — tanpa repot menjelaskan ke AI.",
      "Buang hasil yang ada, lalu minta AI menyusun ulang seluruh dokumen dari nol pakai brief nada yang lebih panjang dan rinci supaya hasilnya lebih konsisten dari awal sampai akhir.",
    ],
    valueCodes: ["targeted", "switch_tool", "manual", "restart"],
  },
  {
    id: 14,
    field: "professional_attitude",
    type: "single",
    category: "Keamanan & Etika",
    required: true,
    question:
      "Manakah yang paling mendekati sikap kamu terhadap penggunaan AI dalam konteks profesional?",
    options: [
      "AI terlalu berisiko, sebaiknya dihindari di pekerjaan",
      "Berguna, tapi perlu hati-hati dan ada batasannya",
      "Netral — tergantung kasusnya",
      "Sangat mendukung, asal ada panduan yang jelas",
      "AI adalah keharusan — yang tidak pakai akan tertinggal",
    ],
    valueCodes: ["too_risky", "cautious", "neutral", "supportive", "essential"],
  },
  {
    id: 15,
    field: "data_safety_check",
    type: "single",
    category: "Keamanan & Etika",
    required: true,
    question:
      "Seberapa sering kamu mengecek dulu data apa yang aman dimasukkan ke AI (info klien, data pribadi, rahasia perusahaan)?",
    options: FREQ_OPTIONS,
    valueCodes: FREQ_CODES,
  },
  {
    id: 16,
    field: "publish_unchecked",
    type: "single",
    category: "Keamanan & Etika",
    required: true,
    question:
      "Seberapa sering kamu mempublikasikan karya hasil AI tanpa cek hak cipta atau tanpa menyebut bantuan AI?",
    options: FREQ_OPTIONS,
    valueCodes: FREQ_CODES,
  },
  {
    id: 17,
    field: "biggest_challenge",
    type: "long",
    category: "Refleksi",
    required: true,
    question:
      "Apa tantangan terbesar yang kamu hadapi (atau bayangkan akan kamu hadapi) dalam mengadopsi AI untuk pekerjaan sehari-hari?",
    placeholder:
      "Tuliskan dengan bebas. Contoh: Tidak tahu dari mana harus mulai, takut salah, hasil AI kurang akurat untuk kebutuhan saya, tidak ada tools yang approved, dll…",
  },
  {
    id: 18,
    field: "training_expectation",
    type: "long",
    category: "Ekspektasi Pelatihan",
    required: true,
    question:
      "Setelah mengikuti pelatihan AI ini, kemampuan atau pengetahuan apa yang paling ingin kamu dapatkan? Ceritakan secara spesifik.",
    placeholder:
      "Contoh: Saya ingin bisa menggunakan AI untuk menghemat waktu dalam membuat laporan bulanan, atau saya ingin memahami cara memilih tools AI yang tepat untuk tim saya…",
  },
  {
    id: 19,
    field: "motivation",
    type: "single",
    category: "Ekspektasi Pelatihan",
    required: true,
    question:
      "Seberapa besar motivasi kamu untuk belajar dan menerapkan AI dalam pekerjaan setelah mengikuti pelatihan ini?",
    options: [
      "Rendah — saya ikut karena diwajibkan saja",
      "Cukup — mau coba kalau mudah dipahami",
      "Sedang — saya tertarik tapi butuh contoh nyata dulu",
      "Tinggi — saya siap langsung mencoba setelah pelatihan",
      "Sangat tinggi — saya sudah tidak sabar untuk mulai!",
    ],
    valueCodes: ["mandatory", "curious", "tentative", "ready", "eager"],
  },
];

export const PRE_ASSESSMENT_CATEGORY_COLORS: Record<
  PreAssessmentCategory,
  string
> = {
  "Profil Dasar":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 dark:border dark:border-amber-500/40",
  "Literasi AI":
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 dark:border dark:border-blue-500/40",
  "Penggunaan di Pekerjaan":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border dark:border-emerald-500/40",
  "Kemampuan Prompting":
    "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 dark:border dark:border-violet-500/40",
  "Keamanan & Etika":
    "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300 dark:border dark:border-red-500/40",
  "Refleksi":
    "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300 dark:border dark:border-pink-500/40",
  "Ekspektasi Pelatihan":
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border dark:border-cyan-500/40",
};

export const PRE_ASSESSMENT_TYPE_LABELS: Record<
  PreAssessmentQuestionType,
  string
> = {
  single: "Pilih Satu",
  multi: "Pilih Banyak",
  short: "Isian Singkat",
  long: "Isian Panjang",
};

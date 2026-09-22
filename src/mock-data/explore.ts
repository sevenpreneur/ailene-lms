// Explore/discovery catalog for the Home page — mocked, no backend for this yet.

export type ExploreLevel = "Beginner" | "Intermediate" | "Advanced";

export type ExploreVendorMock = {
  id: string;
  name: string;
  logo?: string;
};

export const EXPLORE_VENDORS: ExploreVendorMock[] = [
  { id: "agentops", name: "AgentOps" },
  { id: "airops", name: "AirOps" },
  { id: "anthropic", name: "Anthropic", logo: "/images/logo-anthropic.svg" },
  { id: "cohere", name: "Cohere", logo: "/images/logo-cohere.png" },
  { id: "groq", name: "Groq", logo: "/images/logo-groq.webp" },
  { id: "gumloop", name: "Gumloop", logo: "/images/logo-gumloop.jpg" },
  { id: "lindyai", name: "Lindy AI", logo: "/images/logo-lindyai.webp" },
  { id: "lovable", name: "Lovable", logo: "/images/logo-lovable.webp" },
  { id: "manus", name: "Manus", logo: "/images/manus-icon.webp" },
  { id: "microsoft", name: "Microsoft", logo: "/images/logo-microsoft.webp" },
  { id: "openai", name: "OpenAI", logo: "/images/logo-openai.png" },
];

export type ExploreCourseMock = {
  id: string;
  title: string;
  image: string;
  vendorId: string;
  action: string;
  level: ExploreLevel;
  duration: string;
  points: number;
};

export const EXPLORE_COURSES: ExploreCourseMock[] = [
  {
    id: "manus-team",
    title: "Working in Manus as a Team",
    image: "/images/hero-manus-banner.jpg",
    vendorId: "manus",
    action: "Continue",
    level: "Advanced",
    duration: "2 hrs",
    points: 100,
  },
  {
    id: "manus-admins",
    title: "Manus Team Plan for Admins",
    image: "/images/hero-manus-banner.jpg",
    vendorId: "manus",
    action: "Start",
    level: "Advanced",
    duration: "2 hrs",
    points: 80,
  },
  {
    id: "claude-cowork",
    title: "Advanced Claude Cowork",
    image: "/images/claude-cowork.webp",
    vendorId: "anthropic",
    action: "Start",
    level: "Advanced",
    duration: "2 hrs",
    points: 140,
  },
  {
    id: "claude-chat",
    title: "Advanced Claude Chat",
    image: "/images/claude-chat.webp",
    vendorId: "anthropic",
    action: "Start",
    level: "Advanced",
    duration: "2 hrs",
    points: 100,
  },
  {
    id: "m365-enterprise",
    title: "Microsoft 365 for Enterprise",
    image: "/images/m365-course.avif",
    vendorId: "microsoft",
    action: "Enroll",
    level: "Intermediate",
    duration: "90 min",
    points: 90,
  },
  {
    id: "chatgpt-research",
    title: "ChatGPT for Research & Writing",
    image: "/images/chatgpt-course.webp",
    vendorId: "openai",
    action: "Start",
    level: "Beginner",
    duration: "60 min",
    points: 80,
  },
  {
    id: "team-collaboration",
    title: "AI-Powered Team Collaboration",
    image: "/images/course-team-collaboration.webp",
    vendorId: "lindyai",
    action: "Start",
    level: "Intermediate",
    duration: "75 min",
    points: 90,
  },
  {
    id: "coding-agents",
    title: "Shipping with Coding Agents",
    image: "/images/course-coding-agents.png",
    vendorId: "cohere",
    action: "Start",
    level: "Advanced",
    duration: "3 hrs",
    points: 160,
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering Essentials",
    image: "/images/course-typing.png",
    vendorId: "groq",
    action: "Start",
    level: "Beginner",
    duration: "45 min",
    points: 60,
  },
  {
    id: "hybrid-teams",
    title: "Leading Hybrid Teams with AI",
    image: "/images/team-office.webp",
    vendorId: "gumloop",
    action: "Enroll",
    level: "Intermediate",
    duration: "70 min",
    points: 85,
  },
];

export function getExploreVendorsMock(): ExploreVendorMock[] {
  return EXPLORE_VENDORS;
}

export function getExploreCoursesMock(): ExploreCourseMock[] {
  return EXPLORE_COURSES;
}

// Programs you're not enrolled in yet — links to a read-only details page.
export type ProgramChapterMock = {
  id: string;
  label: string;
  start: number;
  end: number;
};

export type ProgramTranscriptLineMock = {
  id: string;
  chapterId: string;
  time: number;
  speaker: string;
  text: string;
};

export type ProgramModuleMock = {
  id: string;
  title: string;
  duration: string;
  status: "done" | "current" | "locked";
};

export type ProgramPreviewMock = {
  slug: string;
  name: string;
  logo: string;
  logoLabel: string;
  tagline: string;
  category: string;
  location: string;
  level: ExploreLevel;
  duration: string;
  participants: string;
  about: string[];
  whatYoullLearn: { title: string; body: string }[];
  whoIsThisFor: string[];
  whyJoin: string[];
  sessionLabel: string;
  videoId: string;
  chapters: ProgramChapterMock[];
  transcript: ProgramTranscriptLineMock[];
  modules: ProgramModuleMock[];
};

export const PROGRAM_PREVIEWS: ProgramPreviewMock[] = [
  {
    slug: "pelindo-training",
    name: "Pelindo Training",
    logo: "https://scontent-cgk2-1.xx.fbcdn.net/v/t39.30808-6/244035628_4223927777656985_7347909776281373807_n.png?stp=dst-png&cstp=mx1181x1181&ctp=s1181x1181&_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEdH5PNWMIALT4ZV6DhYNIoh4rZ9TD6oG-Hitn1MPqgbzbsqECjUov3P99NKmcOc256huFuj1Gm9IgKWG3F0wFX&_nc_ohc=YjJOY6jfa38Q7kNvwEki0iX&_nc_oc=AdqJrh7QiX141jAXWyUAZTRx_8ND8BcOGCjc1w6VfVXDpSHHjvUF5SpcnVIj-aXGkvJAvPchhnUDRkFJhSBS8nxX&_nc_zt=23&_nc_ht=scontent-cgk2-1.xx&_nc_gid=qyTnprPPLC3t_ZleLd1-2A&_nc_ss=7b2a8&oh=00_AQLTCIgXOT4PzlIQWHwdhFQ0Rf-y16aPmlRSg9e-_8bnEw&oe=6A9D4869",
    logoLabel: "P",
    tagline:
      "Program adopsi AI untuk tim operasional dan korporat Pelindo — dari dasar prompting sampai use case di pelabuhan.",
    category: "BUMN Kepelabuhanan",
    location: "Jakarta",
    level: "Beginner",
    duration: "8 minggu",
    participants: "120+ peserta",
    about: [
      "Pelindo Training adalah program AI adoption yang dirancang khusus untuk tim operasional, korporat, dan digital di lingkungan Pelindo — mulai dari pengenalan AI sampai penerapan use case nyata di pekerjaan sehari-hari.",
      "Program ini berjalan selama 8 minggu, terbagi ke beberapa level, dengan pendampingan Champion di tiap unit kerja.",
    ],
    whatYoullLearn: [
      {
        title: "Dasar AI & Prompting",
        body: "Memahami cara kerja AI generatif dan menyusun prompt yang efektif untuk kebutuhan kerja sehari-hari.",
      },
      {
        title: "Use Case Operasional",
        body: "Menerapkan AI untuk laporan operasional, analisis data pelabuhan, dan komunikasi lintas divisi.",
      },
      {
        title: "Tata Kelola & Keamanan Data",
        body: "Prinsip penggunaan AI yang aman untuk data internal dan pelanggan.",
      },
    ],
    whoIsThisFor: [
      "Staf operasional dan korporat yang ingin mulai memakai AI di pekerjaan sehari-hari",
      "Champion unit kerja yang akan mendampingi tim mereka selama program",
      "Tim digital yang ingin memetakan use case AI di lingkungan Pelindo",
    ],
    whyJoin: [
      "Kurikulum disesuaikan dengan konteks kerja operasional dan korporat Pelindo",
      "Didampingi Champion di tiap unit kerja, bukan belajar sendirian",
      "Sertifikat penyelesaian program untuk tiap level yang dituntaskan",
    ],
    sessionLabel: "Sesi 1 dari 6",
    videoId: "sIA5yO-aMsM",
    chapters: [
      { id: "intro", label: "Pembukaan", start: 0, end: 40 },
      { id: "kenapa-ai", label: "Kenapa AI Sekarang", start: 40, end: 110 },
      { id: "prompting", label: "Dasar Prompting", start: 110, end: 160 },
      { id: "use-case", label: "Use Case Operasional", start: 160, end: 180 },
    ],
    transcript: [
      {
        id: "t1",
        chapterId: "intro",
        time: 2,
        speaker: "Fasilitator",
        text: "Selamat datang di sesi pertama Pelindo Training. Hari ini kita mulai dari dasar: kenapa AI relevan buat pekerjaan operasional dan korporat kalian.",
      },
      {
        id: "t2",
        chapterId: "intro",
        time: 22,
        speaker: "Fasilitator",
        text: "Program ini bukan cuma teori — tiap sesi ditutup dengan use case yang bisa langsung kalian coba di pekerjaan masing-masing.",
      },
      {
        id: "t3",
        chapterId: "kenapa-ai",
        time: 42,
        speaker: "Fasilitator",
        text: "Banyak tim masih menghabiskan jam kerja untuk hal repetitif — rekap laporan, ringkas notulen, cari data lama. AI bisa memangkas sebagian besar dari itu.",
      },
      {
        id: "t4",
        chapterId: "kenapa-ai",
        time: 75,
        speaker: "Fasilitator",
        text: "Bukan berarti AI menggantikan kalian. AI mengambil alih bagian repetitif, supaya waktu kalian fokus ke keputusan yang butuh judgment manusia.",
      },
      {
        id: "t5",
        chapterId: "prompting",
        time: 112,
        speaker: "Fasilitator",
        text: "Prompt yang baik itu spesifik: jelaskan konteks, format output yang diinginkan, dan batasan yang harus dipatuhi AI.",
      },
      {
        id: "t6",
        chapterId: "prompting",
        time: 138,
        speaker: "Fasilitator",
        text: "Coba mulai dari tugas kecil yang berulang tiap minggu — itu tempat AI paling cepat kelihatan dampaknya.",
      },
      {
        id: "t7",
        chapterId: "use-case",
        time: 162,
        speaker: "Fasilitator",
        text: "Contoh dari tim operasional Pelindo: merangkum laporan shift jadi satu ringkasan siap kirim ke atasan, yang tadinya makan waktu satu jam.",
      },
    ],
    modules: [
      {
        id: "m1",
        title: "Pembukaan Program & Orientasi",
        duration: "15 menit",
        status: "done",
      },
      {
        id: "m2",
        title: "Kenapa AI Sekarang & Dasar Prompting",
        duration: "20 menit",
        status: "current",
      },
      {
        id: "m3",
        title: "Use Case Operasional Pelabuhan",
        duration: "25 menit",
        status: "locked",
      },
      {
        id: "m4",
        title: "Tata Kelola & Keamanan Data",
        duration: "18 menit",
        status: "locked",
      },
    ],
  },
];

export function getProgramPreviewBySlugMock(
  slug: string,
): ProgramPreviewMock | null {
  return PROGRAM_PREVIEWS.find((p) => p.slug === slug) ?? null;
}

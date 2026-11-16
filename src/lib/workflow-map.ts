import type {
  WorkflowFeedbackKind,
  WorkflowNode,
  WorkflowNodeInput,
  WorkflowStatus,
} from "@/apis/workflows";

export const WORKFLOW_MIN_STEPS = 3;
export const WORKFLOW_MAX_STEPS = 8;

export const WORKFLOW_MAX_ATTACHMENTS = 3;
export const WORKFLOW_ATTACHMENT_MAX_MB = 10;
export const WORKFLOW_ATTACHMENT_FOLDER = "workflow-maps";

// Extension → MIME type the backend accepts; images are compressed before upload.
export const WORKFLOW_ATTACHMENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const WORKFLOW_STEP_FIELDS = {
  title: {
    label: "Apa yang dikerjakan?",
    placeholder: "Contoh: Kumpulkan laporan harian dari tiap pengawas",
  },
  source: {
    label: "Bahan/data dari mana?",
    placeholder: "Contoh: Email dari pengawas",
  },
  tool: { label: "Pakai tool apa?", placeholder: "Contoh: Excel, Outlook" },
  minutes: { label: "Kira-kira berapa lama?", placeholder: "30" },
} as const;

export const WORKFLOW_STATUS_LABELS: Record<WorkflowStatus, string> = {
  draft: "Draft",
  submitted: "Menunggu kelas",
  reviewed: "Sudah dibahas",
};

export const WORKFLOW_FEEDBACK_LABELS: Record<WorkflowFeedbackKind, string> = {
  automate: "Bisa dibantu AI",
  improve: "Saran perbaikan",
  question: "Pertanyaan",
};

export const WORKFLOW_EXAMPLE = {
  title: "Rekap laporan produksi harian",
  problem:
    "Laporan dari tiap pengawas formatnya beda-beda, jadi rekapnya sering telat dan salah ketik.",
  frequency: "Harian",
  result: "Ringkasan produksi harian di grup WhatsApp kepala pabrik",
  steps: [
    {
      title: "Kumpulkan laporan harian dari tiap pengawas",
      source: "Email dari pengawas",
      tool: "Outlook",
      minutes: 15,
    },
    {
      title: "Salin angka produksi ke satu sheet rekap",
      source: "Lampiran Excel tiap pengawas",
      tool: "Excel",
      minutes: 45,
    },
    {
      title: "Kirim ringkasan ke kepala pabrik",
      source: "Sheet rekap",
      tool: "WhatsApp",
      minutes: 10,
    },
  ],
};

const blankStep = (id: string): WorkflowNodeInput => ({
  id,
  title: "",
  source: "",
  tool: "",
  minutes: null,
  pain_point: false,
});

// Fixed IDs keep server and client renders identical for a new map.
export const WORKFLOW_STARTER_NODES: WorkflowNodeInput[] = Array.from(
  { length: WORKFLOW_MIN_STEPS },
  (_, index) => blankStep(`new-step-${index + 1}`),
);

export function createWorkflowStep(): WorkflowNodeInput {
  return blankStep(crypto.randomUUID());
}

// The editor works on strings; maps saved with fewer steps are padded to the minimum.
export function toNodeInputs(nodes: WorkflowNode[]): WorkflowNodeInput[] {
  const inputs = nodes.map((node) => ({
    ...node,
    title: node.title ?? "",
    source: node.source ?? "",
    tool: node.tool ?? "",
  }));
  for (let index = inputs.length; index < WORKFLOW_MIN_STEPS; index++) {
    inputs.push(blankStep(`padding-step-${index + 1}`));
  }
  return inputs;
}

// Backend messages (docs/api/workflows.md) shown to learners in Indonesian.
const WORKFLOW_ERROR_MESSAGES: Record<string, string> = {
  "Workflow must have 3-8 steps": "Peta alur harus berisi 3–8 langkah.",
  "Node IDs must be unique within a workflow":
    "Ada langkah ganda. Muat ulang halaman lalu coba lagi.",
  "Fill in the title, problem, frequency, result, and every step title before submitting":
    "Lengkapi nama pekerjaan, masalahnya, seberapa sering dikerjakan, isi setiap langkah, dan hasil akhirnya sebelum submit.",
  "Attach at most 3 PDF, Office, or image files of up to 10 MB each":
    "Lampiran maksimal 3 file PDF, Office, atau gambar, masing-masing maksimal 10 MB.",
  "Workflow not found": "Peta alur tidak ditemukan atau sudah dihapus.",
  "Invalid request body": "Ada isian yang terlalu panjang atau tidak valid.",
};

export function workflowErrorMessage(
  message: string | undefined,
  fallback: string,
): string {
  return (message && WORKFLOW_ERROR_MESSAGES[message]) || fallback;
}

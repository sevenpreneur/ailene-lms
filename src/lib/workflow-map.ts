import type {
  WorkflowFeedbackKind,
  WorkflowNode,
  WorkflowNodeInput,
  WorkflowNodeKind,
  WorkflowStatus,
} from "@/apis/workflows";

export const WORKFLOW_NODE_LABELS: Record<WorkflowNodeKind, string> = {
  trigger: "Pemicu",
  step: "Langkah",
  output: "Hasil",
};

export const WORKFLOW_NODE_QUESTIONS: Record<
  WorkflowNodeKind,
  { label: string; placeholder: string }
> = {
  trigger: {
    label: "Apa yang memulai proses ini?",
    placeholder: "Mis. Cabang mengirim file penjualan lewat email",
  },
  step: {
    label: "Apa yang kamu lakukan?",
    placeholder: "Mis. Salin data ke satu sheet rekap",
  },
  output: {
    label: "Hasil akhirnya apa?",
    placeholder: "Mis. Slide laporan mingguan",
  },
};

export const WORKFLOW_TOOL_PRESETS = [
  "Excel",
  "Google Sheets",
  "Email",
  "WhatsApp",
  "Word",
  "PowerPoint",
  "Manual",
];

export const WORKFLOW_MAX_STEPS = 10;

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

const BLANK_NODE = {
  title: "",
  frequency: null,
  tool: "",
  minutes: null,
  pain_point: false,
  recipient: "",
  note: "",
} as const;

// Fixed IDs keep server and client renders identical for a new map.
export const WORKFLOW_STARTER_NODES: WorkflowNodeInput[] = [
  { ...BLANK_NODE, id: "new-trigger", kind: "trigger" },
  { ...BLANK_NODE, id: "new-step-1", kind: "step" },
  { ...BLANK_NODE, id: "new-output", kind: "output" },
];

export function createWorkflowStep(): WorkflowNodeInput {
  return {
    id: crypto.randomUUID(),
    kind: "step",
    title: "",
    frequency: null,
    tool: "",
    minutes: null,
    pain_point: false,
    recipient: "",
    note: "",
  };
}

// The editor works on strings; stored blanks come back as null.
export function toNodeInput(node: WorkflowNode): WorkflowNodeInput {
  return {
    ...node,
    title: node.title ?? "",
    tool: node.tool ?? "",
    recipient: node.recipient ?? "",
    note: node.note ?? "",
  };
}

// Backend messages (docs/api/workflows.md) shown to learners in Indonesian.
const WORKFLOW_ERROR_MESSAGES: Record<string, string> = {
  "Workflow must start with one trigger, end with one output, and have 1-10 steps in between":
    "Alur harus diawali satu pemicu, diakhiri satu hasil, dan berisi 1–10 langkah.",
  "Node IDs must be unique within a workflow":
    "Ada kartu ganda. Muat ulang halaman lalu coba lagi.",
  "Fill in the title, problem, trigger frequency, and every node title before submitting":
    "Lengkapi nama pekerjaan, masalahnya, frekuensi pemicu, dan isi setiap kartu sebelum submit.",
  "Workflow not found": "Peta alur tidak ditemukan atau sudah dihapus.",
  "Invalid request body": "Ada isian yang terlalu panjang atau tidak valid.",
};

export function workflowErrorMessage(
  message: string | undefined,
  fallback: string,
): string {
  return (message && WORKFLOW_ERROR_MESSAGES[message]) || fallback;
}

"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import TextAreaAILN from "@/components/fields/TextAreaAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { AssignmentDraftBatch } from "@/apis/champion";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AiAssignmentComposerAILNProps {
  onGenerated: (batch: AssignmentDraftBatch) => void;
}

export default function AiAssignmentComposerAILN({
  onGenerated,
}: AiAssignmentComposerAILNProps) {
  const projectId = useProjectId();
  const [instruction, setInstruction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (!instruction.trim()) {
      toast.error("Tulis dulu assignment seperti apa yang Anda mau.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/champion/assignments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          instruction: instruction.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        toast.error(payload?.message ?? "AI gagal membuat draft. Coba lagi.");
        return;
      }

      onGenerated(payload as AssignmentDraftBatch);
      setInstruction("");
    } catch {
      toast.error("AI gagal membuat draft. Coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SectionContainerAILN
      title="Buat Assignment dengan AI"
      desc="Ceritakan latihan yang Anda mau. AI menentukan sendiri tipe dan jumlah variasinya, semuanya tersimpan sebagai draft pribadi Anda. Pilih satu, cek, lalu assign ke tim."
    >
      <div className="flex flex-col gap-3">
        <TextAreaAILN
          textAreaId="ai-assignment-instruction"
          variant="CHAMPION"
          value={instruction}
          onTextAreaChange={setInstruction}
          textAreaHeight="h-24"
          characterLength={2000}
          textAreaPlaceholder="Contoh: Buatkan latihan prompt untuk tim HR menulis job description yang rapi dan menarik."
          disabled={isGenerating}
        />
        <div className="flex justify-end">
          <ButtonAILN
            type="button"
            variant="champion"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isGenerating ? "AI sedang menyusun…" : "Generate dengan AI"}
          </ButtonAILN>
        </div>
      </div>
    </SectionContainerAILN>
  );
}

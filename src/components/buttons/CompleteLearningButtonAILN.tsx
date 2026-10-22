"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompleteLearningButtonAILN({
  kind,
  id,
  completed,
}: {
  kind: "videos" | "materials";
  id: string | number;
  completed: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  if (completed || done)
    return (
      <p role="status" className="text-sm text-claude dark:text-lime-bright">
        {kind === "videos" ? "Sudah ditonton" : "Sudah dibaca"}
      </p>
    );
  return (
    <div className="flex flex-col items-start gap-2">
      <ButtonAILN
        variant="outline"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          setError(false);
          try {
            const response = await fetch(`/api/${kind}/completion`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                kind === "videos" ? { video_id: id } : { material_id: id },
              ),
            });
            if (
              !response.ok ||
              response.redirected ||
              !response.headers
                .get("content-type")
                ?.includes("application/json")
            )
              throw new Error();
            const completion = await response.json();
            if (completion?.completed !== true) throw new Error();
            setDone(true);
            router.refresh();
          } catch {
            setError(true);
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving
          ? "Menyimpan…"
          : kind === "videos"
            ? "Tandai sudah ditonton"
            : "Tandai sudah dibaca"}
      </ButtonAILN>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          Belum tersimpan. Periksa koneksi dan coba lagi.
        </p>
      )}
    </div>
  );
}

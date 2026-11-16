"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import WorkflowMapCardAILN from "@/components/cards/WorkflowMapCardAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import type { WorkflowListItem } from "@/apis/workflows";
import LoadErrorAILN from "@/components/states/LoadErrorAILN";
import { Plus, Workflow } from "lucide-react";
import Link from "next/link";

export default function WorkflowMapsStudentAILN({
  maps,
}: {
  maps: WorkflowListItem[] | null;
}) {
  const projectId = useProjectId();
  const base = `/${projectId}/student/workflow-maps`;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Peta Alur Kerja"
          desc="Petakan cara kamu bekerja sekarang, lalu dapatkan masukan saat kelas."
        >
          <ButtonAILN variant="primary" size="medium" asChild>
            <Link href={`${base}/new`}>
              <Plus className="size-4" />
              Buat peta baru
            </Link>
          </ButtonAILN>
        </PageHeaderAILN>

        {maps === null ? (
          <LoadErrorAILN message="Peta alur belum dapat dimuat. Coba lagi beberapa saat lagi." />
        ) : maps.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-sb-border px-6 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-lg bg-sevenpreneur-coal text-white dark:bg-white dark:text-sevenpreneur-coal">
              <Workflow className="size-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Belum ada peta alur</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Mulai dari satu pekerjaan rutin. Cukup 3–7 langkah, tulis apa
                adanya.
              </p>
            </div>
            <ButtonAILN variant="dark" size="medium" asChild>
              <Link href={`${base}/new`}>
                <Plus className="size-4" />
                Buat peta pertama
              </Link>
            </ButtonAILN>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {maps.map((map) => (
              <li key={map.id}>
                <WorkflowMapCardAILN map={map} href={`${base}/${map.id}`} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainerAILN>
  );
}

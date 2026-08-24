"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import AppErrorComponents from "@/components/states/AppErrorComponents";
import AppLoadingComponents from "@/components/states/AppLoadingComponents";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import { useProjectId } from "@/lib/use-project-id";
import { setSessionToken, trpc } from "@/trpc/client";
import {
  faArrowUpRightFromSquare,
  faCalendarDay,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faClock,
  faFilePdf,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { marked } from "marked";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import styles from "../css/MaterialDetails.module.css";

dayjs.locale("id");
marked.setOptions({ gfm: true, breaks: false });

interface MaterialDetailsAILNProps {
  sessionToken: string;
  materialId: string;
}

interface TocEntry {
  id: string;
  level: number;
  text: string;
}

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function renderArticle(markdown: string): { html: string; toc: TocEntry[] } {
  const rawHtml = marked.parse(markdown) as string;
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();

  const html = rawHtml.replace(
    /<h([1-3])>([\s\S]*?)<\/h\1>/g,
    (_match, levelStr: string, inner: string) => {
      const level = Number(levelStr);
      const plain = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim();
      let id = slugify(plain) || `heading-${toc.length + 1}`;
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count + 1}`;
      toc.push({ id, level, text: plain });
      return `<h${level} id="${id}">${inner}</h${level}>`;
    }
  );

  return { html, toc };
}

function estimateReadMinutes(content: string | null | undefined) {
  if (!content) return null;
  const text = content.replace(/[#*_`>\-\[\]()]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words === 0) return null;
  const min = Math.max(1, Math.ceil(words / 220));
  const max = Math.max(min + 1, Math.ceil(words / 160));
  return { min, max };
}

function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const clean = url.split("?")[0].toLowerCase();
    return clean.endsWith(".pdf");
  } catch {
    return false;
  }
}

export default function MaterialDetailsAILN({
  sessionToken,
  materialId,
}: MaterialDetailsAILNProps) {
  const projectId = useProjectId();

  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.read.materialDetail.useQuery({
    material_id: materialId,
  });

  const levelMaterialsQ = trpc.read.levelMaterials.useQuery({
    material_id: materialId,
  });
  const levelNumber = levelMaterialsQ.data?.level_number ?? 0;
  const allMaterials = levelMaterialsQ.data?.materials ?? [];
  const otherMaterials = allMaterials.filter((m) => !m.is_current);

  const currentIdx = allMaterials.findIndex((m) => m.is_current);
  const prevMaterial = currentIdx > 0 ? allMaterials[currentIdx - 1] : null;
  const nextMaterial =
    currentIdx >= 0 && currentIdx < allMaterials.length - 1
      ? allMaterials[currentIdx + 1]
      : null;

  const markMutation = trpc.create.completeMaterial.useMutation({
    onSuccess: () => {
      utils.auth.checkAilMember.invalidate();
      utils.read.materialDetail.invalidate({ material_id: materialId });
      utils.list.tasks.invalidate();
      utils.list.chapters.invalidate();
      utils.list.levels.invalidate();
      utils.read.todayFocus.invalidate();
    },
  });

  const material = data?.material;
  const completed = data?.completed ?? false;
  const fileUrl = material?.file_url ?? null;
  const isPdf = isPdfUrl(fileUrl);

  const triggeredRef = useRef(false);
  useEffect(() => {
    if (!material) return;
    if (completed) return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    markMutation.mutate({ material_id: materialId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, completed, materialId]);

  const { html: renderedContent, toc } = useMemo(() => {
    if (!material?.content) return { html: "", toc: [] as TocEntry[] };
    return renderArticle(material.content);
  }, [material]);

  const readTime = useMemo(
    () => estimateReadMinutes(material?.content),
    [material?.content]
  );

  if (isLoading) {
    return (
      <PageContainerAILN>
        <AppLoadingComponents />
      </PageContainerAILN>
    );
  }
  if (isError || !material) {
    return (
      <PageContainerAILN>
        <AppErrorComponents />
      </PageContainerAILN>
    );
  }

  const publishedAt = material.created_at
    ? dayjs(material.created_at).format("D MMMM YYYY")
    : null;
  const updatedAt = material.updated_at
    ? dayjs(material.updated_at).format("D MMMM YYYY")
    : null;

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6 py-4">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <PageHeaderAILN
            title={material.title}
            desc={material.description ?? undefined}
          />

          <div className="mt-1 flex flex-wrap items-center gap-2">
            {readTime && (
              <GeneralLabelAILN
                variant="white"
                icon={
                  <FontAwesomeIcon
                    icon={faClock}
                    className="h-3 w-3 text-gray-500 dark:text-gray-400"
                  />
                }
              >
                {readTime.min}–{readTime.max} menit baca
              </GeneralLabelAILN>
            )}

            {publishedAt && (
              <GeneralLabelAILN
                variant="white"
                icon={
                  <FontAwesomeIcon
                    icon={faCalendarDay}
                    className="h-3 w-3 text-gray-500 dark:text-gray-400"
                  />
                }
              >
                Terbit: {publishedAt}
              </GeneralLabelAILN>
            )}
            <GeneralLabelAILN
              variant="white"
              icon={
                <FontAwesomeIcon
                  icon={faStar}
                  className="h-3 w-3 text-yellow-500"
                />
              }
            >
              +{material.xp_reward} XP
            </GeneralLabelAILN>

            {completed && (
              <GeneralLabelAILN
                variant="green"
                icon={
                  <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                }
              >
                Selesai
              </GeneralLabelAILN>
            )}
          </div>
        </div>

        {/* Body — main + sticky sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main content */}
          <div className="flex flex-col gap-6 min-w-0">
            {fileUrl && (
              <div className="overflow-hidden rounded-xl border border-dashboard-border bg-white dark:bg-card-1 dark:shadow-[0_0_18px_rgba(239,68,68,0.08)]">
                <div className="flex items-center justify-between gap-3 border-b border-dashboard-border px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sevenpreneur-coal dark:text-white">
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="h-4 w-4 text-red-500"
                    />
                    <span>Materi Pendukung {isPdf ? "(PDF)" : "(File)"}</span>
                  </div>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:underline"
                  >
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      className="h-3 w-3"
                    />
                    Buka di tab baru
                  </a>
                </div>
                {isPdf ? (
                  <iframe
                    src={`${fileUrl}#view=FitH&toolbar=0&navpanes=0`}
                    title={material.title}
                    className="h-[640px] w-full bg-[#1e1f24]"
                  />
                ) : (
                  <div className="px-4 py-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Materi ini berupa file. Buka di tab baru untuk melihat.
                    </p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block"
                    >
                      <ButtonAILN size="medium">Buka File</ButtonAILN>
                    </a>
                  </div>
                )}
                <div className="border-t border-dashboard-border bg-gray-50 px-4 py-2 text-sm text-gray-500 dark:bg-card-2 dark:text-gray-400">
                  Tips: Gunakan tombol di atas viewer untuk memperbesar,
                  mengunduh, atau membuka PDF di tab baru.
                </div>
              </div>
            )}

            {renderedContent ? (
              <article
                className={styles.prose}
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            ) : (
              !fileUrl && (
                <div className="rounded-xl border border-dashed border-dashboard-border bg-white px-4 py-8 text-center text-sm text-gray-500 dark:bg-card-1 dark:text-gray-400">
                  Materi ini belum memiliki konten artikel.
                </div>
              )
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 flex flex-col gap-4">
              {toc.length > 0 && (
                <SectionContainerAILN
                  title="Daftar Isi"
                  contentClassName="mt-3"
                >
                  <nav className="flex flex-col gap-1">
                    {toc.map((entry) => (
                      <a
                        key={entry.id}
                        href={`#${entry.id}`}
                        className={[
                          "block rounded-md px-2.5 py-1.5 text-sm leading-relaxed transition-colors",
                          entry.level === 1
                            ? "font-semibold"
                            : entry.level === 2
                              ? "font-medium"
                              : "font-normal",
                          entry.level === 3 ? "pl-5" : "pl-2.5",
                          "text-gray-600 hover:bg-black/5 hover:text-sevenpreneur-coal dark:text-gray-400 dark:hover:bg-card-2 dark:hover:text-white",
                        ].join(" ")}
                      >
                        {entry.text}
                      </a>
                    ))}
                  </nav>
                </SectionContainerAILN>
              )}

              {otherMaterials.length > 0 && (
                <SectionContainerAILN
                  title="Materi Lain"
                  contentClassName="mt-3"
                >
                  <div className="flex flex-col gap-0.5">
                    {otherMaterials.map((m) => (
                      <Link
                        key={m.id}
                        href={`/${projectId}/student/materials/${m.id}`}
                        className="flex items-start gap-2 rounded-md px-2 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-card-2"
                      >
                        <span className="w-7 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                          {levelNumber}.{m.index}
                        </span>
                        <span className="line-clamp-2 flex-1 text-sm leading-snug text-sevenpreneur-coal dark:text-gray-200">
                          {m.title}
                        </span>
                        {m.completed ? (
                          <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500"
                            title="Selesai"
                          />
                        ) : (
                          <GeneralLabelAILN
                            variant="blue"
                            className="mt-0.5 shrink-0"
                          >
                            Baru
                          </GeneralLabelAILN>
                        )}
                      </Link>
                    ))}
                  </div>
                </SectionContainerAILN>
              )}

              {updatedAt && (
                <div className="rounded-xl border border-dashboard-border bg-white p-4 dark:bg-card-1 dark:shadow-[0_0_18px_rgba(239,68,68,0.08)]">
                  <div className="mb-2 text-sm font-semibold text-sevenpreneur-coal dark:text-white">
                    Di halaman ini
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FontAwesomeIcon
                      icon={faCalendarDay}
                      className="h-3 w-3 text-gray-500 dark:text-gray-400"
                    />
                    <span>Terakhir diperbarui: {updatedAt}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Footer nav — move between materials without leaving the page */}
        {(prevMaterial || nextMaterial) && (
          <nav className="flex items-stretch justify-between gap-3 border-t border-dashboard-border pt-6">
            {prevMaterial ? (
              <Link
                href={`/${projectId}/student/materials/${prevMaterial.id}`}
                className="group flex w-[35%] items-center gap-3 rounded-xl border border-dashboard-border bg-white p-3 transition-colors hover:border-black/30 hover:bg-black/[0.02] dark:bg-card-1 dark:hover:border-white/30 dark:hover:bg-white/10"
              >
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="h-3.5 w-3.5 shrink-0"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Materi Sebelumnya
                  </span>
                  <span className="line-clamp-1 text-sm font-semibold text-sevenpreneur-coal dark:text-white">
                    {prevMaterial.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nextMaterial ? (
              <Link
                href={`/${projectId}/student/materials/${nextMaterial.id}`}
                className="group flex w-[35%] items-center justify-end gap-3 rounded-xl border border-dashboard-border bg-white p-3 text-right transition-colors hover:border-black/30 hover:bg-black/[0.02] dark:bg-card-1 dark:hover:border-white/30 dark:hover:bg-white/10"
              >
                <span className="flex min-w-0 flex-col items-end">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Materi Selanjutnya
                  </span>
                  <span className="line-clamp-1 text-sm font-semibold text-sevenpreneur-coal dark:text-white">
                    {nextMaterial.title}
                  </span>
                </span>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="h-3.5 w-3.5 shrink-0"
                />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </PageContainerAILN>
  );
}

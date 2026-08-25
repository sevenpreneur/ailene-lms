"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { MaterialDetail } from "@/apis/learnings";
import {
  faArrowUpRightFromSquare,
  faCalendarDay,
  faCircleCheck,
  faClock,
  faFilePdf,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { marked } from "marked";
import styles from "../css/MaterialDetails.module.css";

dayjs.locale("id");
marked.setOptions({ gfm: true, breaks: false });

interface MaterialDetailsAILNProps {
  material: MaterialDetail;
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
  material,
}: MaterialDetailsAILNProps) {
  const completed = material.completed;
  const fileUrl = material.file_url;
  const isPdf = isPdfUrl(fileUrl);

  const { html: renderedContent, toc } = material.content
    ? renderArticle(material.content)
    : { html: "", toc: [] as TocEntry[] };

  const readTime = estimateReadMinutes(material.content);

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
              <div className="overflow-hidden rounded-xl border border-dashboard-border bg-white dark:bg-card-1 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
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

              {updatedAt && (
                <div className="rounded-xl border border-dashboard-border bg-white p-4 dark:bg-card-1 dark:shadow-[0_0_18px_rgba(26,122,82,0.08)]">
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
      </div>
    </PageContainerAILN>
  );
}

import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

export interface MaterialTocEntry {
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

export function renderMaterialArticle(markdown: string): {
  html: string;
  toc: MaterialTocEntry[];
} {
  const rawHtml = marked.parse(markdown) as string;
  const toc: MaterialTocEntry[] = [];
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
    },
  );

  return { html, toc };
}

export function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

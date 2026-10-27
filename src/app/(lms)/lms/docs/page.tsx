import DocsAILN from "@/components/pages/DocsAILN";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panduan Penggunaan LMS",
  description:
    "Panduan Ailene AI Learn: masuk program, pre-assessment, sesi belajar, pre-test, materi, post-test, survei, dan praktik Use Case.",
  alternates: { canonical: "/docs" },
};

export default function DocsPage() {
  return <DocsAILN />;
}

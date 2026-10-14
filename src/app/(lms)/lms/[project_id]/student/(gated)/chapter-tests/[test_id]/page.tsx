import {
  getChapterTestDetails,
  getChapterTestResult,
} from "@/apis/chapter-tests";
import ChapterTestAttemptAILN from "@/components/pages/ChapterTestAttemptAILN";
import ChapterTestResultAILN from "@/components/pages/ChapterTestResultAILN";
import AppPageState from "@/components/states/AppPageState";
import { CHAPTER_TEST_LOCKED_MESSAGE } from "@/lib/chapter-evaluation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-test & Post-test",
};

export default async function ChapterTestPage({
  params,
}: {
  params: Promise<{ project_id: string; test_id: string }>;
}) {
  const { test_id } = await params;
  const testId = Number(test_id);

  if (!Number.isInteger(testId) || testId <= 0) {
    return <AppPageState variant="NOT_FOUND" />;
  }

  const result = await getChapterTestDetails(testId);
  if (result.kind === "forbidden") {
    return (
      <AppPageState
        variant="FORBIDDEN"
        message={
          result.reason === "chapter_locked"
            ? "Chapter ini belum terbuka. Periksa jadwal sesi atau hubungi admin."
            : "Kamu belum memiliki akses untuk mengerjakan tes ini."
        }
      />
    );
  }
  if (result.kind === "not_found") {
    return <AppPageState variant="NOT_FOUND" />;
  }
  const test = result.data;

  if (test.submitted) {
    const testResult = await getChapterTestResult(testId);
    if (!testResult) {
      return <AppPageState variant="NOT_FOUND" />;
    }
    return <ChapterTestResultAILN result={testResult} />;
  }

  if (!test.available) {
    return (
      <AppPageState
        variant="FORBIDDEN"
        message={
          test.locked_reason
            ? `${CHAPTER_TEST_LOCKED_MESSAGE[test.locked_reason]}.`
            : undefined
        }
      />
    );
  }

  return <ChapterTestAttemptAILN test={test} />;
}

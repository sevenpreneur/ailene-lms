"use client";

import type { ChapterTask } from "@/apis/chapter-tasks";
import ChapterTaskCardAILN from "@/components/cards/ChapterTaskCardAILN";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Accordion } from "radix-ui";

export default function ChapterTasksStudentAILN({
  tasks,
  chapterOrder,
}: {
  tasks: ChapterTask[];
  chapterOrder: number[];
}) {
  const [expanded, setExpanded] = useState("");
  const chapterNumbers = useMemo(() => {
    const numbers = new Map<number, number>();
    chapterOrder.forEach((chapterId, index) =>
      numbers.set(chapterId, index + 1),
    );

    let fallback = numbers.size + 1;
    for (const task of tasks) {
      if (!numbers.has(task.chapter.id)) {
        numbers.set(task.chapter.id, fallback++);
      }
    }
    return numbers;
  }, [chapterOrder, tasks]);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="chapter-tasks-title">
      <div>
        <h2
          id="chapter-tasks-title"
          className="font-headline text-2xl font-medium text-gray-950 dark:text-white"
        >
          Tugas Praktik per Chapter
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Kerjakan latihan praktik sesuai urutan perjalanan belajarmu.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-dashboard-border px-5 py-8 text-center">
          <CheckCircle2 className="size-8 text-claude dark:text-lime-bright" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Belum ada tugas praktik yang tersedia.
          </p>
          <p className="max-w-lg text-[13px] leading-6 text-gray-600 dark:text-gray-400">
            Tugas akan muncul setelah chapter dijadwalkan dan dibuka untuk
            kelompokmu.
          </p>
        </div>
      ) : (
        <Accordion.Root
          type="single"
          collapsible
          value={expanded}
          onValueChange={setExpanded}
          className="flex flex-col gap-3"
        >
          {tasks.map((task) => (
            <ChapterTaskCardAILN
              key={task.id}
              task={task}
              chapterNumber={chapterNumbers.get(task.chapter.id) ?? 1}
              expanded={expanded === String(task.id)}
              onSubmitted={() => setExpanded("")}
            />
          ))}
        </Accordion.Root>
      )}
    </section>
  );
}

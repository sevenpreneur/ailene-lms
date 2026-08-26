"use client";
import ChapterItemAILN from "@/components/items/ChapterItemAILN";
import LevelDividerAILN from "@/components/items/LevelDividerAILN";
import SkillPracticeListAILN from "@/components/items/SkillPracticeListAILN";
import type { SkillPracticeItem } from "@/components/items/SkillPracticeItemAILN";
import LevelLabelStudentAILN from "@/components/labels/LevelLabelStudentAILN";
import RewardLabelStudentAILN from "@/components/labels/RewardLabelStudentAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { StudentChapter, StudentLevel } from "@/apis/learnings";
import type { AssignedPrompt } from "@/apis/prompts";
import type { AssignedUseCase } from "@/apis/use-cases";
import { getLevelProgressMock } from "@/mock-data/student";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

dayjs.locale("id");

type Level = StudentLevel;
type Chapter = StudentChapter;

function toSkillPracticeItem(
  r: AssignedPrompt | AssignedUseCase
): SkillPracticeItem {
  return {
    id: r.id,
    ref_id: r.id,
    level_number: r.level_number,
    name: r.name,
    body: r.description,
    xp_reward: r.xp_reward,
    categories: r.categories,
    assigned_by: r.assigned_by
      ? {
          id: r.assigned_by.id,
          full_name: r.assigned_by.name,
          avatar: r.assigned_by.avatar,
        }
      : null,
    deadline: r.deadline_at,
    message: null,
    submitted_at: r.submitted_at,
    reviewed_at: r.reviewed_at,
    is_accepted: r.is_accepted,
  };
}

export default function LearningPathStudentAILN({
  levels,
  chapters,
  currentLevelNumber,
  totalXp,
  assignedPrompts,
  assignedUseCases,
}: {
  levels: Level[];
  chapters: Chapter[];
  currentLevelNumber: number;
  totalXp: number;
  assignedPrompts: AssignedPrompt[];
  assignedUseCases: AssignedUseCase[];
}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set()
  );

  const levelProgress = getLevelProgressMock();
  const currentLevelName =
    levels.find((l) => l.level_number === currentLevelNumber)?.name ?? null;

  const allPrompts = assignedPrompts.map(toSkillPracticeItem);
  const allUseCases = assignedUseCases.map(toSkillPracticeItem);

  // Pick the first useful timeline item to open.
  const searchParams = useSearchParams();
  const chapterParam = searchParams.get("chapter");
  const practiceParam = searchParams.get("practice");
  const autoExpandedRef = useRef(false);
  const chapterProgressRef = useRef<Map<number, Chapter["progress"]>>(
    new Map()
  );
  useEffect(() => {
    if (autoExpandedRef.current) return;
    autoExpandedRef.current = true;

    if (chapterParam) {
      const id = Number(chapterParam);
      if (Number.isFinite(id) && chapters.some((c) => c.id === id)) {
        setExpandedChapters(new Set([id]));
        return;
      }
    }
    if (practiceParam) {
      const id = Number(practiceParam);
      if (Number.isFinite(id)) {
        setExpandedModules(new Set([id]));
        return;
      }
    }

    // Chapters are already sorted by date.
    const earliestInProgress = chapters.find(
      (c) => c.progress === "in_progress"
    );
    if (earliestInProgress) {
      setExpandedChapters(new Set([earliestInProgress.id]));
      return;
    }

    const nextChapterToOpen = chapters.find((c) => {
      if (c.progress === "completed") return false;
      if (c.level.level_number > currentLevelNumber) return false;
      return true;
    });
    if (nextChapterToOpen) {
      setExpandedChapters(new Set([nextChapterToOpen.id]));
      return;
    }

    // Fallback to the earliest unfinished practice level.
    const levelNumbersWithUnfinished = new Set<number>();
    const consider = (item: SkillPracticeItem) => {
      const accepted = !!item.reviewed_at && item.is_accepted;
      if (accepted) return;
      if (item.level_number > currentLevelNumber) return;
      levelNumbersWithUnfinished.add(item.level_number);
    };
    for (const r of allPrompts) consider(r);
    for (const r of allUseCases) consider(r);
    const earliestLevelNumber = [...levelNumbersWithUnfinished].sort(
      (a, b) => a - b
    )[0];
    const earliestLevelId = levels.find(
      (l) => l.level_number === earliestLevelNumber
    )?.id;
    if (earliestLevelId !== undefined) {
      setExpandedModules(new Set([earliestLevelId]));
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterParam, practiceParam]);

  useEffect(() => {
    const previous = chapterProgressRef.current;
    if (previous.size === 0) {
      chapterProgressRef.current = new Map(
        chapters.map((chapter) => [chapter.id, chapter.progress])
      );
      return;
    }

    const completedChapter = chapters.find(
      (chapter) =>
        expandedChapters.has(chapter.id) &&
        previous.get(chapter.id) !== "completed" &&
        chapter.progress === "completed"
    );
    chapterProgressRef.current = new Map(
      chapters.map((chapter) => [chapter.id, chapter.progress])
    );
    if (!completedChapter) return;

    const completedIndex = chapters.findIndex(
      (chapter) => chapter.id === completedChapter.id
    );
    const nextAccessible = chapters.find((chapter, index) => {
      if (index <= completedIndex) return false;
      if (chapter.progress === "completed") return false;
      if (chapter.level.level_number > currentLevelNumber) return false;
      return true;
    });
    if (nextAccessible) {
      setExpandedChapters(new Set([nextAccessible.id]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedChapters]);

  const nextLevelUnlockable = levelProgress.next_level_unlockable;

  const toggleChapter = (id: number) =>
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleModule = (levelId: number) =>
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(levelId)) next.delete(levelId);
      else next.add(levelId);
      return next;
    });

  // Build the level-driven timeline.
  type TimelineLevel = Level & { icon: string | null };
  type Item =
    | {
        kind: "chapter";
        chapter: Chapter;
        index: number;
        unlocked: boolean;
      }
    | {
        kind: "level";
        level: TimelineLevel;
        unlocked: boolean;
        claimable: boolean;
      }
    | {
        kind: "skillPractice";
        level: TimelineLevel;
        levelUnlocked: boolean;
        prompts: SkillPracticeItem[];
        useCases: SkillPracticeItem[];
      };

  const chaptersByLevel = new Map<number, Chapter[]>();
  for (const ch of chapters) {
    const key = ch.level.level_number;
    const bucket = chaptersByLevel.get(key) ?? [];
    bucket.push(ch);
    chaptersByLevel.set(key, bucket);
  }

  const promptsByLevel = new Map<number, SkillPracticeItem[]>();
  for (const p of allPrompts) {
    const bucket = promptsByLevel.get(p.level_number) ?? [];
    bucket.push(p);
    promptsByLevel.set(p.level_number, bucket);
  }
  const useCasesByLevel = new Map<number, SkillPracticeItem[]>();
  for (const u of allUseCases) {
    const bucket = useCasesByLevel.get(u.level_number) ?? [];
    bucket.push(u);
    useCasesByLevel.set(u.level_number, bucket);
  }

  const items: Item[] = [];
  let weekIndex = 0;
  levels.forEach((lvl) => {
    const levelUnlocked = lvl.level_number <= currentLevelNumber;
    // Backend doesn't return a per-level icon — LevelDividerAILN falls back to its own art when null.
    const timelineLevel: TimelineLevel = { ...lvl, icon: null };

    items.push({
      kind: "level",
      level: timelineLevel,
      unlocked: levelUnlocked,
      claimable:
        !levelUnlocked &&
        lvl.level_number === currentLevelNumber + 1 &&
        nextLevelUnlockable,
    });

    const levelChapters = chaptersByLevel.get(lvl.level_number) ?? [];
    for (const ch of levelChapters) {
      weekIndex += 1;
      items.push({
        kind: "chapter",
        chapter: ch,
        index: weekIndex,
        unlocked: levelUnlocked /* && sessionStarted */,
      });
    }

    const lvlPrompts = promptsByLevel.get(lvl.level_number) ?? [];
    const lvlUseCases = useCasesByLevel.get(lvl.level_number) ?? [];
    if (lvlPrompts.length + lvlUseCases.length > 0) {
      items.push({
        kind: "skillPractice",
        level: timelineLevel,
        levelUnlocked,
        prompts: lvlPrompts,
        useCases: lvlUseCases,
      });
    }
  });

  return (
    <PageContainerAILN>
      <div className="flex w-full flex-col gap-6">
        <PageHeaderAILN
          title="Jalur Belajar"
          desc="Tuntaskan semua tugas mingguan untuk maju ke level berikutnya."
        >
          <LevelLabelStudentAILN
            variant="summary"
            levelNumber={currentLevelNumber}
            levelName={currentLevelName ?? undefined}
          />
          <RewardLabelStudentAILN variant="summary" xp={totalXp} />
        </PageHeaderAILN>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-dashboard-border" />
          <div className="space-y-4">
            {items.map((item, i) => {
              if (item.kind === "level") {
                return (
                  <LevelDividerAILN
                    key={`lvl-${item.level.id}-${i}`}
                    level={item.level}
                    unlocked={item.unlocked}
                    claimable={item.claimable}
                  />
                );
              }
              if (item.kind === "chapter") {
                return (
                  <ChapterItemAILN
                    key={item.chapter.id}
                    chapter={item.chapter}
                    chapterNumber={item.index}
                    unlocked={item.unlocked}
                    expanded={expandedChapters.has(item.chapter.id)}
                    onToggle={() => toggleChapter(item.chapter.id)}
                  />
                );
              }
              return (
                <SkillPracticeListAILN
                  key={`skill-${item.level.id}`}
                  level={item.level}
                  unlocked={item.levelUnlocked}
                  expanded={expandedModules.has(item.level.id)}
                  onToggle={() => toggleModule(item.level.id)}
                  prompts={item.prompts}
                  useCases={item.useCases}
                />
              );
            })}
          </div>
        </div>
      </div>
    </PageContainerAILN>
  );
}

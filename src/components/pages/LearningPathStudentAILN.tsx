"use client";
import ChapterItemAILN from "@/components/items/ChapterItemAILN";
import LevelDividerAILN from "@/components/items/LevelDividerAILN";
import SkillPracticeListAILN from "@/components/items/SkillPracticeListAILN";
import type { SkillPracticeItem } from "@/components/items/SkillPracticeItemAILN";
import LevelLabelStudentAILN from "@/components/labels/LevelLabelStudentAILN";
import RewardLabelStudentAILN from "@/components/labels/RewardLabelStudentAILN";
import PageContainerAILN from "@/components/pages/PageContainerAILN";
import PageHeaderAILN from "@/components/titles/PageHeaderAILN";
import type { LmsLevel } from "@/apis/level";
import {
  getAssignedPromptsMock,
  getAssignedUseCasesMock,
  getChaptersProgressMock,
  getLevelProgressMock,
} from "@/mock-data/student";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

dayjs.locale("id");

type Level = LmsLevel;
type Chapter = ReturnType<typeof getChaptersProgressMock>[number];

export default function LearningPathStudentAILN({
  levels,
  currentLevelNumber,
  totalXp,
}: {
  levels: Level[];
  currentLevelNumber: number;
  totalXp: number;
}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set()
  );
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set()
  );

  const chapters = getChaptersProgressMock();
  const levelProgress = getLevelProgressMock();
  const assignedPrompts = getAssignedPromptsMock();
  const assignedUseCases = getAssignedUseCasesMock();
  const currentLevelName =
    levels.find((l) => l.level_number === currentLevelNumber)?.name ?? null;

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
    const consider = (
      row: { reviewed_at: Date | null; is_accepted: boolean },
      lvl: { level_number: number }
    ) => {
      const accepted = !!row.reviewed_at && row.is_accepted;
      if (accepted) return;
      if (lvl.level_number > currentLevelNumber) return;
      levelNumbersWithUnfinished.add(lvl.level_number);
    };
    for (const r of assignedPrompts) consider(r, r.prompt.level);
    for (const r of assignedUseCases) consider(r, r.use_case.level);
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

  const allPrompts: SkillPracticeItem[] = assignedPrompts.map((r) => ({
    id: r.id,
    ref_id: r.prompt.id,
    level: r.prompt.level,
    name: r.prompt.name,
    body: r.prompt.scenario,
    xp_reward: r.prompt.xp_reward,
    categories: r.prompt.categories,
    assigned_by: r.assigned_by,
    deadline: r.deadline,
    message: r.message,
    submitted_at: r.submitted_at,
    reviewed_at: r.reviewed_at,
    is_accepted: r.is_accepted,
  }));
  const allUseCases: SkillPracticeItem[] = assignedUseCases.map((r) => ({
    id: r.id,
    ref_id: r.use_case.id,
    level: r.use_case.level,
    name: r.use_case.name,
    body: r.use_case.description,
    xp_reward: r.use_case.xp_reward,
    categories: r.use_case.categories,
    assigned_by: r.assigned_by,
    deadline: r.deadline,
    message: r.message,
    submitted_at: r.submitted_at,
    reviewed_at: r.reviewed_at,
    is_accepted: r.is_accepted,
  }));
  const promptsByLevel = new Map<number, SkillPracticeItem[]>();
  for (const p of allPrompts) {
    const key = p.level.level_number;
    const bucket = promptsByLevel.get(key) ?? [];
    bucket.push(p);
    promptsByLevel.set(key, bucket);
  }
  const useCasesByLevel = new Map<number, SkillPracticeItem[]>();
  for (const u of allUseCases) {
    const key = u.level.level_number;
    const bucket = useCasesByLevel.get(key) ?? [];
    bucket.push(u);
    useCasesByLevel.set(key, bucket);
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

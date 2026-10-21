"use client";

import RecordUseCaseButtonAILN from "@/components/buttons/RecordUseCaseButtonAILN";
import LevelLabelStudentAILN from "@/components/labels/LevelLabelStudentAILN";
import RewardLabelStudentAILN from "@/components/labels/RewardLabelStudentAILN";

export default function StudentHeaderAILN({
  fullName,
  projectId,
  currentLevelNumber,
  totalXp,
}: {
  fullName: string;
  projectId: string;
  currentLevelNumber: number;
  totalXp: number;
}) {
  const firstName = fullName.split(" ")[0] || fullName;

  return (
    <header className="sticky top-14 z-30 -mx-4 -mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-dashboard-border bg-background/90 px-4 py-4 backdrop-blur-md lg:top-0 md:-mx-6 md:px-6 xl:-mx-8 xl:px-8">
      <h1 className="font-headline text-xl font-medium tracking-tight text-foreground dark:text-white">
        Halo, {firstName}.
      </h1>
      <div className="flex flex-wrap items-center gap-3">
        <LevelLabelStudentAILN variant="compact" levelNumber={currentLevelNumber} />
        <RewardLabelStudentAILN variant="compact" xp={totalXp} />
        <RecordUseCaseButtonAILN projectId={projectId} />
      </div>
    </header>
  );
}

"use client";

import DisabledActionButtonAILN from "@/components/buttons/DisabledActionButtonAILN";
import LevelUnlockSuccessModalAILN, {
  type LevelUnlockSuccessData,
} from "@/components/modals/LevelUnlockSuccessModalAILN";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";

const LOCKED_ICON_URL =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/level_locked.webp";

interface Level {
  id: number;
  level_number: number;
  name: string;
  icon: string | null;
}

interface LevelDividerAILNProps {
  level: Level;
  unlocked: boolean;
  claimable: boolean;
}

export default function LevelDividerAILN(props: LevelDividerAILNProps) {
  const [unlockSummary, setUnlockSummary] =
    useState<LevelUnlockSuccessData | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const iconUrl = props.unlocked
    ? (props.level.icon ?? LOCKED_ICON_URL)
    : LOCKED_ICON_URL;

  if (props.unlocked) {
    return (
      <>
        <div className="relative pl-12">
          <div className="absolute left-0 top-6 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-sm font-black text-gray-700 dark:border-dashboard-border dark:bg-black dark:text-gray-200">
            {props.level.level_number}
          </div>
          <div className="relative overflow-hidden rounded-xl border-2 border-hijau bg-gradient-to-r from-hijau-t to-white p-4 dark:border-claude/70 dark:bg-gradient-to-r dark:from-claude/15 dark:via-claude/5 dark:to-black">
            {/* Neon glitch dot pattern overlay (dark mode only) */}
            <div
              className="pointer-events-none absolute inset-0 hidden opacity-40 dark:block"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(26,122,82,0.35) 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={iconUrl}
                  alt={`Level ${props.level.level_number}`}
                  className="h-14 w-14 shrink-0"
                  width={300}
                  height={300}
                />
                <div>
                  <div className="text-sm font-bold text-claude dark:text-lime-bright">
                    Level {props.level.level_number} Unlocked!
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {props.level.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 border-gray-200 sm:border-l sm:pl-6 dark:border-claude/30">
                <div>
                  <div className="text-sm font-bold text-claude dark:text-lime-bright">
                    Congrats!
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    You&apos;ve unlocked Level {props.level.level_number}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LevelUnlockSuccessModalAILN
          isOpen={isUnlockModalOpen}
          data={unlockSummary}
          onClose={() => setIsUnlockModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative pl-12">
        <div className="absolute left-0 top-6 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-gray-400 dark:border-dashboard-border dark:bg-black dark:text-gray-500">
          <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
        </div>
        <div className="rounded-xl border border-gray-950 bg-gray-950 p-4 dark:border-claude/15 dark:bg-claude/[0.03]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={iconUrl}
                alt={`Level ${props.level.level_number} locked`}
                className="h-14 w-14 shrink-0 dark:opacity-50"
                width={300}
                height={300}
              />
              <div>
                <div className="text-xs text-gray-400 dark:text-gray-400">
                  Level {props.level.level_number} Locked
                </div>
                <div className="text-xl font-bold text-white dark:text-white">
                  {props.level.name}
                </div>
                <div className="text-sm text-gray-300 dark:text-gray-400">
                  Selesaikan semua quiz dan materi di level sebelumnya untuk
                  membuka
                </div>
              </div>
            </div>
            {props.claimable ? (
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-bold text-claude dark:text-lime-bright">
                    Ready to unlock!
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Semua quiz dan materi sudah selesai
                  </div>
                </div>
                <DisabledActionButtonAILN variant="primary" size="medium">
                  Unlock Level
                </DisabledActionButtonAILN>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-bold text-white dark:text-gray-200">
                    Keep going!
                  </div>
                  <div className="text-sm text-gray-300 dark:text-gray-400">
                    Selesaikan semua quiz dan materi di level sebelumnya
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={faLock}
                  className="h-6 w-6 text-gray-300 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <LevelUnlockSuccessModalAILN
        isOpen={isUnlockModalOpen}
        data={unlockSummary}
        onClose={() => setIsUnlockModalOpen(false)}
      />
    </>
  );
}

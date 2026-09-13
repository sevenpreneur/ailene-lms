"use client";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import SkillPracticeItemAILN, {
  deriveSkillPracticeStatus,
  type SkillPracticeItem,
} from "@/components/items/SkillPracticeItemAILN";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronDown, GraduationCap } from "lucide-react";

interface SkillPracticeListAILNProps {
  level: { id: number; level_number: number; name: string };
  unlocked: boolean;
  expanded: boolean;
  onToggle: () => void;
  prompts: SkillPracticeItem[];
  useCases: SkillPracticeItem[];
}

export default function SkillPracticeListAILN(
  props: SkillPracticeListAILNProps
) {
  const total = props.prompts.length + props.useCases.length;
  const accepted =
    props.prompts.filter((p) => deriveSkillPracticeStatus(p) === "accepted")
      .length +
    props.useCases.filter((u) => deriveSkillPracticeStatus(u) === "accepted")
      .length;

  return (
    <div className="relative pl-12">
      <div
        className={`absolute top-4 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
          props.unlocked
            ? "border-claude bg-white text-claude dark:bg-black"
            : "border-gray-300 bg-gray-100 text-gray-400 dark:border-claude/30 dark:bg-black dark:text-claude/40"
        }`}
      >
        {props.unlocked ? (
          <GraduationCap className="size-4 text-claude dark:text-lime-bright" />
        ) : (
          <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
        )}
      </div>

      <div
        className={`rounded-xl bg-card-1 border border-dashboard-border ${
          !props.unlocked ? "opacity-60 dark:opacity-50" : ""
        }`}
      >
        <button
          type="button"
          onClick={props.onToggle}
          className="flex w-full items-center justify-between gap-3 p-4 text-left sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <div className="text-xs tracking-widest uppercase text-emphasis dark:text-gray-400">
              Latihan Skill
            </div>
            <div className="text-lg font-bold dark:text-white">
              Prompt &amp; Use Case
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {props.prompts.length} prompt &middot; {props.useCases.length} use
              case
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {props.unlocked ? (
              <GeneralLabelAILN variant="green">
                {accepted}/{total} Diterima
              </GeneralLabelAILN>
            ) : (
              <GeneralLabelAILN variant="white">Locked</GeneralLabelAILN>
            )}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 dark:text-lime-bright/70 ${
                props.expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            props.expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-2 border-t border-dashboard-border px-4 py-3">
              {props.prompts.map((p) => (
                <SkillPracticeItemAILN
                  key={`prompt-${p.id}`}
                  variant="Prompt"
                  item={p}
                  unlocked={props.unlocked}
                />
              ))}
              {props.useCases.map((u) => (
                <SkillPracticeItemAILN
                  key={`usecase-${u.id}`}
                  variant="UseCase"
                  item={u}
                  unlocked={props.unlocked}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

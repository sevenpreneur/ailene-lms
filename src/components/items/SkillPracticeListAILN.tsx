"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import GeneralLabelAILN from "@/components/labels/GeneralLabelAILN";
import SkillPracticeItemAILN, {
  deriveSkillPracticeStatus,
  type SkillPracticeItem,
} from "@/components/items/SkillPracticeItemAILN";
import { ChevronDown, GraduationCap, LockKeyhole } from "lucide-react";

interface SkillPracticeListAILNProps {
  level: { id: number; level_number: number; name: string };
  unlocked: boolean;
  expanded: boolean;
  onToggle: () => void;
  prompts: SkillPracticeItem[];
  useCases: SkillPracticeItem[];
}

export default function SkillPracticeListAILN(
  props: SkillPracticeListAILNProps,
) {
  const total = props.prompts.length + props.useCases.length;
  const accepted =
    props.prompts.filter((p) => deriveSkillPracticeStatus(p) === "accepted")
      .length +
    props.useCases.filter((u) => deriveSkillPracticeStatus(u) === "accepted")
      .length;

  return (
    <div className="bg-card-1">
      <ButtonAILN
        variant="accordion"
        size="row"
        width="full"
        type="button"
        aria-expanded={props.expanded}
        aria-controls={`practice-items-${props.level.id}`}
        onClick={props.onToggle}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
              props.unlocked
                ? "bg-hijau-t text-claude dark:bg-claude/20 dark:text-lime-bright"
                : "bg-card-2 text-gray-400"
            }`}
          >
            {props.unlocked ? (
              <GraduationCap className="h-5 w-5" />
            ) : (
              <LockKeyhole className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Latihan skill
            </div>
            <div className="font-headline text-base font-medium text-gray-900 dark:text-white sm:text-lg">
              Prompt &amp; Use Case
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {props.prompts.length} prompt · {props.useCases.length} use case
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {props.unlocked ? (
            <GeneralLabelAILN variant="green">
              {accepted}/{total} Diterima
            </GeneralLabelAILN>
          ) : (
            <GeneralLabelAILN variant="white">Terkunci</GeneralLabelAILN>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-300 dark:text-lime-bright/70 ${
              props.expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </ButtonAILN>
      <div
        id={`practice-items-${props.level.id}`}
        className={`grid transition-all duration-300 ease-in-out ${
          props.expanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-dashboard-border bg-card-2/60 px-5 py-4 sm:px-6">
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
  );
}

"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import DepartmentDistributionRowAILN from "@/components/items/DepartmentDistributionRowAILN";
import LevelLegendAILN from "@/components/items/LevelLegendAILN";
import { EmptyStateAILN } from "@/components/states/DataStatesAILN";
import { formatInt } from "@/lib/ailene-format";

type DeptGroup = {
  id: number;
  name: string;
  total: number;
  levels: { level_id: number; code: string; label?: string; count: number }[];
};
type LevelMeta = { id: number; code: string; label?: string; name: string };

/**
 * Per-department competency level distribution: one 100%-stacked bar per
 * department, colored by the level maturity ramp (globals.css --ailn-level-N).
 */
export default function WorkforceLevelByDeptAILN({
  groups,
  levels,
  levelNameByCode,
  totalMembers,
}: {
  groups: DeptGroup[];
  levels: LevelMeta[];
  levelNameByCode: Map<string, string>;
  totalMembers: number;
}) {
  return (
    <SectionContainerAILN
      title="Distribusi Level per Departemen"
      desc={`${groups.length} departemen · ${formatInt(totalMembers)} karyawan`}
      headerRight={<LevelLegendAILN levels={levels} />}
      contentClassName="flex flex-col gap-3"
    >
      {groups.length === 0 ? (
        <EmptyStateAILN>Belum ada departemen.</EmptyStateAILN>
      ) : (
        groups.map((group) => (
          <DepartmentDistributionRowAILN
            key={group.id}
            group={group}
            levelNameByCode={levelNameByCode}
          />
        ))
      )}
    </SectionContainerAILN>
  );
}

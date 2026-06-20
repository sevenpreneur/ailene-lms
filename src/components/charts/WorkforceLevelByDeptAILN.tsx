"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import DepartmentDistributionRowAILN from "@/components/items/DepartmentDistributionRowAILN";
import LevelLegendAILN from "@/components/items/LevelLegendAILN";
import { EmptyStateAILN } from "@/components/states/DataStatesAILN";
import { formatInt } from "@/lib/format";

type DeptGroup = {
  id: number;
  name: string;
  total: number;
  levels: { level_id: number; code: string; label?: string; count: number }[];
};
type LevelMeta = { id: number; code: string; label?: string; name: string };

// Level 0 is excluded from the distribution view; bars/totals rebase to L1+.
const HIDDEN_LEVEL_CODE = "L0";

/**
 * Per-department competency level distribution: one 100%-stacked bar per
 * department, colored by the level maturity ramp (globals.css --ailn-level-N).
 */
export default function WorkforceLevelByDeptAILN({
  groups,
  levels,
  levelNameByCode,
}: {
  groups: DeptGroup[];
  levels: LevelMeta[];
  levelNameByCode: Map<string, string>;
}) {
  const visibleLevels = levels.filter((l) => l.code !== HIDDEN_LEVEL_CODE);
  // Drop L0 segments and rebase each department total so bars fill 100% of L1+.
  const visibleGroups = groups.map((group) => {
    const levels = group.levels.filter((l) => l.code !== HIDDEN_LEVEL_CODE);
    return {
      ...group,
      levels,
      total: levels.reduce((sum, l) => sum + l.count, 0),
    };
  });
  const visibleTotal = visibleGroups.reduce((sum, g) => sum + g.total, 0);

  return (
    <SectionContainerAILN
      title="Distribusi Level per Departemen"
      desc={`${visibleGroups.length} departemen · ${formatInt(visibleTotal)} karyawan`}
      headerRight={<LevelLegendAILN levels={visibleLevels} />}
      contentClassName="flex flex-col gap-3"
    >
      {visibleGroups.length === 0 ? (
        <EmptyStateAILN>Belum ada departemen.</EmptyStateAILN>
      ) : (
        visibleGroups.map((group) => (
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

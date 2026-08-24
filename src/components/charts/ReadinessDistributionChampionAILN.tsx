"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import LegendStatAILN from "@/components/items/LegendStatAILN";
import { EmptyHintAILN } from "@/components/states/DataStatesAILN";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatInt, formatScore } from "@/lib/format";
import { getPreAssessmentTeamMock } from "@/mock-data/champion";
import { Cell, Pie, PieChart } from "recharts";

// Readiness tier colors (green = good → red = needs basics).
const READY_GREEN = "#1f5f4e";
const DEVELOPING_AMBER = "#f59e0b";
const BASIC_RED = "#ef4444";

const donutConfig = {
  ready: { label: "Siap akselerasi", color: READY_GREEN },
  developing: { label: "Berkembang", color: DEVELOPING_AMBER },
  basic: { label: "Perlu dasar", color: BASIC_RED },
} satisfies ChartConfig;

// Member readiness mix as a donut, team average baseline in the center.
export default function ReadinessDistributionChampionAILN() {
  const data = getPreAssessmentTeamMock();

  return (
    <SectionContainerAILN
      title="Distribusi Kesiapan Anggota"
      desc={`Komposisi ${formatInt(
        data.completed_count
      )} anggota berdasarkan rata-rata baseline`}
    >
      {data.departments.length === 0 ? (
        <EmptyHintAILN className="h-40">Belum ada data.</EmptyHintAILN>
      ) : (
        <ReadinessDonut
          ready={data.readiness.ready}
          developing={data.readiness.developing}
          basic={data.readiness.basic}
          teamAvg={data.team_avg}
        />
      )}
    </SectionContainerAILN>
  );
}

function ReadinessDonut({
  ready,
  developing,
  basic,
  teamAvg,
}: {
  ready: number;
  developing: number;
  basic: number;
  teamAvg: number;
}) {
  const donutData = [
    { key: "ready", label: "Siap akselerasi", value: ready, fill: READY_GREEN },
    {
      key: "developing",
      label: "Berkembang",
      value: developing,
      fill: DEVELOPING_AMBER,
    },
    { key: "basic", label: "Perlu dasar", value: basic, fill: BASIC_RED },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      <div className="relative">
        <ChartContainer config={donutConfig} className="aspect-square h-40">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="label"
              innerRadius={50}
              outerRadius={68}
              paddingAngle={2}
              cornerRadius={4}
              strokeWidth={0}
            >
              {donutData.map((d) => (
                <Cell key={d.key} fill={d.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none text-foreground">
            {formatScore(teamAvg)}
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground">
            rata-rata tim
          </span>
        </div>
      </div>
      <div className="flex w-48 flex-col gap-2">
        <LegendStatAILN
          color={READY_GREEN}
          label="Siap akselerasi (≥2,5)"
          value={ready}
        />
        <LegendStatAILN
          color={DEVELOPING_AMBER}
          label="Berkembang (1,5–2,5)"
          value={developing}
        />
        <LegendStatAILN
          color={BASIC_RED}
          label="Perlu dasar (<1,5)"
          value={basic}
        />
      </div>
    </div>
  );
}

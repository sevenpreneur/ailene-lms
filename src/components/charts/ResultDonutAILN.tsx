"use client";
import {
  TARGET_LEVEL,
  deriveTarget,
  type LevelDist,
} from "@/components/charts/outcome-target";
import LegendStatAILN from "@/components/items/LegendStatAILN";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";

const BRAND_GREEN = "#1f5f4e"; // reached target
const SLATE_200 = "#e2e8f0"; // not yet reached

const donutConfig = {
  reached: { label: "Sudah", color: BRAND_GREEN },
  below: { label: "Belum", color: SLATE_200 },
} satisfies ChartConfig;

/** Result: donut of reached vs not-yet ≥ TARGET_LEVEL, % in the center. */
export default function ResultDonutAILN({
  distribution,
}: {
  distribution: LevelDist;
}) {
  const { reached, below, currentPct } = deriveTarget(distribution);
  const donutData = [
    {
      key: "reached",
      label: `≥ L${TARGET_LEVEL}`,
      value: reached,
      fill: BRAND_GREEN,
    },
    { key: "below", label: "Belum", value: below, fill: SLATE_200 },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
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
            {currentPct}%
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground">
            ≥ L{TARGET_LEVEL}
          </span>
        </div>
      </div>
      <div className="flex w-44 flex-col gap-2 text-sm">
        <LegendStatAILN
          color={BRAND_GREEN}
          label={`Sudah ≥ L${TARGET_LEVEL}`}
          value={reached}
        />
        <LegendStatAILN color={SLATE_200} label="Belum" value={below} />
      </div>
    </div>
  );
}

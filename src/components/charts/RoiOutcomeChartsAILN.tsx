"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCompactIdr, formatDecimal } from "@/lib/format";
import type { DepartmentRoi, RoiTrend } from "@/apis/sponsor";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

const SPONSOR = "var(--stakeholder-sponsor)";
const PROJECTED = "#94a3b8";
const DEPT_COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#fb923c",
  "#ec4899",
  "#fbbf24",
  "#a855f7",
];

const roiConfig = {
  actual_roi_billion: { label: "ROI aktual", color: SPONSOR },
  projected_roi_billion: { label: "Proyeksi", color: PROJECTED },
} satisfies ChartConfig;

const departmentConfig = {
  hours_saved_weekly: { label: "Jam dihemat/mg", color: SPONSOR },
} satisfies ChartConfig;

function formatIdrShort(value: number): string {
  const compact = formatCompactIdr(value);
  return compact.suffix ? `Rp ${compact.value} ${compact.suffix}` : `Rp ${compact.value}`;
}

export default function RoiOutcomeChartsAILN({
  roiTrend,
  departmentRoi,
}: {
  roiTrend: RoiTrend | null;
  departmentRoi: DepartmentRoi | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <RoiTrendCard months={roiTrend?.months ?? []} />
      <DepartmentHoursCard departments={departmentRoi?.departments ?? []} />
    </div>
  );
}

function RoiTrendCard({ months }: { months: RoiTrend["months"] }) {
  const first = months[0];
  const lastActual = [...months].reverse().find((month) => !month.projected);
  const target = months[months.length - 1];
  const firstProjectedIndex = months.findIndex((month) => month.projected);
  const data = months.map((month, index) => ({
    ...month,
    actual_roi_billion: !month.projected ? month.roi_billion : null,
    projected_roi_billion:
      month.projected || index === firstProjectedIndex - 1
        ? month.roi_billion
        : null,
  }));

  return (
    <SectionContainerAILN
      title="Tren Nilai ROI · 6 Bulan"
      desc="Nilai Rupiah/bulan (miliar) · proyeksi (garis putus)"
    >
      <div className="h-72">
        <ChartContainer config={roiConfig} className="aspect-auto h-full w-full">
          <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={58}
              fontSize={11}
              tickFormatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")} M`}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)" }}
              content={
                <ChartTooltipContent
                  labelKey="month"
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {name === "projected_roi_billion" ? "Proyeksi" : "Aktual"}
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        Rp {Number(value).toLocaleString("id-ID")} M
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              dataKey="actual_roi_billion"
              type="monotone"
              stroke={SPONSOR}
              strokeWidth={3}
              connectNulls={false}
              dot={{ r: 4, fill: SPONSOR, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              dataKey="projected_roi_billion"
              type="monotone"
              stroke={PROJECTED}
              strokeWidth={3}
              strokeDasharray="6 6"
              connectNulls={false}
              dot={{ r: 4, fill: PROJECTED, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <span className="text-muted-foreground">
          M1: {first ? formatIdrShort(first.roi_value) : "—"}
        </span>
        <span className="text-center font-bold text-foreground">
          {lastActual ? `${lastActual.label}: ${formatIdrShort(lastActual.roi_value)}` : "—"}
        </span>
        <span className="text-right text-muted-foreground">
          Target M6: {target ? formatIdrShort(target.roi_value) : "—"}
        </span>
      </div>
    </SectionContainerAILN>
  );
}

function DepartmentHoursCard({
  departments,
}: {
  departments: DepartmentRoi["departments"];
}) {
  const data = departments.slice(0, 7).map((department) => ({
    ...department,
    short_name:
      department.name.length > 14
        ? department.name
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
        : department.name,
  }));

  return (
    <SectionContainerAILN
      title="Jam Dihemat per Departemen"
      desc="Per minggu · manager-validated"
    >
      <div className="h-72">
        <ChartContainer
          config={departmentConfig}
          className="aspect-auto h-full w-full"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            barCategoryGap="24%"
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              type="category"
              dataKey="short_name"
              tickLine={false}
              axisLine={false}
              width={88}
              fontSize={12}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              content={
                <ChartTooltipContent
                  labelKey="name"
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">Jam/minggu</span>
                      <span className="font-medium tabular-nums text-foreground">
                        {formatDecimal(Number(value))} jam
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="hours_saved_weekly" radius={[6, 6, 6, 6]}>
              {data.map((department, index) => (
                <Cell
                  key={department.id}
                  fill={DEPT_COLORS[index % DEPT_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </SectionContainerAILN>
  );
}

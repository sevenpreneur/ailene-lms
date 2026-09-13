"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import { formatCompactIdr, formatDecimal, formatInt } from "@/lib/format";
import type { DepartmentRoi } from "@/apis/sponsor";

const COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#f97316",
  "#ec4899",
  "#fbbf24",
  "#a855f7",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function idrShort(value: number): string {
  const compact = formatCompactIdr(value);
  return compact.suffix
    ? `Rp ${compact.value} ${compact.suffix}`
    : `Rp ${compact.value}`;
}

export default function RoiDepartmentTableAILN({
  data: payload,
}: {
  data: DepartmentRoi | null;
}) {
  const data = payload ?? { total_roi_annualized: 0, departments: [] };

  return (
    <SectionContainerAILN
      title="Rincian ROI per Departemen"
      desc="Nilai Rupiah dihitung dari jam dihemat × rata-rata biaya jam karyawan"
      contentClassName="-mx-6 -mb-6"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-y border-dashboard-border bg-muted/60 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-8 py-4">Departemen</th>
              <th className="px-5 py-4 text-right">Jumlah</th>
              <th className="px-5 py-4 text-right">Jam Dihemat/Mg</th>
              <th className="px-5 py-4 text-right">Nilai Rp/Tahun</th>
              <th className="px-8 py-4 text-right">Kontribusi</th>
            </tr>
          </thead>
          <tbody>
            {data.departments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-12 text-center text-muted-foreground"
                >
                  Belum ada data ROI departemen.
                </td>
              </tr>
            ) : (
              data.departments.map((department, index) => {
                const color = COLORS[index % COLORS.length];
                return (
                  <tr
                    key={department.id}
                    className="border-b border-dashboard-border transition hover:bg-muted/40"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${color} 16%, white)`,
                            color,
                          }}
                        >
                          {initials(department.name)}
                        </span>
                        <span className="font-bold text-foreground">
                          {department.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-right font-semibold tabular-nums text-foreground">
                      {formatInt(department.member_count)}
                    </td>
                    <td className="px-5 py-5 text-right font-semibold tabular-nums text-foreground">
                      {formatDecimal(department.hours_saved_weekly)}
                    </td>
                    <td className="px-5 py-5 text-right font-semibold tabular-nums text-foreground">
                      {idrShort(department.roi_annualized)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="w-14 tabular-nums font-semibold text-foreground">
                          {formatDecimal(department.contribution_percent)}%
                        </span>
                        <span className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${Math.min(100, department.contribution_percent)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </SectionContainerAILN>
  );
}

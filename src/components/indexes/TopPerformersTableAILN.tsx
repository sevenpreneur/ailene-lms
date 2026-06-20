import { formatDecimal } from "@/lib/format";

type Performer = {
  rank: number;
  member_id: number;
  full_name: string;
  department: string;
  level_code: string;
  composite: number;
  use_case_count: number;
  hours: number;
};

/**
 * Org-wide top performers leaderboard table (outcome report): rank, name,
 * department, level pill, composite score bar, use-case count, hours saved.
 */
export default function TopPerformersTableAILN({
  list,
}: {
  list: Performer[];
}) {
  return (
    <div className="max-h-[640px] overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-white dark:bg-card-1">
          <tr className="border-b border-dashboard-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2 pr-3 font-semibold">#</th>
            <th className="pb-2 pr-3 font-semibold">Karyawan</th>
            <th className="pb-2 pr-3 font-semibold">Departemen</th>
            <th className="pb-2 pr-3 font-semibold">Level</th>
            <th className="pb-2 pr-3 font-semibold">Composite</th>
            <th className="pb-2 pr-3 text-right font-semibold">Use case</th>
            <th className="pb-2 text-right font-semibold">Jam</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr
              key={p.member_id}
              className="border-b border-dashboard-border/60 last:border-0"
            >
              <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">
                {p.rank}
              </td>
              <td className="py-2.5 pr-3 font-medium text-foreground">
                {p.full_name}
              </td>
              <td className="py-2.5 pr-3 text-muted-foreground">
                {p.department}
              </td>
              <td className="py-2.5 pr-3">
                <span className="inline-flex items-center rounded-full border border-dashboard-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground dark:bg-card-2 ">
                  {p.level_code}
                </span>
              </td>
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, p.composite))}%`,
                      }}
                    />
                  </div>
                  <span className="w-7 text-right tabular-nums font-semibold text-foreground">
                    {p.composite}
                  </span>
                </div>
              </td>
              <td className="py-2.5 pr-3 text-right tabular-nums text-muted-foreground">
                {p.use_case_count}
              </td>
              <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                {formatDecimal(p.hours)}j
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

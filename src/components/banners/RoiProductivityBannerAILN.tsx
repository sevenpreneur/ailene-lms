"use client";
import { formatCompactIdr, formatDecimal, formatInt } from "@/lib/format";
import { trpc } from "@/trpc/client";

function idrText(value: number): string {
  const compact = formatCompactIdr(value);
  const suffix =
    compact.suffix === "M" ? "miliar" : compact.suffix === "jt" ? "juta" : "";
  return `Rp ${compact.value}${suffix ? ` ${suffix}` : ""}`;
}

export default function RoiProductivityBannerAILN() {
  const overviewQ = trpc.read.outcome.overview.useQuery();
  const deptQ = trpc.read.outcome.departmentRoi.useQuery();

  const overview = overviewQ.data;
  const totalAnnualRoi = deptQ.data?.total_roi_annualized ?? overview?.roi_total ?? 0;
  const ratePerHour = overview?.roi_rate_per_hour ?? 250_000;
  const weeklyHours =
    totalAnnualRoi > 0 ? Math.round((totalAnnualRoi / ratePerHour / 52) * 10) / 10 : 0;
  const monthlyHours = Math.round(weeklyHours * 4 * 10) / 10;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-stakeholder-sponsor/20 bg-gradient-to-br from-stakeholder-sponsor-soft via-white to-sky-50 px-8 py-8 dark:via-card-1 dark:to-blue-950/20">
      <div className="relative z-10 max-w-5xl lg:max-w-[56rem] lg:pr-72">
        <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-stakeholder-sponsor">
          ★ Nilai Program · Annualized
        </div>
        <h2 className="max-w-5xl text-[28px] font-black leading-tight tracking-normal text-foreground md:text-4xl xl:text-[44px]">
          ~
          <span className="text-state-success">
            {formatInt(Math.round(weeklyHours))} jam
          </span>{" "}
          dihemat/minggu →{" "}
          <span className="text-stakeholder-sponsor">
            {idrText(totalAnnualRoi)}/tahun
          </span>
        </h2>
        <p className="mt-5 text-xl text-foreground">
          Setara{" "}
          <span className="font-bold">
            {formatDecimal(monthlyHours)} jam/bulan
          </span>{" "}
          produktivitas yang dikembalikan ke bisnis Anda
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Manager-validated · defensible · setiap angka punya sumber data konkret
        </p>
      </div>

      <div className="pointer-events-none absolute right-10 top-10 hidden h-44 w-80 opacity-80 lg:block">
        <div className="absolute inset-x-0 bottom-2 h-28 rounded-t-[100%] bg-gradient-to-t from-stakeholder-sponsor/12 to-transparent" />
        <svg viewBox="0 0 320 160" className="h-full w-full">
          <polyline
            fill="none"
            stroke="var(--stakeholder-sponsor)"
            strokeWidth="4"
            points="8,118 58,104 110,92 154,73 210,57 260,48 312,35"
          />
        </svg>
      </div>
    </section>
  );
}

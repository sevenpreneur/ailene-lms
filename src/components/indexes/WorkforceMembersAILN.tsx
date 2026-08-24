"use client";
import SectionContainerAILN from "@/components/cards/SectionContainerAILN";
import GeneralLabelAILN, {
  type GeneralLabelVariantAILN,
} from "@/components/labels/GeneralLabelAILN";
import { formatInt } from "@/lib/format";
import { getWorkforceMembersMock } from "@/mock-data/sponsor";
import { Check, ChevronDown, Minus } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type WorkforceMembers = ReturnType<typeof getWorkforceMembersMock>;
type WorkforceMember = WorkforceMembers["list"][number];
type SortKey = "score" | "hours" | "level" | "name";

const ROW_LIMIT = 12;

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "score", label: "Skor" },
  { key: "hours", label: "Jam" },
  { key: "level", label: "Level" },
  { key: "name", label: "Nama" },
];

const avatarGradients = [
  "from-fuchsia-500 to-pink-500",
  "from-sky-500 to-blue-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-green-500",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDecimal(value: number): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function MemberAvatar({ member }: { member: WorkforceMember }) {
  if (member.user.avatar) {
    return (
      <Image
        src={member.user.avatar}
        alt={member.user.full_name}
        width={36}
        height={36}
        unoptimized
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  const gradient =
    avatarGradients[hashString(member.user.full_name) % avatarGradients.length];

  return (
    <div
      className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[11px] font-bold text-white`}
    >
      {getInitials(member.user.full_name)}
    </div>
  );
}

function levelVariant(levelNumber: number): GeneralLabelVariantAILN {
  if (levelNumber <= 0) return "white";
  if (levelNumber === 1) return "yellow";
  if (levelNumber === 2) return "blue";
  return "green";
}

function SegmentLabel({ segment }: { segment: WorkforceMember["segment"] }) {
  const variant: GeneralLabelVariantAILN =
    segment === "Promotor"
      ? "green"
      : segment === "Netral"
        ? "white"
        : "yellow";

  return <GeneralLabelAILN variant={variant}>{segment}</GeneralLabelAILN>;
}

function StatusLabel({ status }: { status: WorkforceMember["status"] }) {
  if (status.kind === "on_track") {
    return (
      <GeneralLabelAILN variant="green" icon={<Check className="size-4" />}>
        {status.label}
      </GeneralLabelAILN>
    );
  }
  if (status.kind === "at_risk") {
    return (
      <GeneralLabelAILN variant="yellow" icon={<Minus className="size-4" />}>
        {status.label}
      </GeneralLabelAILN>
    );
  }

  return (
    <GeneralLabelAILN variant="white" icon={<Minus className="size-4" />}>
      {status.label}
    </GeneralLabelAILN>
  );
}

function FilterLabel({
  active,
  count,
  children,
}: {
  active: boolean;
  count: number;
  children: ReactNode;
}) {
  return (
    <GeneralLabelAILN
      variant="white"
      className={
        active
          ? "border-blue-500 bg-blue-500/10 px-4 py-2 text-sm text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-300"
          : "border-dashboard-border px-4 py-2 text-sm text-gray-600 hover:border-blue-300 dark:text-gray-300 dark:hover:border-blue-400/40"
      }
    >
      <span>{children}</span>
      <span
        className={`inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white ${
          active ? "bg-blue-600" : "bg-gray-400 dark:bg-gray-600"
        }`}
      >
        {count}
      </span>
    </GeneralLabelAILN>
  );
}

function sortMembers(members: WorkforceMember[], sort: SortKey) {
  return [...members].sort((a, b) => {
    if (sort === "score") {
      return (
        b.score - a.score || a.user.full_name.localeCompare(b.user.full_name)
      );
    }
    if (sort === "hours") {
      return (
        b.hours_saved_weekly - a.hours_saved_weekly ||
        a.user.full_name.localeCompare(b.user.full_name)
      );
    }
    if (sort === "level") {
      return (
        b.current_level.level_number - a.current_level.level_number ||
        b.score - a.score ||
        a.user.full_name.localeCompare(b.user.full_name)
      );
    }
    return a.user.full_name.localeCompare(b.user.full_name);
  });
}

export default function WorkforceMembersAILN() {
  const data = getWorkforceMembersMock();
  const [departmentId, setDepartmentId] = useState<number | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("score");

  const rows = useMemo(() => {
    const filtered =
      departmentId === "ALL"
        ? data.list
        : data.list.filter((member) => member.department?.id === departmentId);
    return sortMembers(filtered, sort);
  }, [departmentId, data.list, sort]);
  const departmentCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const member of data.list) {
      if (!member.department) continue;
      counts.set(
        member.department.id,
        (counts.get(member.department.id) ?? 0) + 1
      );
    }
    return counts;
  }, [data.list]);

  const visibleRows = rows.slice(0, ROW_LIMIT);
  const activeSort = sortOptions.find((option) => option.key === sort);

  return (
    <SectionContainerAILN
      title="Drill-down per Karyawan"
      desc={`Menampilkan ${formatInt(visibleRows.length)} dari ${formatInt(rows.length)} karyawan · filter per departemen`}
      contentClassName="-mx-6 -mb-6"
      headerRight={
        <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
          Sortir:
          <span className="relative inline-flex items-center">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="appearance-none bg-transparent py-1 pl-1 pr-6 font-semibold text-foreground outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 size-4" />
          </span>
          <span className="sr-only">{activeSort?.label}</span>
        </label>
      }
    >
      <div className="px-6 pb-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDepartmentId("ALL")}
            className="rounded-full"
          >
            <FilterLabel active={departmentId === "ALL"} count={data.total}>
              Semua
            </FilterLabel>
          </button>
          {data.departments.map((department) => (
            <button
              key={department.id}
              type="button"
              onClick={() => setDepartmentId(department.id)}
              className="rounded-full"
            >
              <FilterLabel
                active={departmentId === department.id}
                count={departmentCounts.get(department.id) ?? 0}
              >
                {department.name}
              </FilterLabel>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-dashboard-border bg-muted/60 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-8 py-4">Nama</th>
              <th className="px-5 py-4">Departemen</th>
              <th className="px-5 py-4">Level</th>
              <th className="px-5 py-4">Skor</th>
              <th className="px-5 py-4">Segmen</th>
              <th className="px-5 py-4 text-right">Jam Dihemat/Mg</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-8 py-12 text-center text-[13px] text-muted-foreground"
                >
                  Tidak ada karyawan pada filter ini.
                </td>
              </tr>
            ) : (
              visibleRows.map((member) => (
                <tr
                  key={member.member_id}
                  className="border-b border-dashboard-border transition hover:bg-muted/40"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <MemberAvatar member={member} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {member.user.full_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-sm text-foreground">
                    {member.department?.name ?? "-"}
                  </td>
                  <td className="px-5 py-5">
                    <GeneralLabelAILN
                      variant={levelVariant(member.current_level.level_number)}
                    >
                      Level {member.current_level.level_number}
                    </GeneralLabelAILN>
                  </td>
                  <td className="px-5 py-5 text-[15px] font-bold tabular-nums text-foreground">
                    {formatDecimal(member.score)}
                  </td>
                  <td className="px-5 py-5">
                    <SegmentLabel segment={member.segment} />
                  </td>
                  <td className="px-5 py-5 text-right text-[15px] font-bold tabular-nums text-foreground">
                    {formatDecimal(member.hours_saved_weekly)}
                  </td>
                  <td className="px-8 py-5">
                    <StatusLabel status={member.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionContainerAILN>
  );
}

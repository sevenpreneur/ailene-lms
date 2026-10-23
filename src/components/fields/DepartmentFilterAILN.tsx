"use client";

import { Building2 } from "lucide-react";
import { useId } from "react";
import SelectAILN from "./SelectAILN";

/** Shared department picker for report filters. */
export default function DepartmentFilterAILN({
  departments,
  totalMembers,
  groupId,
  onChange,
}: {
  departments: { id: number; name: string; member_count: number }[];
  totalMembers: number;
  groupId: number | undefined;
  onChange: (id: number | undefined) => void;
}) {
  const id = useId();
  return (
    <div className="w-full sm:w-64">
      <SelectAILN
        selectId={id}
        aria-label="Filter departemen"
        selectIcon={<Building2 />}
        selectPlaceholder="Pilih departemen"
        value={groupId ?? null}
        onChange={(value) =>
          onChange(typeof value === "number" ? value : undefined)
        }
        options={[
          { value: null, label: `Semua departemen (${totalMembers})` },
          ...departments.map((department) => ({
            value: department.id,
            label: `${department.name} (${department.member_count})`,
          })),
        ]}
      />
    </div>
  );
}

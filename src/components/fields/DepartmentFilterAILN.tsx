"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import { Building2, ChevronDown } from "lucide-react";
import { useState } from "react";

/**
 * Department picker dropdown for the Sponsor pre-assessment view. "Semua" is
 * the default (undefined group), followed by each department with its member
 * count.
 */
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
  const [open, setOpen] = useState(false);
  const selected = groupId ? departments.find((d) => d.id === groupId) : null;
  const label = selected ? selected.name : `Semua (${departments.length})`;

  return (
    <div className="relative">
      <ButtonAILN
        variant="outline"
        size="medium"
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        <Building2 className="size-4 text-gray-400" />
        Departemen: {label}
        <ChevronDown className="size-4 text-gray-400" />
      </ButtonAILN>

      {open && (
        <>
          <ButtonAILN
            variant="backdropClear"
            size="bare"
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 z-20 mt-1 max-h-72 w-64 overflow-auto rounded-lg border border-dashboard-border bg-white py-1 shadow-lg dark:bg-card-1">
            <DeptItem
              active={!groupId}
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Semua departemen ({totalMembers})
            </DeptItem>
            {departments.map((d) => (
              <DeptItem
                key={d.id}
                active={groupId === d.id}
                onClick={() => {
                  onChange(d.id);
                  setOpen(false);
                }}
              >
                {d.name} ({d.member_count})
              </DeptItem>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DeptItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <ButtonAILN
      variant={active ? "menuActive" : "menu"}
      size="row"
      width="full"
      type="button"
      onClick={onClick}
    >
      {children}
    </ButtonAILN>
  );
}

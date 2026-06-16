"use client";
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-dashboard-border bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:bg-card-1 dark:text-gray-200 dark:hover:bg-card-2"
      >
        <Building2 className="size-4 text-gray-400" />
        Departemen: {label}
        <ChevronDown className="size-4 text-gray-400" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute left-0 z-20 mt-1 max-h-72 w-64 overflow-auto rounded-md border border-dashboard-border bg-white py-1 shadow-lg dark:bg-card-1">
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
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-card-2 ${
        active
          ? "font-semibold text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

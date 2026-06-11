"use client";
import { trpc } from "@/trpc/client";
import { Star } from "lucide-react";
import Image from "next/image";

// Pill labels Current Level & Total XP untuk header dashboard student.
// Fetch datanya sendiri via trpc (checkAilMember) — pemanggilan di level
// komponen. React Query dedupe dengan query yang sama di parent, jadi tidak
// menambah request. Render dua pill berdampingan (fragment) supaya gap dari
// flex container parent tetap berlaku di antara pill & elemen sebelah.
export default function MemberStatsLabelAILN() {
  const memberQ = trpc.auth.checkAilMember.useQuery();
  const member = memberQ.data?.ail_member;

  if (!member) return null;

  return (
    <>
      {/* Current Level — flat, no shadow */}
      <div className="flex h-9 items-center gap-2 rounded-full border border-dashboard-border bg-white px-3 dark:border-red-500/30 dark:bg-red-500/5">
        {member.current_level?.icon && (
          <Image
            src={member.current_level.icon}
            alt={member.current_level.name}
            width={24}
            height={24}
            className="h-5 w-5"
          />
        )}
        <div className="text-sm font-semibold dark:text-white">
          Level {member.current_level?.level_number ?? 0}
        </div>
      </div>

      {/* Total XP — flat, no shadow */}
      <div className="flex h-9 items-center gap-2 rounded-full border border-dashboard-border bg-white px-3 dark:border-red-500/30 dark:bg-red-500/5">
        <Star
          className="size-4 text-amber-500 dark:text-amber-400"
          fill="currentColor"
        />
        <div className="text-sm font-semibold dark:text-white">
          {member.total_xp.toLocaleString()} XP
        </div>
      </div>
    </>
  );
}

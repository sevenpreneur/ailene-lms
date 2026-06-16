import { Users } from "lucide-react";

type Member = {
  full_name: string;
  avatar: string | null;
  job_title: string;
  level_number: number;
  status: string;
  needs_attention: boolean;
  accepted_use_cases: number;
};

/**
 * Group-member row in the "Anggota" list. Members flagged `needs_attention`
 * get an amber left-border + tint so laggards stand out.
 */
export default function AttentionMemberRowAILN({
  member,
}: {
  member: Member;
}) {
  const lagging = member.needs_attention;
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_3rem_4rem_5rem] items-center gap-3 border-t border-dashboard-border px-5 py-3 ${
        lagging
          ? "border-l-4 border-l-amber-400 bg-amber-50/70 dark:bg-amber-500/10"
          : "bg-white dark:bg-card-1"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <MemberAvatar name={member.full_name} src={member.avatar} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {member.full_name}
          </div>
          <div className="truncate text-xs text-gray-500 dark:text-gray-400">
            {member.job_title}
          </div>
        </div>
      </div>
      <span className="text-center text-sm font-bold text-gray-900 dark:text-white">
        L{member.level_number}
      </span>
      <span className="text-center text-[11px] font-medium text-gray-500 dark:text-gray-400">
        {member.accepted_use_cases} uc
      </span>
      <span
        className={`text-right text-[11px] font-medium ${
          lagging
            ? "text-amber-700 dark:text-amber-300"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {member.status}
      </span>
    </div>
  );
}

function MemberAvatar({ name, src }: { name: string; src: string | null }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashboard-border bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
      {initials || <Users className="size-4" />}
    </div>
  );
}

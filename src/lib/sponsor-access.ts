export const SPONSOR_ACCESS_MEMBER_IDS = [5] as const;

export function canAccessSponsor(member: {
  id: number;
  role: string;
}): boolean {
  return (
    member.role === "SPONSOR" ||
    SPONSOR_ACCESS_MEMBER_IDS.includes(
      member.id as (typeof SPONSOR_ACCESS_MEMBER_IDS)[number]
    )
  );
}

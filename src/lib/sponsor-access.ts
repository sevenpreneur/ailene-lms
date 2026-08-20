export const SPONSOR_ACCESS_MEMBER_IDS = [1, 5, 6, 9] as const;

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

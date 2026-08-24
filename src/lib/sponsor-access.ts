export function canAccessSponsor(member: { role: string }): boolean {
  return member.role === "SPONSOR";
}

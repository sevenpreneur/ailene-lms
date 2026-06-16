// Loading skeleton for the Sponsor org level-distribution page.
export default function SkeletonLevelDistributionAILN() {
  return (
    <div className="flex w-full flex-col gap-4 animate-pulse">
      <div className="h-20 rounded-lg bg-muted" />
      <div className="h-14 rounded-lg bg-muted" />
      <div className="h-96 rounded-lg bg-muted" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-44 rounded-lg bg-muted" />
        <div className="h-44 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

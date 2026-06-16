// Loading skeleton for the Sponsor group-detail page.
export default function SkeletonGroupDetailAILN() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5">
      <div className="h-20 rounded-lg bg-gray-100 dark:bg-dashboard-border" />
      <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-dashboard-border xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 border-r border-dashboard-border bg-gray-100 last:border-r-0 dark:bg-dashboard-border"
          />
        ))}
      </div>
      <div className="h-32 rounded-lg bg-gray-100 dark:bg-dashboard-border" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-lg bg-gray-100 dark:bg-dashboard-border" />
        <div className="h-72 rounded-lg bg-gray-100 dark:bg-dashboard-border" />
      </div>
    </div>
  );
}

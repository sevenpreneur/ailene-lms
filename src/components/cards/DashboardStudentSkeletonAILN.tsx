export default function DashboardStudentSkeletonAILN() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-40 rounded bg-gray-200 dark:bg-dashboard-border" />
          <div className="h-7 w-56 rounded bg-gray-200 dark:bg-dashboard-border" />
        </div>
        <div className="flex items-center gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md bg-white p-3 shadow-sm dark:border dark:border-red-500/30 dark:bg-red-500/5 dark:shadow-[0_0_16px_rgba(239,68,68,0.15)]"
            >
              <div className="h-8 w-8 rounded bg-gray-200 dark:bg-dashboard-border" />
              <div className="flex flex-col gap-1.5">
                <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-dashboard-border" />
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-dashboard-border" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-36 rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-[360px] rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1" />
        <div className="h-[360px] rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1" />
        <div className="h-[360px] rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1" />
      </div>
    </div>
  );
}

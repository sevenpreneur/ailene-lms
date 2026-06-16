// Loading skeleton for the Sponsor executive-view dashboard: header, KPI strip,
// trend + distribution row.
export default function SkeletonExecutiveViewAILN() {
  return (
    <div className="flex w-full flex-col gap-6 animate-pulse">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-48 rounded bg-muted" />
          <div className="h-8 w-56 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
        </div>
        <div className="h-9 w-72 rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="ailn-card min-h-40 p-4">
            <div className="h-3 w-36 rounded bg-muted" />
            <div className="mt-4 h-10 w-24 rounded bg-muted" />
            <div className="mt-8 h-11 w-full rounded bg-muted/60" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="ailn-card h-96" />
        <div className="flex flex-col gap-4">
          <div className="ailn-card h-48" />
          <div className="ailn-card h-48" />
        </div>
      </div>
    </div>
  );
}

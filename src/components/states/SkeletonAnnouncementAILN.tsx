// Loading skeleton for the Sponsor announcement editor (form + preview aside).
export default function SkeletonAnnouncementAILN() {
  return (
    <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
      <div className="h-[480px] rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1" />
      <div className="h-[320px] rounded-lg border border-dashboard-border bg-gray-100 dark:bg-card-1" />
    </div>
  );
}

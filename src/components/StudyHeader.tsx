type StudyHeaderProps = {
  progressText: string;
  sideHint: string;
  languageBadge: string;
  progressPercentage: number;
};

export function StudyHeader({
  progressText,
  sideHint,
  languageBadge,
  progressPercentage,
}: StudyHeaderProps) {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{progressText}</div>
          <div className="text-sm text-muted-foreground">{sideHint}</div>
        </div>

        <span className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
          {languageBadge}
        </span>
      </div>

      <div className="mb-3">
        <div
          className="h-[0.55rem] rounded-full bg-muted"
          role="progressbar"
          aria-label="Progreso de repaso"
          aria-valuenow={progressPercentage}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          {progressPercentage}%
        </div>
      </div>
    </>
  );
}
type StudyHeaderProps = {
  progressText: string;
  sideHint: string;
  languageBadge: string;
  progressPercentage: number;
  showShuffleButton: boolean;
  onShuffle: () => void;
};

export function StudyHeader({
  progressText,
  sideHint,
  languageBadge,
  progressPercentage,
  showShuffleButton,
  onShuffle,
}: StudyHeaderProps) {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{progressText}</div>
          <div className="text-sm text-muted-foreground">{sideHint}</div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {showShuffleButton && (
            <button
              className="rounded-full border border-primary/60 px-3 py-1 text-sm font-medium text-secondary-foreground transition hover:bg-primary/15"
              type="button"
              onClick={onShuffle}
            >
              Mezclar
            </button>
          )}

          <span className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
            {languageBadge}
          </span>
        </div>
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
type FinishStateProps = {
  title: string;
  message: string;
  total: number;
  known: number;
  unknown: number;
  showReviewFailed: boolean;
  showRepeatFailed: boolean;
  onReviewFailed: () => void;
  onRepeatFailed: () => void;
  onRestart: () => void;
};

export function FinishState({
  title,
  message,
  total,
  known,
  unknown,
  showReviewFailed,
  showRepeatFailed,
  onReviewFailed,
  onRepeatFailed,
  onRestart,
}: FinishStateProps) {
  return (
    <div className="rounded-[20px] border border-dashed border-border bg-surface/60 p-10 text-center text-muted-foreground">
      <h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2>

      <p className="mb-0">{message}</p>

      <div className="mx-auto my-5 grid max-w-[520px] grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] border border-border bg-card p-4">
          <div className="text-2xl font-bold leading-none text-foreground">
            {total}
          </div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>

        <div className="rounded-[18px] border border-border bg-card p-4">
          <div className="text-2xl font-bold leading-none text-foreground">
            {known}
          </div>
          <div className="text-sm text-muted-foreground">Correctas</div>
        </div>

        <div className="rounded-[18px] border border-border bg-card p-4">
          <div className="text-2xl font-bold leading-none text-foreground">
            {unknown}
          </div>
          <div className="text-sm text-muted-foreground">Falladas</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {showReviewFailed && (
          <button
            className="rounded-[14px] bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:brightness-110"
            type="button"
            onClick={onReviewFailed}
          >
            Repasar falladas
          </button>
        )}

        {showRepeatFailed && (
          <button
            className="rounded-[14px] border border-primary px-4 py-2 font-medium text-secondary-foreground transition hover:bg-primary/15"
            type="button"
            onClick={onRepeatFailed}
          >
            Repetir falladas
          </button>
        )}

        <button
          className="rounded-[14px] border border-border px-4 py-2 font-medium text-muted-foreground transition hover:bg-muted"
          type="button"
          onClick={onRestart}
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  );
}
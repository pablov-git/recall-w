import type { SrsRating } from "../types";

type AnswerActionsProps = {
  spacedRepetitionEnabled: boolean;
  onUnknown: () => void;
  onKnown: () => void;
  onRateSrs: (rating: SrsRating) => void;
};

export function AnswerActions({
  spacedRepetitionEnabled,
  onUnknown,
  onKnown,
  onRateSrs,
}: AnswerActionsProps) {
  if (spacedRepetitionEnabled) {
    return (
      <div className="mt-3 flex flex-wrap justify-center gap-3 lg:pr-[calc(270px+1.5rem)]">
        <button
          className="rounded-[14px] border border-red-500/60 px-4 py-2 font-medium text-red-400 transition hover:bg-red-500/15"
          type="button"
          onClick={() => onRateSrs("again")}
        >
          Muy difícil
        </button>

        <button
          className="rounded-[14px] border border-orange-500/60 px-4 py-2 font-medium text-orange-400 transition hover:bg-orange-500/15"
          type="button"
          onClick={() => onRateSrs("hard")}
        >
          Difícil
        </button>

        <button
          className="rounded-[14px] border border-emerald-500/60 px-4 py-2 font-medium text-emerald-400 transition hover:bg-emerald-500/15"
          type="button"
          onClick={() => onRateSrs("good")}
        >
          Fácil
        </button>

        <button
          className="rounded-[14px] border border-sky-500/60 px-4 py-2 font-medium text-sky-400 transition hover:bg-sky-500/15"
          type="button"
          onClick={() => onRateSrs("easy")}
        >
          Muy fácil
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 flex justify-center gap-4 lg:pr-[calc(270px+1.5rem)]">
      <button
        className="answer-btn border border-red-500/60 text-red-400 transition hover:bg-red-500/15"
        type="button"
        aria-label="No sé"
        title="No sé"
        onClick={onUnknown}
      >
        ✕
      </button>

      <button
        className="answer-btn border border-emerald-500/60 text-emerald-400 transition hover:bg-emerald-500/15"
        type="button"
        aria-label="Sé"
        title="Sé"
        onClick={onKnown}
      >
        ✓
      </button>
    </div>
  );
}
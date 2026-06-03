type AnswerActionsProps = {
  onUnknown: () => void;
  onKnown: () => void;
};

export function AnswerActions({ onUnknown, onKnown }: AnswerActionsProps) {
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
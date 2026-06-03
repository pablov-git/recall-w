import type { CardStatus } from "../types";

type FlashcardProps = {
  flipped: boolean;
  cardStatus: CardStatus;
  answerFeedbackStatus: CardStatus;
  frontLabel: string;
  backLabel: string;
  frontText: string;
  backText: string;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function Flashcard({
  flipped,
  cardStatus,
  answerFeedbackStatus,
  frontLabel,
  backLabel,
  frontText,
  backText,
  onFlip,
  onPrevious,
  onNext,
}: FlashcardProps) {
  const statusClass = answerFeedbackStatus
    ? answerFeedbackStatus === "known"
      ? "answer-known"
      : "answer-unknown"
    : cardStatus === "known"
      ? "card-known"
      : cardStatus === "unknown"
        ? "card-unknown"
        : "";

  return (
    <div className="flashcard-wrap">
      <div
        className={`flashcard ${flipped ? "is-flipped" : ""} ${statusClass}`}
        role="button"
        tabIndex={0}
        aria-label="Girar tarjeta"
        onClick={onFlip}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onFlip();
          }
        }}
      >
        <div className="flashcard-face">
          <button
            className="card-arrow card-arrow-left"
            type="button"
            aria-label="Tarjeta anterior"
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
          >
            ‹
          </button>

          <button
            className="card-arrow card-arrow-right"
            type="button"
            aria-label="Tarjeta siguiente"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
          >
            ›
          </button>

          <div className="card-label">{frontLabel}</div>
          <div className="card-word">{frontText}</div>
        </div>

        <div className="flashcard-face flashcard-back">
          <button
            className="card-arrow card-arrow-left"
            type="button"
            aria-label="Tarjeta anterior"
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
          >
            ‹
          </button>

          <button
            className="card-arrow card-arrow-right"
            type="button"
            aria-label="Tarjeta siguiente"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
          >
            ›
          </button>

          <div className="card-label">{backLabel}</div>
          <div className="card-word">{backText}</div>
        </div>
      </div>
    </div>
  );
}
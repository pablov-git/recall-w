import { createEmptyCard, fsrs, Rating } from "ts-fsrs";
import type { FlashcardCard, SrsCardData, SrsRating } from "../types";

type FsrsCard = ReturnType<typeof createEmptyCard>;

const scheduler = fsrs();

const ratingMap: Record<SrsRating, Rating> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export function isCardDue(card: FlashcardCard, now = new Date()) {
  if (!card.srs) {
    return true;
  }

  return new Date(card.srs.due).getTime() <= now.getTime();
}

export function scheduleCardWithFsrs(
  card: FlashcardCard,
  rating: SrsRating,
  now = new Date(),
): SrsCardData {
  const fsrsCard = toFsrsCard(card);
  const result = scheduler.next(fsrsCard, now, ratingMap[rating]);

  return serializeFsrsCard(result.card);
}

function toFsrsCard(card: FlashcardCard): FsrsCard {
  const emptyCard = createEmptyCard();

  if (!card.srs) {
    return emptyCard;
  }

  return {
    ...emptyCard,
    due: new Date(card.srs.due),
    stability: card.srs.stability,
    difficulty: card.srs.difficulty,
    elapsed_days: card.srs.elapsed_days,
    scheduled_days: card.srs.scheduled_days,
    reps: card.srs.reps,
    lapses: card.srs.lapses,
    state: card.srs.state as FsrsCard["state"],
    last_review: card.srs.last_review
      ? new Date(card.srs.last_review)
      : undefined,
  };
}

function serializeFsrsCard(card: FsrsCard): SrsCardData {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: Number(card.state),
    last_review:
      card.last_review instanceof Date
        ? card.last_review.toISOString()
        : null,
  };
}
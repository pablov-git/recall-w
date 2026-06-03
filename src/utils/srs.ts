import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";
import type { FlashcardCard, SrsCardData, SrsRating } from "../types";

const scheduler = fsrs();

const ratingMap: Record<SrsRating, Grade> = {
  again: Rating.Again as Grade,
  hard: Rating.Hard as Grade,
  good: Rating.Good as Grade,
  easy: Rating.Easy as Grade,
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
  const grade = ratingMap[rating];

  const result = scheduler.next(fsrsCard, now, grade) as { card: Card };

  return serializeFsrsCard(result.card);
}

function toFsrsCard(card: FlashcardCard): Card {
  const emptyCard = createEmptyCard();

  if (!card.srs) {
    return emptyCard;
  }

  const fsrsCard: Card = {
    ...emptyCard,
    due: new Date(card.srs.due),
    stability: card.srs.stability,
    difficulty: card.srs.difficulty,
    elapsed_days: card.srs.elapsed_days,
    scheduled_days: card.srs.scheduled_days,
    reps: card.srs.reps,
    lapses: card.srs.lapses,
    state: card.srs.state as Card["state"],
  };

  if (card.srs.last_review) {
    fsrsCard.last_review = new Date(card.srs.last_review);
  }

  return fsrsCard;
}

function serializeFsrsCard(card: Card): SrsCardData {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: Number(card.state),
    last_review: card.last_review ? card.last_review.toISOString() : null,
  };
}
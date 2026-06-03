export type CardStatus = "known" | "unknown" | null;
export type FirstSide = "left" | "right";
export type Phase = "all" | "failed";

export type FlashcardCard = {
  id: string;
  left: string;
  right: string;
  status: CardStatus;
};

export type FlashcardList = {
  id: string;
  name: string;
  labels: [string, string];
  cards: FlashcardCard[];
};

export type ActiveCard = {
  card: FlashcardCard;
  originalIndex: number;
};

export type RecallState = {
  lists: FlashcardList[];
  currentListId: string | null;
  currentIndex: number;
  flipped: boolean;
  firstSide: FirstSide;
  phase: Phase;
  sessionFinished: boolean;
  sessionTotal: number;
  sessionReviewedIds: string[];
};
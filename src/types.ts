export type CardStatus = "known" | "unknown" | null;
export type FirstSide = "left" | "right";
export type Phase = "all" | "failed";

export type SrsRating = "again" | "hard" | "good" | "easy";

export type SrsCardData = {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
};

export type FlashcardCard = {
  id: string;
  left: string;
  right: string;
  status: CardStatus;
  srs?: SrsCardData;
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

export type RecallSettings = {
  spacedRepetitionEnabled: boolean;
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
  settings: RecallSettings;
};
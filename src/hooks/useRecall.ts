import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActiveCard,
  CardStatus,
  FirstSide,
  FlashcardList,
  Phase,
  RecallState,
} from "../types";
import {
  cleanFileName,
  createId,
  getUniqueListName,
  normalizeLists,
  parseVocabulary,
} from "../utils/flashcards";

const STORAGE_KEY = "recall.flashcards.v1";

const initialState: RecallState = {
  lists: [],
  currentListId: null,
  currentIndex: 0,
  flipped: false,
  firstSide: "left",
  phase: "all",
  sessionFinished: false,
  sessionTotal: 0,
  sessionReviewedIds: [],
};

function getCurrentListFromState(state: RecallState): FlashcardList | null {
  return state.lists.find((list) => list.id === state.currentListId) || null;
}

function getActiveCardsFromList(
  list: FlashcardList | null,
  phase: Phase,
  keepCardId?: string,
): ActiveCard[] {
  if (!list) {
    return [];
  }

  return list.cards
    .map((card, originalIndex) => ({ card, originalIndex }))
    .filter((item) => {
      if (phase === "all") {
        return true;
      }

      return item.card.status === "unknown" || item.card.id === keepCardId;
    });
}

function restoreState(): RecallState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (!saved) {
      return initialState;
    }

    const lists = Array.isArray(saved.lists)
      ? normalizeLists(saved.lists)
      : [];

    const currentListId =
      saved.currentListId &&
      lists.some((list) => list.id === saved.currentListId)
        ? saved.currentListId
        : lists[0]?.id || null;

    return {
      lists,
      currentListId,
      currentIndex: Number.isInteger(saved.currentIndex)
        ? saved.currentIndex
        : 0,
      flipped: Boolean(saved.flipped),
      firstSide: saved.firstSide === "right" ? "right" : "left",
      phase: saved.phase === "failed" ? "failed" : "all",
      sessionFinished: Boolean(saved.sessionFinished),
      sessionTotal: Number.isInteger(saved.sessionTotal)
        ? saved.sessionTotal
        : 0,
      sessionReviewedIds: Array.isArray(saved.sessionReviewedIds)
        ? saved.sessionReviewedIds
        : [],
    };
  } catch {
    return initialState;
  }
}

function resetSessionForState(state: RecallState): RecallState {
  const list = getCurrentListFromState(state);
  const activeCards = getActiveCardsFromList(list, state.phase);

  return {
    ...state,
    sessionTotal: activeCards.length,
    sessionReviewedIds: [],
  };
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
}

function updateCardStatus(
  lists: FlashcardList[],
  listId: string | null,
  cardId: string,
  status: CardStatus,
): FlashcardList[] {
  return lists.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    return {
      ...list,
      cards: list.cards.map((card) =>
        card.id === cardId ? { ...card, status } : card,
      ),
    };
  });
}

function getFinishData(list: FlashcardList | null, phase: Phase) {
  const total = list?.cards.length || 0;
  const known = list?.cards.filter((card) => card.status === "known").length || 0;
  const unknown =
    list?.cards.filter((card) => card.status === "unknown").length || 0;

  if (phase === "all") {
    return {
      title: "Vuelta terminada",
      message:
        unknown > 0
          ? `Tienes ${unknown} ${
              unknown === 1 ? "tarjeta fallada" : "tarjetas falladas"
            } para repasar.`
          : "No tienes tarjetas falladas.",
      total,
      known,
      unknown,
      showReviewFailed: unknown > 0,
      showRepeatFailed: false,
    };
  }

  if (unknown > 0) {
    return {
      title: "Repaso terminado",
      message: `Siguen quedando ${unknown} ${
        unknown === 1 ? "tarjeta fallada" : "tarjetas falladas"
      }.`,
      total,
      known,
      unknown,
      showReviewFailed: false,
      showRepeatFailed: true,
    };
  }

  return {
    title: "Falladas resueltas",
    message: "Has corregido todas las tarjetas falladas.",
    total,
    known,
    unknown,
    showReviewFailed: false,
    showRepeatFailed: false,
  };
}

export function useRecall() {
  const [state, setState] = useState<RecallState>(restoreState);
  const [fileFeedbackOverride, setFileFeedbackOverride] = useState<string | null>(
    null,
  );
  const [answerFeedback, setAnswerFeedback] = useState<{
    status: Exclude<CardStatus, null>;
    cardId: string;
  } | null>(null);

  const answerFeedbackTimer = useRef<number | null>(null);

  const currentList = useMemo(
    () => getCurrentListFromState(state),
    [state],
  );

  const activeCards = useMemo(
    () =>
      getActiveCardsFromList(
        currentList,
        state.phase,
        answerFeedback?.cardId,
      ),
    [currentList, state.phase, answerFeedback?.cardId],
  );

  const safeCurrentIndex =
    activeCards.length === 0
      ? 0
      : Math.min(Math.max(state.currentIndex, 0), activeCards.length - 1);

  const activeItem = activeCards[safeCurrentIndex] || null;
  const currentCard = activeItem?.card || null;

  const hasList = Boolean(currentList);
  const hasActiveCards = activeCards.length > 0;

  const shouldShowFinish =
    hasList && (state.sessionFinished || !hasActiveCards);

  const fileFeedback =
    fileFeedbackOverride ||
    (currentList ? `Lista cargada: ${currentList.name}` : "Sin lista cargada");

  const frontText = currentCard
    ? state.firstSide === "left"
      ? currentCard.left
      : currentCard.right
    : "---";

  const backText = currentCard
    ? state.firstSide === "left"
      ? currentCard.right
      : currentCard.left
    : "---";

  const frontLabel = currentList
    ? state.firstSide === "left"
      ? currentList.labels[0]
      : currentList.labels[1]
    : "Columna 1";

  const backLabel = currentList
    ? state.firstSide === "left"
      ? currentList.labels[1]
      : currentList.labels[0]
    : "Columna 2";

  const progressText = `${state.phase === "failed" ? "Falladas" : "Tarjeta"} ${
    safeCurrentIndex + 1
  } de ${activeCards.length}`;

  const sideHint = state.flipped
    ? "Viendo la otra cara"
    : "Pulsa la tarjeta para girarla";

  const languageBadge = `${frontLabel} → ${backLabel}`;

  const effectiveSessionTotal =
    state.sessionTotal === 0 && activeCards.length > 0
      ? activeCards.length
      : state.sessionTotal;

  const reviewed = Math.min(
    state.sessionReviewedIds.length,
    effectiveSessionTotal,
  );

  const progressPercentage =
    effectiveSessionTotal === 0
      ? 0
      : Math.round((reviewed / effectiveSessionTotal) * 100);

  const finish = getFinishData(currentList, state.phase);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const loadFile = useCallback((file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const parsed = parseVocabulary(String(reader.result));

      if (parsed.cards.length === 0) {
        setFileFeedbackOverride(
          "No se han encontrado tarjetas válidas en el archivo.",
        );
        return;
      }

      setFileFeedbackOverride(null);

      setState((prev) => {
        const list: FlashcardList = {
          id: createId(),
          name: getUniqueListName(cleanFileName(file.name), prev.lists),
          labels: parsed.labels,
          cards: parsed.cards,
        };

        return {
          ...prev,
          lists: [...prev.lists, list],
          currentListId: list.id,
          currentIndex: 0,
          flipped: false,
          firstSide: prev.firstSide,
          phase: "all",
          sessionFinished: false,
          sessionTotal: list.cards.length,
          sessionReviewedIds: [],
        };
      });
    };

    reader.readAsText(file, "utf-8");
  }, []);

  const selectList = useCallback((listId: string) => {
    setFileFeedbackOverride(null);

    setState((prev) =>
      resetSessionForState({
        ...prev,
        currentListId: listId,
        currentIndex: 0,
        flipped: false,
        phase: "all",
        sessionFinished: false,
      }),
    );
  }, []);

  const deleteCurrentList = useCallback(() => {
    setFileFeedbackOverride(null);

    setState((prev) => {
      if (!prev.currentListId) {
        return prev;
      }

      const lists = prev.lists.filter((list) => list.id !== prev.currentListId);

      return {
        ...prev,
        lists,
        currentListId: lists[0]?.id || null,
        currentIndex: 0,
        flipped: false,
        phase: "all",
        sessionFinished: false,
        sessionTotal: 0,
        sessionReviewedIds: [],
      };
    });
  }, []);

  const changeFirstSide = useCallback((firstSide: FirstSide) => {
    setState((prev) => ({
      ...prev,
      firstSide,
      flipped: false,
    }));
  }, []);

  const flipCard = useCallback(() => {
    if (
      state.sessionFinished ||
      answerFeedbackTimer.current ||
      activeCards.length === 0
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      flipped: !prev.flipped,
    }));
  }, [state.sessionFinished, activeCards.length]);

  const nextCard = useCallback(() => {
    if (
      state.sessionFinished ||
      answerFeedbackTimer.current ||
      activeCards.length === 0
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      currentIndex: (safeCurrentIndex + 1) % activeCards.length,
      flipped: false,
    }));
  }, [state.sessionFinished, activeCards.length, safeCurrentIndex]);

  const prevCard = useCallback(() => {
    if (
      state.sessionFinished ||
      answerFeedbackTimer.current ||
      activeCards.length === 0
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      currentIndex:
        (safeCurrentIndex - 1 + activeCards.length) % activeCards.length,
      flipped: false,
    }));
  }, [state.sessionFinished, activeCards.length, safeCurrentIndex]);

  const shuffleCards = useCallback(() => {
    if (answerFeedbackTimer.current) {
      return;
    }

    setState((prev) => {
      const list = getCurrentListFromState(prev);

      if (!list) {
        return prev;
      }

      if (prev.phase === "failed") {
        const failedIndexes = list.cards
          .map((card, index) => ({ card, index }))
          .filter((item) => item.card.status === "unknown")
          .map((item) => item.index);

        if (failedIndexes.length <= 1) {
          return prev;
        }

        const failedCards = shuffleArray(
          failedIndexes.map((index) => list.cards[index]),
        );

        const cards = [...list.cards];

        failedIndexes.forEach((index, position) => {
          cards[index] = failedCards[position];
        });

        const lists = prev.lists.map((item) =>
          item.id === list.id ? { ...item, cards } : item,
        );

        return resetSessionForState({
          ...prev,
          lists,
          currentIndex: 0,
          flipped: false,
          phase: "failed",
          sessionFinished: false,
        });
      }

      if (list.cards.length <= 1) {
        return prev;
      }

      const cards = shuffleArray(list.cards).map((card) => ({
        ...card,
        status: null,
      }));

      const lists = prev.lists.map((item) =>
        item.id === list.id ? { ...item, cards } : item,
      );

      return resetSessionForState({
        ...prev,
        lists,
        currentIndex: 0,
        flipped: false,
        phase: "all",
        sessionFinished: false,
      });
    });
  }, []);

  const markCard = useCallback(
    (status: Exclude<CardStatus, null>) => {
      const currentItem = activeCards[safeCurrentIndex] || activeCards[0];

      if (
        state.sessionFinished ||
        !currentItem ||
        answerFeedbackTimer.current
      ) {
        return;
      }

      const cardId = currentItem.card.id;

      setAnswerFeedback({ status, cardId });

      setState((prev) => {
        const sessionReviewedIds = prev.sessionReviewedIds.includes(cardId)
          ? prev.sessionReviewedIds
          : [...prev.sessionReviewedIds, cardId];

        return {
          ...prev,
          lists: updateCardStatus(
            prev.lists,
            prev.currentListId,
            cardId,
            status,
          ),
          flipped: false,
          sessionTotal:
            prev.sessionTotal === 0 ? activeCards.length : prev.sessionTotal,
          sessionReviewedIds,
        };
      });

      answerFeedbackTimer.current = window.setTimeout(() => {
        answerFeedbackTimer.current = null;
        setAnswerFeedback(null);

        setState((prev) => {
          if (prev.phase === "all") {
            if (safeCurrentIndex >= activeCards.length - 1) {
              return {
                ...prev,
                sessionFinished: true,
              };
            }

            return {
              ...prev,
              currentIndex: safeCurrentIndex + 1,
            };
          }

          const list = getCurrentListFromState(prev);
          const activeCardsAfter = getActiveCardsFromList(list, prev.phase);

          let nextIndex = safeCurrentIndex;

          if (status === "unknown") {
            nextIndex++;
          }

          if (
            activeCardsAfter.length === 0 ||
            nextIndex >= activeCardsAfter.length ||
            prev.sessionReviewedIds.length >= prev.sessionTotal
          ) {
            return {
              ...prev,
              sessionFinished: true,
            };
          }

          return {
            ...prev,
            currentIndex: nextIndex,
          };
        });
      }, 260);
    },
    [activeCards, safeCurrentIndex, state.sessionFinished],
  );

  const startFailedReview = useCallback(() => {
    setState((prev) => {
      const list = getCurrentListFromState(prev);
      const failedCards =
        list?.cards.filter((card) => card.status === "unknown") || [];

      if (failedCards.length === 0) {
        return prev;
      }

      return {
        ...prev,
        phase: "failed",
        currentIndex: 0,
        flipped: false,
        sessionFinished: false,
        sessionTotal: failedCards.length,
        sessionReviewedIds: [],
      };
    });
  }, []);

  const restartCurrentList = useCallback(() => {
    setState((prev) => {
      const list = getCurrentListFromState(prev);

      if (!list) {
        return prev;
      }

      const lists = prev.lists.map((item) =>
        item.id === list.id
          ? {
              ...item,
              cards: item.cards.map((card) => ({
                ...card,
                status: null,
              })),
            }
          : item,
      );

      return {
        ...prev,
        lists,
        phase: "all",
        currentIndex: 0,
        flipped: false,
        sessionFinished: false,
        sessionTotal: list.cards.length,
        sessionReviewedIds: [],
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.matches("input, textarea, select, button")) {
        return;
      }

      if (event.key === "ArrowRight") {
        nextCard();
      }

      if (event.key === "ArrowLeft") {
        prevCard();
      }

      if (event.key === " ") {
        event.preventDefault();
        flipCard();
      }

      if (event.key.toLowerCase() === "s") {
        markCard("known");
      }

      if (event.key.toLowerCase() === "n") {
        markCard("unknown");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextCard, prevCard, flipCard, markCard]);

  return {
    lists: state.lists,
    currentList,
    currentListId: state.currentListId,
    firstSide: state.firstSide,
    flipped: state.flipped,
    cardStatus: currentCard?.status || null,
    answerFeedbackStatus: answerFeedback?.status || null,

    hasList,
    hasActiveCards,
    shouldShowFinish,
    fileFeedback,

    frontText,
    backText,
    frontLabel,
    backLabel,
    progressText,
    sideHint,
    languageBadge,
    progressPercentage,
    finish,

    loadFile,
    selectList,
    deleteCurrentList,
    changeFirstSide,
    flipCard,
    nextCard,
    prevCard,
    shuffleCards,
    markCard,
    startFailedReview,
    restartCurrentList,
  };
}
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActiveCard,
  CardStatus,
  FirstSide,
  FlashcardList,
  Phase,
  RecallState,
  SrsRating,
} from "../types";
import {
  cleanFileName,
  createEmptyRecallState,
  createId,
  getUniqueListName,
  parseVocabulary,
} from "../utils/flashcards";
import { downloadRecallExport, readRecallImport } from "../utils/importExport";
import { isCardDue, scheduleCardWithFsrs } from "../utils/srs";
import {
  loadRecallState,
  replaceRecallState,
  saveRecallState,
} from "../storage/db";

function getCurrentListFromState(state: RecallState): FlashcardList | null {
  return state.lists.find((list) => list.id === state.currentListId) || null;
}

function getActiveCardsFromList(
  list: FlashcardList | null,
  phase: Phase,
  spacedRepetitionEnabled: boolean,
  keepCardId?: string,
): ActiveCard[] {
  if (!list) {
    return [];
  }

  if (spacedRepetitionEnabled) {
    return list.cards
      .map((card, originalIndex) => ({ card, originalIndex }))
      .filter((item) => isCardDue(item.card) || item.card.id === keepCardId);
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

function resetSessionForState(state: RecallState): RecallState {
  const list = getCurrentListFromState(state);
  const activeCards = getActiveCardsFromList(
    list,
    state.phase,
    state.settings.spacedRepetitionEnabled,
  );

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

function updateCard(
  lists: FlashcardList[],
  listId: string | null,
  cardId: string,
  updater: (
    card: FlashcardList["cards"][number],
  ) => FlashcardList["cards"][number],
): FlashcardList[] {
  return lists.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    return {
      ...list,
      cards: list.cards.map((card) =>
        card.id === cardId ? updater(card) : card,
      ),
    };
  });
}

function updateCardStatus(
  lists: FlashcardList[],
  listId: string | null,
  cardId: string,
  status: CardStatus,
): FlashcardList[] {
  return updateCard(lists, listId, cardId, (card) => ({
    ...card,
    status,
  }));
}

function getFinishData(
  list: FlashcardList | null,
  phase: Phase,
  spacedRepetitionEnabled: boolean,
) {
  const total = list?.cards.length || 0;
  const known = list?.cards.filter((card) => card.status === "known").length || 0;
  const unknown =
    list?.cards.filter((card) => card.status === "unknown").length || 0;

  if (spacedRepetitionEnabled) {
    return {
      title: "Repaso terminado",
      message: "No hay tarjetas pendientes ahora.",
      total,
      known,
      unknown,
      showReviewFailed: false,
      showRepeatFailed: false,
    };
  }

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
  const [state, setState] = useState<RecallState>(createEmptyRecallState);
  const [isReady, setIsReady] = useState(false);
  const [fileFeedbackOverride, setFileFeedbackOverride] = useState<
    string | null
  >(null);
  const [answerFeedback, setAnswerFeedback] = useState<{
    status: Exclude<CardStatus, null>;
    cardId: string;
  } | null>(null);

  const answerFeedbackTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadRecallState()
      .then((savedState) => {
        if (cancelled) {
          return;
        }

        setState(savedState);
        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState(createEmptyRecallState());
        setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void saveRecallState(state);
  }, [state, isReady]);

  const currentList = useMemo(() => getCurrentListFromState(state), [state]);

  const spacedRepetitionEnabled = state.settings.spacedRepetitionEnabled;

  const activeCards = useMemo(
    () =>
      getActiveCardsFromList(
        currentList,
        state.phase,
        spacedRepetitionEnabled,
        answerFeedback?.cardId,
      ),
    [currentList, state.phase, spacedRepetitionEnabled, answerFeedback?.cardId],
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

  const progressText = `${
    spacedRepetitionEnabled
      ? "Pendiente"
      : state.phase === "failed"
        ? "Falladas"
        : "Tarjeta"
  } ${safeCurrentIndex + 1} de ${activeCards.length}`;

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

  const finish = getFinishData(
    currentList,
    state.phase,
    spacedRepetitionEnabled,
  );

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

  const toggleSpacedRepetition = useCallback((enabled: boolean) => {
    setState((prev) =>
      resetSessionForState({
        ...prev,
        currentIndex: 0,
        flipped: false,
        phase: "all",
        sessionFinished: false,
        settings: {
          ...prev.settings,
          spacedRepetitionEnabled: enabled,
        },
      }),
    );
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

      if (prev.settings.spacedRepetitionEnabled) {
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

  const advanceAfterAnswer = useCallback(
    (status: Exclude<CardStatus, null>, activeCardsBeforeLength: number) => {
      setState((prev) => {
        const list = getCurrentListFromState(prev);
        const activeCardsAfter = getActiveCardsFromList(
          list,
          prev.phase,
          prev.settings.spacedRepetitionEnabled,
        );

        if (prev.settings.spacedRepetitionEnabled) {
          if (activeCardsAfter.length === 0) {
            return {
              ...prev,
              sessionFinished: true,
            };
          }

          const nextIndex = Math.min(
            safeCurrentIndex,
            activeCardsAfter.length - 1,
          );

          return {
            ...prev,
            currentIndex: nextIndex,
          };
        }

        if (prev.phase === "all") {
          if (safeCurrentIndex >= activeCardsBeforeLength - 1) {
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
    },
    [safeCurrentIndex],
  );

  const markNormalCard = useCallback(
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
        advanceAfterAnswer(status, activeCards.length);
      }, 260);
    },
    [
      activeCards,
      safeCurrentIndex,
      state.sessionFinished,
      advanceAfterAnswer,
    ],
  );

  const rateSrsCard = useCallback(
    (rating: SrsRating) => {
      const currentItem = activeCards[safeCurrentIndex] || activeCards[0];

      if (
        state.sessionFinished ||
        !currentItem ||
        answerFeedbackTimer.current
      ) {
        return;
      }

      const cardId = currentItem.card.id;
      const visualStatus: Exclude<CardStatus, null> =
        rating === "again" ? "unknown" : "known";

      setAnswerFeedback({ status: visualStatus, cardId });

      setState((prev) => {
        const sessionReviewedIds = prev.sessionReviewedIds.includes(cardId)
          ? prev.sessionReviewedIds
          : [...prev.sessionReviewedIds, cardId];

        return {
          ...prev,
          lists: updateCard(prev.lists, prev.currentListId, cardId, (card) => ({
            ...card,
            status: visualStatus,
            srs: scheduleCardWithFsrs(card, rating),
          })),
          flipped: false,
          sessionTotal:
            prev.sessionTotal === 0 ? activeCards.length : prev.sessionTotal,
          sessionReviewedIds,
        };
      });

      answerFeedbackTimer.current = window.setTimeout(() => {
        answerFeedbackTimer.current = null;
        setAnswerFeedback(null);
        advanceAfterAnswer(visualStatus, activeCards.length);
      }, 260);
    },
    [
      activeCards,
      safeCurrentIndex,
      state.sessionFinished,
      advanceAfterAnswer,
    ],
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

  const exportData = useCallback(() => {
    downloadRecallExport(state);
  }, [state]);

  const importData = useCallback(async (file: File) => {
    try {
      const importedState = await readRecallImport(file);

      const accepted = window.confirm(
        "La importación sustituirá todos los datos actuales. Si aceptas, perderás los datos que tengas ahora.",
      );

      if (!accepted) {
        return;
      }

      await replaceRecallState(importedState);
      setState(importedState);
      setFileFeedbackOverride("Datos importados correctamente.");
    } catch (error) {
      setFileFeedbackOverride(
        error instanceof Error
          ? error.message
          : "No se han podido importar los datos.",
      );
    }
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

      if (!spacedRepetitionEnabled && event.key.toLowerCase() === "s") {
        markNormalCard("known");
      }

      if (!spacedRepetitionEnabled && event.key.toLowerCase() === "n") {
        markNormalCard("unknown");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    nextCard,
    prevCard,
    flipCard,
    markNormalCard,
    spacedRepetitionEnabled,
  ]);

  return {
    isReady,

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
    spacedRepetitionEnabled,

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
    toggleSpacedRepetition,
    flipCard,
    nextCard,
    prevCard,
    shuffleCards,
    markNormalCard,
    rateSrsCard,
    startFailedReview,
    restartCurrentList,
    exportData,
    importData,
  };
}
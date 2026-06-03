import type {
  FlashcardCard,
  FlashcardList,
  RecallSettings,
  RecallState,
  SrsCardData,
} from "../types";
import { createDefaultLists } from "../data/defaultLists";

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function parseVocabulary(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (lines.length < 2) {
    return {
      labels: ["Columna 1", "Columna 2"] as [string, string],
      cards: [] as FlashcardCard[],
    };
  }

  const delimiter = detectDelimiter(lines);
  const headerParts = splitLine(lines[0], delimiter);

  const labels: [string, string] = [
    headerParts[0]?.trim() || "Columna 1",
    headerParts[1]?.trim() || "Columna 2",
  ];

  const cards: FlashcardCard[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = splitLine(lines[i], delimiter);

    if (parts.length >= 2) {
      const left = parts[0].trim();
      const right = parts.slice(1).join(delimiter).trim();

      if (left && right) {
        cards.push({
          id: createId(),
          left,
          right,
          status: null,
        });
      }
    }
  }

  return {
    labels,
    cards,
  };
}

function detectDelimiter(lines: string[]) {
  const candidates = [";", "\t", "|", ",", "="];
  let bestDelimiter = ";";
  let bestScore = -1;

  for (const delimiter of candidates) {
    let score = 0;

    for (const line of lines.slice(0, 10)) {
      if (splitLine(line, delimiter).length >= 2) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

function splitLine(line: string, delimiter: string) {
  if (delimiter === ",") {
    return splitCsvLine(line);
  }

  return line.split(delimiter);
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function cleanFileName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "") || "Nueva lista";
}

export function getUniqueListName(baseName: string, lists: FlashcardList[]) {
  const existingNames = new Set(lists.map((list) => list.name));

  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let counter = 2;
  let candidate = `${baseName} ${counter}`;

  while (existingNames.has(candidate)) {
    counter++;
    candidate = `${baseName} ${counter}`;
  }

  return candidate;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeSrsData(value: unknown): SrsCardData | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const due = typeof value.due === "string" ? value.due : null;

  if (!due || Number.isNaN(new Date(due).getTime())) {
    return undefined;
  }

  const stability = typeof value.stability === "number" ? value.stability : 0;
  const difficulty = typeof value.difficulty === "number" ? value.difficulty : 0;
  const elapsed_days =
    typeof value.elapsed_days === "number" ? value.elapsed_days : 0;
  const scheduled_days =
    typeof value.scheduled_days === "number" ? value.scheduled_days : 0;
  const reps = typeof value.reps === "number" ? value.reps : 0;
  const lapses = typeof value.lapses === "number" ? value.lapses : 0;
  const state = typeof value.state === "number" ? value.state : 0;

  const lastReview =
    typeof value.last_review === "string" &&
    !Number.isNaN(new Date(value.last_review).getTime())
      ? value.last_review
      : null;

  return {
    due,
    stability,
    difficulty,
    elapsed_days,
    scheduled_days,
    reps,
    lapses,
    state,
    last_review: lastReview,
  };
}

export function normalizeLists(savedLists: unknown): FlashcardList[] {
  if (!Array.isArray(savedLists)) {
    return [];
  }

  return savedLists
    .map((value): FlashcardList | null => {
      if (!isRecord(value)) {
        return null;
      }

      const rawLabels = Array.isArray(value.labels) ? value.labels : [];

      const labels: [string, string] = [
        typeof rawLabels[0] === "string" && rawLabels[0]
          ? rawLabels[0]
          : "Columna 1",
        typeof rawLabels[1] === "string" && rawLabels[1]
          ? rawLabels[1]
          : "Columna 2",
      ];

      const rawCards = Array.isArray(value.cards) ? value.cards : [];

      const cards = rawCards
        .map((cardValue): FlashcardCard | null => {
          if (!isRecord(cardValue)) {
            return null;
          }

          const left =
            typeof cardValue.left === "string" ? cardValue.left : "";
          const right =
            typeof cardValue.right === "string" ? cardValue.right : "";

          if (!left || !right) {
            return null;
          }

          const status =
            cardValue.status === "known" || cardValue.status === "unknown"
              ? cardValue.status
              : null;

          const card: FlashcardCard = {
            id: typeof cardValue.id === "string" ? cardValue.id : createId(),
            left,
            right,
            status,
          };

          const srs = normalizeSrsData(cardValue.srs);

          if (srs) {
            card.srs = srs;
          }

          return card;
        })
        .filter((card): card is FlashcardCard => Boolean(card));

      if (cards.length === 0) {
        return null;
      }

      return {
        id: typeof value.id === "string" ? value.id : createId(),
        name: typeof value.name === "string" ? value.name : "Lista",
        labels,
        cards,
      };
    })
    .filter((list): list is FlashcardList => Boolean(list));
}

function normalizeSettings(value: unknown): RecallSettings {
  if (!isRecord(value)) {
    return {
      spacedRepetitionEnabled: false,
    };
  }

  return {
    spacedRepetitionEnabled: Boolean(value.spacedRepetitionEnabled),
  };
}

export function normalizeRecallState(value: unknown): RecallState {
  if (!isRecord(value)) {
    return createEmptyRecallState();
  }

  const lists = normalizeLists(value.lists);

  const currentListId =
    typeof value.currentListId === "string" &&
    lists.some((list) => list.id === value.currentListId)
      ? value.currentListId
      : lists[0]?.id || null;

  return {
    lists,
    currentListId,
    currentIndex:
      typeof value.currentIndex === "number" &&
      Number.isInteger(value.currentIndex)
        ? value.currentIndex
        : 0,
    flipped: Boolean(value.flipped),
    firstSide: value.firstSide === "right" ? "right" : "left",
    phase: value.phase === "failed" ? "failed" : "all",
    sessionFinished: Boolean(value.sessionFinished),
    sessionTotal:
      typeof value.sessionTotal === "number" &&
      Number.isInteger(value.sessionTotal)
        ? value.sessionTotal
        : 0,
    sessionReviewedIds: Array.isArray(value.sessionReviewedIds)
      ? value.sessionReviewedIds.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    settings: normalizeSettings(value.settings),
  };
}

export function createEmptyRecallState(): RecallState {
  const defaultLists = createDefaultLists();

  return {
    lists: defaultLists,
    currentListId: defaultLists[0]?.id || null,
    currentIndex: 0,
    flipped: false,
    firstSide: "left",
    phase: "all",
    sessionFinished: false,
    sessionTotal: defaultLists[0]?.cards.length || 0,
    sessionReviewedIds: [],
    settings: {
      spacedRepetitionEnabled: false,
    },
  };
}
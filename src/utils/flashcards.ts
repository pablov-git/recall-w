import type { FlashcardList, FlashcardCard } from "../types";

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

export function normalizeLists(savedLists: FlashcardList[]) {
  return savedLists
    .map((list) => ({
      id: list.id || String(Date.now()),
      name: list.name || "Lista",
      labels:
        Array.isArray(list.labels) && list.labels.length >= 2
          ? ([list.labels[0], list.labels[1]] as [string, string])
          : (["Columna 1", "Columna 2"] as [string, string]),
      cards: Array.isArray(list.cards)
        ? list.cards
            .map((card) => ({
              id: card.id || createId(),
              left: card.left || "",
              right: card.right || "",
              status:
                card.status === "known" || card.status === "unknown"
                  ? card.status
                  : null,
            }))
            .filter((card) => card.left && card.right)
        : [],
    }))
    .filter((list) => list.cards.length > 0);
}
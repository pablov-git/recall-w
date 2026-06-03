import type { RecallState } from "../types";
import { normalizeRecallState } from "./flashcards";

const EXPORT_SCHEMA = "recall.export.v1";

type RecallExportPayload = {
  schema: typeof EXPORT_SCHEMA;
  exportedAt: string;
  state: RecallState;
};

export function downloadRecallExport(state: RecallState) {
  const payload: RecallExportPayload = {
    schema: EXPORT_SCHEMA,
    exportedAt: new Date().toISOString(),
    state,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `recard-export-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export async function readRecallImport(file: File): Promise<RecallState> {
  const text = await file.text();

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("El archivo no es una exportación válida de Recard.");
  }

  if (!isRecord(parsed) || parsed.schema !== EXPORT_SCHEMA) {
    throw new Error("El archivo no es una exportación válida de Recard.");
  }

  return normalizeRecallState(parsed.state);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
import Dexie, { type Table } from "dexie";
import type { RecallState } from "../types";
import {
  createEmptyRecallState,
  normalizeRecallState,
} from "../utils/flashcards";

const LEGACY_LOCAL_STORAGE_KEY = "recall.flashcards.v1";
const MAIN_STATE_ID = "main";

type RecallStateRecord = {
  id: string;
  state: RecallState;
  updatedAt: string;
};

class RecallDatabase extends Dexie {
  appState!: Table<RecallStateRecord, string>;

  constructor() {
    super("recall-db");

    this.version(1).stores({
      appState: "id",
    });
  }
}

export const db = new RecallDatabase();

export async function loadRecallState(): Promise<RecallState> {
  const record = await db.appState.get(MAIN_STATE_ID);

  if (record?.state) {
    return normalizeRecallState(record.state);
  }

  const legacyState = loadLegacyLocalStorageState();

  if (legacyState) {
    await saveRecallState(legacyState);
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);
    return legacyState;
  }

  return createEmptyRecallState();
}

export async function saveRecallState(state: RecallState): Promise<void> {
  await db.appState.put({
    id: MAIN_STATE_ID,
    state,
    updatedAt: new Date().toISOString(),
  });
}

export async function replaceRecallState(state: RecallState): Promise<void> {
  await db.transaction("rw", db.appState, async () => {
    await db.appState.clear();
    await saveRecallState(state);
  });
}

function loadLegacyLocalStorageState(): RecallState | null {
  try {
    const raw = localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return normalizeRecallState(JSON.parse(raw));
  } catch {
    return null;
  }
}
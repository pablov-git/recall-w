import type { FirstSide, FlashcardList } from "../types";

type ControlsPanelProps = {
  lists: FlashcardList[];
  currentListId: string | null;
  firstSide: FirstSide;
  disabled: boolean;
  spacedRepetitionEnabled: boolean;
  onSelectList: (listId: string) => void;
  onDeleteList: () => void;
  onChangeFirstSide: (firstSide: FirstSide) => void;
  onToggleSpacedRepetition: (enabled: boolean) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
};

export function ControlsPanel({
  lists,
  currentListId,
  firstSide,
  disabled,
  spacedRepetitionEnabled,
  onSelectList,
  onDeleteList,
  onChangeFirstSide,
  onToggleSpacedRepetition,
  onExportData,
  onImportData,
}: ControlsPanelProps) {
  const currentList = lists.find((list) => list.id === currentListId) || null;
  const labels = currentList?.labels || ["Columna 1", "Columna 2"];

  return (
    <aside className="lg:w-[270px]">
      <div className="glass-strong h-full min-h-[340px] rounded-[22px] p-3">
        <div className="mb-3">
          <label htmlFor="listSelect" className="mb-2 block font-medium">
            Lista
          </label>

          <select
            className="w-full rounded-[14px] border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-primary disabled:opacity-60"
            id="listSelect"
            disabled={disabled}
            value={currentListId || ""}
            onChange={(event) => onSelectList(event.target.value)}
          >
            {lists.length === 0 ? (
              <option value="">Sin listas</option>
            ) : (
              lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-3 grid gap-2">
          <button
            className="rounded-[14px] border border-border px-4 py-2 font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-60"
            type="button"
            disabled={disabled}
            onClick={onDeleteList}
          >
            Eliminar lista
          </button>
        </div>

        <div className="mb-3">
          <label htmlFor="firstSide" className="mb-2 block font-medium">
            Ver primero
          </label>

          <select
            className="w-full rounded-[14px] border border-border bg-card px-3 py-2 text-foreground outline-none focus:border-primary disabled:opacity-60"
            id="firstSide"
            disabled={disabled}
            value={firstSide}
            onChange={(event) =>
              onChangeFirstSide(event.target.value as FirstSide)
            }
          >
            <option value="left">{labels[0] || "Columna 1"}</option>
            <option value="right">{labels[1] || "Columna 2"}</option>
          </select>
        </div>

        <div className="mb-3 rounded-[14px] border border-border bg-card p-3">
          <label
            htmlFor="spacedRepetition"
            className="flex cursor-pointer items-center justify-between gap-3"
          >
            <span className="min-w-0 whitespace-nowrap text-sm font-medium">
              Repetición espaciada
            </span>

            <span className="relative inline-flex shrink-0 items-center">
              <input
                id="spacedRepetition"
                type="checkbox"
                className="peer sr-only"
                checked={spacedRepetitionEnabled}
                onChange={(event) =>
                  onToggleSpacedRepetition(event.target.checked)
                }
              />

              <span className="h-6 w-11 rounded-full border border-border bg-muted transition peer-checked:border-primary peer-checked:bg-primary/25" />

              <span className="absolute left-1 h-4 w-4 rounded-full bg-muted-foreground transition peer-checked:translate-x-5 peer-checked:bg-primary" />
            </span>
          </label>
        </div>

        <div className="grid gap-2 border-t border-border pt-3">
          <button
            className="rounded-[14px] border border-border px-4 py-2 font-medium text-muted-foreground transition hover:bg-muted"
            type="button"
            onClick={onExportData}
          >
            Exportar datos
          </button>

          <input
            className="sr-only"
            id="importDataInput"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              onImportData(file);
              event.target.value = "";
            }}
          />

          <label
            htmlFor="importDataInput"
            className="rounded-[14px] border border-border px-4 py-2 text-center font-medium text-muted-foreground transition hover:bg-muted"
          >
            Importar datos
          </label>
        </div>
      </div>
    </aside>
  );
}
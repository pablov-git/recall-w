import type { FirstSide, FlashcardList } from "../types";

type ControlsPanelProps = {
  lists: FlashcardList[];
  currentListId: string | null;
  firstSide: FirstSide;
  disabled: boolean;
  onSelectList: (listId: string) => void;
  onDeleteList: () => void;
  onChangeFirstSide: (firstSide: FirstSide) => void;
  onShuffle: () => void;
};

export function ControlsPanel({
  lists,
  currentListId,
  firstSide,
  disabled,
  onSelectList,
  onDeleteList,
  onChangeFirstSide,
  onShuffle,
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

        <div className="grid gap-2">
          <button
            className="rounded-[14px] border border-primary px-4 py-2 font-medium text-secondary-foreground transition hover:bg-primary/15 disabled:opacity-60"
            type="button"
            disabled={disabled}
            onClick={onShuffle}
          >
            Mezclar tarjetas
          </button>
        </div>
      </div>
    </aside>
  );
}
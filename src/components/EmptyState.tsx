export function EmptyState() {
  return (
    <div className="rounded-[20px] border border-dashed border-border bg-surface/60 p-10 text-center text-muted-foreground">
      <h2 className="mb-2 text-lg font-semibold text-foreground">
        Todavía no hay tarjetas cargadas
      </h2>

      <p className="mb-0">Carga un archivo para empezar.</p>
    </div>
  );
}
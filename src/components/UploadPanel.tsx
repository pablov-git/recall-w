type UploadPanelProps = {
  fileFeedback: string;
  onFileChange: (file: File) => void;
};

export function UploadPanel({ fileFeedback, onFileChange }: UploadPanelProps) {
  return (
    <section className="glass-strong mb-6 rounded-[22px] p-3 shadow-[0_16px_45px_rgba(0,0,0,0.18)] md:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="sr-only"
          type="file"
          id="fileInput"
          accept=".csv,.txt,.tsv"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              return;
            }

            onFileChange(file);
            event.target.value = "";
          }}
        />

        <label
          htmlFor="fileInput"
          className="rounded-[14px] bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:brightness-110"
        >
          Cargar archivo
        </label>

        <span className="text-sm text-muted-foreground">{fileFeedback}</span>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-medium">
          Formato aceptado
        </summary>

        <div className="mt-3 text-sm text-muted-foreground">
          <p className="mb-2">La primera línea se usa como nombre de las columnas.</p>

          <pre className="mb-2 whitespace-pre-wrap rounded-2xl border border-border bg-card p-3 text-foreground">
            <code>{`es;en
casa;house
perro;dog
buenos días;good morning`}</code>
          </pre>

          <p className="mb-2">
            También puedes separar las columnas con <code>=</code>, tabulador,
            coma o barra vertical.
          </p>

          <pre className="whitespace-pre-wrap rounded-2xl border border-border bg-card p-3 text-foreground">
            <code>{`pregunta=respuesta
casa=house
perro=dog
buenos días=good morning`}</code>
          </pre>
        </div>
      </details>
    </section>
  );
}
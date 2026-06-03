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
          Instrucciones y formato
        </summary>

        <div className="mt-3 space-y-5 text-sm text-muted-foreground">
          <section>
            <h2 className="mb-2 font-semibold text-foreground">
              Cómo cargar una lista
            </h2>

            <p className="mb-2">
              Carga un archivo <code>.csv</code>, <code>.txt</code> o{" "}
              <code>.tsv</code> con dos columnas: una para la pregunta y otra
              para la respuesta.
            </p>

            <p className="mb-0">
              La primera línea se usa como nombre de las columnas.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-foreground">
              Ejemplo recomendado
            </h2>

            <pre className="mb-2 whitespace-pre-wrap rounded-2xl border border-border bg-card p-3 text-foreground">
              <code>{`es;en
casa;house
perro;dog
buenos días;good morning`}</code>
            </pre>

            <p className="mb-0">
              También puedes separar las columnas con <code>=</code>,
              tabulador, coma o barra vertical.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-foreground">
              Otro formato válido
            </h2>

            <pre className="whitespace-pre-wrap rounded-2xl border border-border bg-card p-3 text-foreground">
              <code>{`pregunta=respuesta
casa=house
perro=dog
buenos días=good morning`}</code>
            </pre>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-foreground">
              Modo normal
            </h2>

            <p className="mb-2">
              En el modo normal puedes repasar todas las tarjetas de una lista.
              Pulsa la tarjeta para ver la otra cara.
            </p>

            <p className="mb-0">
              Marca cada tarjeta con <strong>✕</strong> si no la sabes o con{" "}
              <strong>✓</strong> si la sabes. Al terminar, puedes repasar las
              falladas.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-foreground">
              Repetición espaciada
            </h2>

            <p className="mb-2">
              Si activas la repetición espaciada, la aplicación solo te mostrará
              las tarjetas pendientes de repaso.
            </p>

            <p className="mb-0">
              Después de responder, elige <strong>Otra vez</strong>,{" "}
              <strong>Difícil</strong>, <strong>Bien</strong> o{" "}
              <strong>Fácil</strong>. La aplicación calculará cuándo debe volver
              a aparecer esa tarjeta.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-foreground">
              Guardado, exportación e importación
            </h2>

            <p className="mb-2">
              Tus listas y tu progreso se guardan en este navegador.
            </p>

            <p className="mb-0">
              Puedes exportar tus datos a un archivo JSON e importarlos más
              adelante. Al importar, los datos actuales se sustituyen por los del
              archivo importado.
            </p>
          </section>
        </div>
      </details>
    </section>
  );
}
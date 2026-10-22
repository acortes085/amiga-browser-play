import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { FolderUp, Disc, HardDrive, Sparkles } from "lucide-react";
import { detectGameFromFiles, type CustomGame } from "@/lib/customGame";

type Props = {
  onGameLoaded: (game: CustomGame) => void;
  onError?: (msg: string) => void;
};

export function CustomGameUploader({ onGameLoaded, onError }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const detected = detectGameFromFiles(files);
    if (!detected) {
      onError?.("Solo se admiten archivos .ADF (imágenes de disco) o .ZIP de Amiga.");
      return;
    }
    onGameLoaded(detected);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset para permitir volver a seleccionar los mismos archivos si se desea
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="mb-10">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative cursor-pointer border-2 bg-card p-6 pixel-shadow transition-all ${
          isDragging
            ? "border-primary bg-primary/10 ring-2 ring-primary/40 scale-[1.01]"
            : "border-primary/50 hover:border-primary hover:bg-card/90"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".adf,.zip,.ADF,.ZIP"
          className="hidden"
          onChange={onInputChange}
        />

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center border-2 border-primary bg-background text-primary pixel-shadow">
              <Disc className={`h-8 w-8 ${isDragging ? "animate-spin" : ""}`} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-sm text-primary sm:text-base">
                  CARGA TU PROPIO JUEGO (.ADF / .ZIP)
                </h2>
                <span className="border border-primary/40 bg-primary/20 px-1.5 py-0.5 font-display text-[10px] text-primary">
                  100% LOCAL
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/90">
                Arrastra o selecciona tus archivos locales de Amiga. Soporte completo multidisco.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-primary" />
                  Disco único: .ADF o .ZIP directo
                </span>
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Multidisco: selección múltiple de .ADF (auto-ordenado + .M3U en memoria)
                </span>
              </div>
              <p className="mt-2 font-sans text-xs text-muted-foreground">
                ¿Algún problema con tus archivos? Escríbeme en Telegram:{" "}
                <a
                  href="https://t.me/acores085"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  @acores085
                </a>
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex shrink-0 items-center gap-2 border-2 border-primary bg-primary px-4 py-2 font-display text-xs text-primary-foreground pixel-shadow transition-transform hover:-translate-y-0.5 active:translate-y-0"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FolderUp className="h-4 w-4" />
            <span>SUBIR ARCHIVOS</span>
          </button>
        </div>

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-xs">
            <p className="font-display text-base text-primary animate-pulse">
              ¡SUELTA LOS DISCOS PARA INSERTARLOS EN DF0:!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

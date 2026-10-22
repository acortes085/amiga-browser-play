import { useEffect } from "react";
import { ArrowLeft, Disc, Info } from "lucide-react";
import { KICKSTART_ROM } from "@/lib/games";

type Props = {
  title: string;
  slug: string;
  blob: Blob;
  blobUrl: string;
  fileName: string;
  isMultiDisk: boolean;
  diskCount: number;
  onExit: () => void;
};

export function CustomGamePlayer({
  title,
  slug,
  blob,
  blobUrl,
  fileName,
  isMultiDisk,
  diskCount,
  onExit,
}: Props) {
  // Compartir la referencia directa al Blob en el objeto window global
  // para que el iframe pueda generar su propia URL sin que React StrictMode la destruya.
  if (typeof window !== "undefined") {
    (window as any).__amigaCustomBlob = blob;
  }

  const handleExit = () => {
    try {
      if (typeof window !== "undefined") {
        delete (window as any).__amigaCustomBlob;
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (e) {
      console.warn("Error liberando blob:", e);
    }
    onExit();
  };

  const src = `/player.html?${new URLSearchParams({
    slug: slug || "custom-game",
    name: fileName,
    game: blobUrl,
    bios: KICKSTART_ROM,
    mode: "start",
    custom: "1",
    premium: "1",
  })}`;

  return (
    <section className="mb-10">
      {/* Barra superior de navegación y controles */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary/30 pb-3">
        <button
          onClick={handleExit}
          className="flex items-center gap-2 border-2 border-primary bg-card px-3 py-1.5 font-display text-xs text-primary pixel-shadow transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>◀ VOLVER AL MENÚ</span>
        </button>

        <div className="flex items-center gap-2">
          <Disc className="h-4 w-4 text-primary animate-spin" />
          <h2 className="font-display text-xs text-foreground sm:text-sm">
            {title.toUpperCase()}
          </h2>
          <span className="border border-primary/50 bg-primary/20 px-2 py-0.5 font-display text-[10px] text-primary">
            {isMultiDisk ? `${diskCount} DISCOS` : "1 DISCO"}
          </span>
        </div>
      </div>

      {/* Pantalla del emulador */}
      <div className="aspect-[4/3] w-full border-2 border-primary bg-black pixel-shadow">
        <iframe
          key={src}
          id="custom-amiga-frame"
          src={src}
          title={title}
          className="h-full w-full"
          allow="fullscreen; gamepad; autoplay; keyboard-map"
          onLoad={(e) => e.currentTarget.focus()}
        />
      </div>

      {/* Recordatorio / Guía de cambio de disco para el usuario */}
      <div className="mt-3 flex items-start gap-2 border border-muted bg-card/60 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <div className="space-y-1">
          <p className="font-sans text-sm text-foreground">
            <strong>Cómo cambiar de disco en el emulador:</strong>
          </p>
          <p className="font-sans leading-relaxed">
            {isMultiDisk ? (
              <>
                Tus <strong>{diskCount} discos</strong> están cargados en memoria. Cuando el juego
                muestre un mensaje solicitando otro disco (por ejemplo <em>"Insert Disk 2"</em>), haz
                clic en el <strong>icono de disquete (💾)</strong> de la barra inferior de
                EmulatorJS y elige el disco correspondiente para continuar la partida.
              </>
            ) : (
              <>
                El disco está insertado en <strong>DF0:</strong>. Para reiniciar o pausar el juego,
                utiliza los controles de la barra inferior de EmulatorJS.
              </>
            )}
          </p>
          <p className="font-sans text-xs text-muted-foreground pt-1 border-t border-muted/50 mt-2">
            ¿Algún problema con la emulación? Escríbeme en Telegram:{" "}
            <a
              href="https://t.me/acores085"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              @acores085
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

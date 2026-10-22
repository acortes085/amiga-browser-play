import { useState } from "react";
import { Disc, Play, X, Info, HardDrive, Edit3, Check } from "lucide-react";
import { type CustomGame, formatBytes, buildGameLaunchData } from "@/lib/customGame";

type Props = {
  game: CustomGame;
  onLaunch: (launchData: { blob: Blob; blobUrl: string; name: string; slug: string; title: string }) => void;
  onCancel: () => void;
};

export function CustomGamePreview({ game, onLaunch, onCancel }: Props) {
  const [title, setTitle] = useState(game.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isPackaging, setIsPackaging] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartGame = async () => {
    setIsPackaging(true);
    try {
      const updatedGame: CustomGame = {
        ...game,
        title,
      };
      const launchData = await buildGameLaunchData(updatedGame, (pct) => setProgress(pct));
      onLaunch({
        ...launchData,
        title,
      });
    } catch (err) {
      console.error("Error al preparar el juego:", err);
      alert("Hubo un error al preparar los archivos del juego en memoria.");
      setIsPackaging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl border-2 border-primary bg-card p-6 pixel-shadow">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b-2 border-primary/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-primary bg-background text-primary">
              <Disc className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-[10px] text-muted-foreground uppercase">
                DISCO(S) LISTOS PARA INSERTAR
              </p>
              {isEditingTitle ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-2 border-primary bg-background px-2 py-0.5 font-display text-sm text-foreground focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="border border-primary bg-primary p-1 text-primary-foreground hover:bg-primary/90"
                    title="Confirmar nombre"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="font-display text-base text-primary sm:text-lg">{title}</h3>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Editar nombre"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onCancel}
            disabled={isPackaging}
            className="border-2 border-transparent p-1 text-muted-foreground hover:border-muted hover:text-foreground disabled:opacity-50"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resumen del tipo de carga */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-2 border-muted bg-background/50 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" />
            <span className="font-display text-[11px]">
              {game.isZip
                ? "PAQUETE .ZIP (Arranca el primer disco o .M3U interno)"
                : game.isMultiDisk
                ? `${game.disks.length} DISCOS (.ADF) — MULTIDISCO AUTOMÁTICO`
                : "DISCO ÚNICO (.ADF)"}
            </span>
          </div>
          <span className="text-muted-foreground">Tamaño total: {formatBytes(game.totalSize)}</span>
        </div>

        {/* Lista ordenada de discos detectados */}
        <div className="mt-4">
          <p className="mb-2 font-display text-xs text-muted-foreground">
            ORDEN DE DISCOS ASIGNADO:
          </p>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {game.disks.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center justify-between border-2 border-muted/80 bg-background/80 p-2 text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-primary/50 bg-primary/20 font-display text-[10px] text-primary">
                    {i + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-sans text-sm font-semibold text-foreground truncate">{d.name}</p>
                    <p className="font-display text-[10px] text-muted-foreground">{d.label}</p>
                  </div>
                </div>
                <span className="shrink-0 text-muted-foreground font-sans">{formatBytes(d.size)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aviso explicativo de multidisco */}
        {game.isMultiDisk && (
          <div className="mt-4 flex items-start gap-2.5 border-2 border-amber-500/40 bg-amber-500/10 p-3 text-xs text-foreground">
            <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <p className="font-sans leading-relaxed">
              <strong>Control multidisco integrado:</strong> Se ha generado automáticamente un
              archivo <code>.m3u</code> en memoria con tus discos en orden. Cuando el juego te pida
              cambiar de disco durante la partida, haz clic en el icono de disquete (💾) en la barra
              inferior de EmulatorJS para alternar entre los discos.
            </p>
          </div>
        )}

        {/* Barra de progreso si está empaquetando en memoria */}
        {isPackaging && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between font-display text-[10px] text-primary">
              <span>EMPAQUETANDO DISCOS EN MEMORIA...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden border border-primary bg-background">
              <div
                className="h-full bg-primary transition-all duration-150"
                style={{ width: `${Math.max(5, progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPackaging}
            className="border-2 border-muted bg-card px-4 py-2.5 font-display text-xs text-foreground hover:bg-muted disabled:opacity-50"
          >
            ✕ CANCELAR
          </button>
          <button
            type="button"
            onClick={handleStartGame}
            disabled={isPackaging}
            className="flex items-center justify-center gap-2 border-2 border-primary bg-primary px-6 py-2.5 font-display text-xs text-primary-foreground pixel-shadow transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{isPackaging ? "PREPARANDO..." : "▶ INSERTAR EN DF0: Y JUGAR"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

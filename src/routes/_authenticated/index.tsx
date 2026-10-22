import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { GAMES, getGenre } from "@/lib/games";
import { type CustomGame } from "@/lib/customGame";
import { AppHeader } from "@/components/AppHeader";
import { GameCover } from "@/components/GameCover";
import { CustomGameUploader } from "@/components/CustomGameUploader";
import { CustomGamePreview } from "@/components/CustomGamePreview";
import { CustomGamePlayer } from "@/components/CustomGamePlayer";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Amiga Arcade — Juegos clásicos de Amiga en el navegador" },
      { name: "description", content: "Juega a Face Off, Defender of the Crown, Sensible Soccer, Agony y OutRun Europa desde la web." },
      { property: "og:title", content: "Amiga Arcade" },
      { property: "og:description", content: "Juegos clásicos de Amiga directamente en tu navegador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type ActiveCustomGame = {
  blob: Blob;
  blobUrl: string;
  name: string;
  slug: string;
  title: string;
  isMultiDisk: boolean;
  diskCount: number;
};

function Index() {
  const [genre, setGenre] = useState("Todos");
  const [previewGame, setPreviewGame] = useState<CustomGame | null>(null);
  const [activeGame, setActiveGame] = useState<ActiveCustomGame | null>(null);

  const sorted = [...GAMES].sort((a, b) => a.title.localeCompare(b.title, "es"));
  const genres = ["Todos", ...Array.from(new Set(sorted.map((g) => getGenre(g.slug)))).sort((a, b) => a.localeCompare(b, "es"))];
  const visible = genre === "Todos" ? sorted : sorted.filter((g) => getGenre(g.slug) === genre);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <AppHeader />
      <header className="mb-10 flex items-center gap-4">
        <div className="boing h-14 w-14 shrink-0 animate-bounce" />
        <div>
          <h1 className="font-display text-xl text-primary sm:text-3xl">AMIGA ARCADE</h1>
          <p className="text-muted-foreground">Elige un disco o carga tus propios .ADF / .ZIP en DF0:</p>
        </div>
      </header>

      {/* Si hay un juego propio en ejecución, se muestra el reproductor retro */}
      {activeGame ? (
        <CustomGamePlayer
          title={activeGame.title}
          slug={activeGame.slug}
          blob={activeGame.blob}
          blobUrl={activeGame.blobUrl}
          fileName={activeGame.name}
          isMultiDisk={activeGame.isMultiDisk}
          diskCount={activeGame.diskCount}
          onExit={() => setActiveGame(null)}
        />
      ) : (
        <>
          {/* Zona de carga y arrastre para juegos propios (.ADF / .ZIP) */}
          <CustomGameUploader
            onGameLoaded={(detected) => setPreviewGame(detected)}
            onError={(msg) => toast.error(msg)}
          />

          {/* Filtros por género del catálogo */}
          <div className="mb-6 flex flex-wrap gap-2">
            {genres.map((x) => (
              <button
                key={x}
                onClick={() => setGenre(x)}
                className={`border-2 px-3 py-1 font-display text-xs ${genre === x ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
              >
                {x.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Catálogo de juegos */}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/juego/$slug"
                  params={{ slug: g.slug }}
                  className="group block border-2 bg-card pixel-shadow transition-transform hover:-translate-y-1"
                >
                  <GameCover game={g} />
                  <div className="p-3">
                    <p className="text-muted-foreground">{g.publisher} · {g.year} · {getGenre(g.slug)}</p>
                    <p>{g.description}</p>
                    <p className="mt-2 font-display text-xs text-primary group-hover:underline">JUGAR ▶</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Pantalla previa modal antes de arrancar el juego personalizado */}
      {previewGame && (
        <CustomGamePreview
          game={previewGame}
          onLaunch={(launchData) => {
            setActiveGame({
              blob: launchData.blob,
              blobUrl: launchData.blobUrl,
              name: launchData.name,
              slug: launchData.slug,
              title: launchData.title,
              isMultiDisk: previewGame.isMultiDisk,
              diskCount: previewGame.disks.length,
            });
            setPreviewGame(null);
          }}
          onCancel={() => setPreviewGame(null)}
        />
      )}

      {/* Pie de página con enlace de soporte / contacto */}
      <footer className="mt-16 border-t-2 border-primary/20 pt-6 pb-2 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Algún problema? Escríbeme en Telegram:{" "}
          <a
            href="https://t.me/acores085"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xs text-primary hover:underline"
          >
            @acores085
          </a>
        </p>
      </footer>
    </main>
  );
}

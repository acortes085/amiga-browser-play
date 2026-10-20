import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GAMES, getGenre } from "@/lib/games";
import { AppHeader } from "@/components/AppHeader";
import { GameCover } from "@/components/GameCover";

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

function Index() {
  const [genre, setGenre] = useState("Todos");
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
          <p className="text-muted-foreground">Elige un disco e inserta en DF0:</p>
        </div>
      </header>
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
    </main>
  );
}

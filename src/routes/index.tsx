import { createFileRoute, Link } from "@tanstack/react-router";
import { GAMES } from "@/lib/games";

export const Route = createFileRoute("/")({
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

const toneBg = {
  red: "bg-tone-red",
  blue: "bg-tone-blue",
  green: "bg-tone-green",
  orange: "bg-tone-orange",
  purple: "bg-tone-purple",
} as const;

function Index() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10 flex items-center gap-4">
        <div className="boing h-14 w-14 shrink-0 animate-bounce" />
        <div>
          <h1 className="font-display text-xl text-primary sm:text-3xl">AMIGA ARCADE</h1>
          <p className="text-muted-foreground">Elige un disco e inserta en DF0:</p>
        </div>
      </header>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => (
          <li key={g.slug}>
            <Link
              to="/juego/$slug"
              params={{ slug: g.slug }}
              className="group block border-2 bg-card pixel-shadow transition-transform hover:-translate-y-1"
            >
              <div className={`${toneBg[g.tone]} flex h-32 items-end p-3`}>
                <span className="font-display text-sm leading-relaxed text-foreground">{g.title}</span>
              </div>
              <div className="p-3">
                <p className="text-muted-foreground">{g.publisher} · {g.year}</p>
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

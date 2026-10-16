import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getGame, KICKSTART_ROM } from "@/lib/games";
import { deleteSave, getSaveInfo } from "@/lib/saves";
import { useMyRoles } from "@/lib/roles";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/_authenticated/juego/$slug")({
  loader: ({ params }) => {
    const game = getGame(params.slug);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.game.title ?? "Juego";
    return {
      meta: [
        { title: `${t} — Amiga Arcade` },
        { name: "description", content: `Juega a ${t} de Amiga en tu navegador.` },
        { property: "og:title", content: `${t} — Amiga Arcade` },
        { property: "og:description", content: `Juega a ${t} de Amiga en tu navegador.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: GamePage,
});

type Launch = { mode: "start" | "saved" | "point"; state?: string } | null;

const btn = "w-full border-2 bg-secondary p-4 text-left pixel-shadow transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:pointer-events-none";

function GamePage() {
  const { game } = Route.useLoaderData();
  const { data: me } = useMyRoles();
  const premium = !!me?.premium;
  const [launch, setLaunch] = useState<Launch>(null);
  const [save, setSave] = useState<{ date: number } | null>(null);

  useEffect(() => {
    getSaveInfo(game.slug).then(setSave);
    const onMsg = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data?.type === "amiga-saved") getSaveInfo(game.slug).then(setSave);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [game.slug]);

  const src = launch
    ? `/player.html?${new URLSearchParams({
        slug: game.slug,
        game: game.disk,
        bios: KICKSTART_ROM,
        mode: launch.mode,
        premium: premium ? "1" : "0",
        ...(launch.state ? { state: launch.state } : {}),
      })}`
    : "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <AppHeader />
      <Link to="/" className="font-display text-xs text-primary hover:underline">◀ VOLVER</Link>
      <h1 className="mt-4 font-display text-xl sm:text-2xl">{game.title}</h1>
      <p className="text-muted-foreground">{game.publisher} · {game.year} — {game.description}</p>

      {launch ? (
        <div className="mt-6">
          <div className="aspect-[4/3] w-full border-2 bg-background pixel-shadow">
            <iframe
              key={src}
              id="amiga-frame"
              src={src}
              title={game.title}
              className="h-full w-full"
              allow="fullscreen; gamepad; autoplay; keyboard-map"
              onLoad={(e) => e.currentTarget.focus()}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {KEYS.map((k) => (
              <button
                key={k.code}
                onClick={() => sendKey(k)}
                className="min-w-10 border-2 bg-secondary px-2 py-1 pixel-shadow hover:bg-primary hover:text-primary-foreground"
              >
                {k.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-muted-foreground">
            Haz clic dentro del juego para usar tu teclado, o pulsa estas teclas. Usa el botón de guardar del emulador para guardar tu partida en este navegador.
          </p>
          <button onClick={() => setLaunch(null)} className="mt-3 font-display text-xs text-primary hover:underline">
            ■ SALIR DEL JUEGO
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <section>
            <h2 className="mb-3 font-display text-xs text-primary">1. DESDE EL INICIO</h2>
            <button className={btn} onClick={() => setLaunch({ mode: "start" })}>Arrancar el disco</button>
          </section>
          {premium && (
          <section>
            <h2 className="mb-3 font-display text-xs text-primary">2. PARTIDA GUARDADA</h2>
            <button className={btn} disabled={!save} onClick={() => setLaunch({ mode: "saved" })}>
              {save ? `Continuar (${new Date(save.date).toLocaleString("es-ES")})` : "Aún no hay partida guardada"}
            </button>
            {save && (
              <button
                onClick={() => deleteSave(game.slug).then(() => setSave(null))}
                className="mt-2 text-destructive hover:underline"
              >
                Borrar partida
              </button>
            )}
          </section>
          )}
           {premium && (
          <section>
            <h2 className="mb-3 font-display text-xs text-primary">3. PUNTO ELEGIDO</h2>
            {game.points.length === 0 ? (
              <p className="border-2 border-dashed p-4 text-muted-foreground">Todavía no hay puntos preparados.</p>
            ) : (
              <div className="space-y-3">
                {game.points.map((p) => (
                  <button key={p.file} className={btn} onClick={() => setLaunch({ mode: "point", state: p.file })}>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </section>
          )}
        </div>
      )}
    </main>
  );
}

type VKey = { label: string; key: string; code: string; keyCode: number };
const KEYS: VKey[] = [
  ...Array.from({ length: 10 }, (_, i) => {
    const n = (i + 1) % 10;
    return { label: String(n), key: String(n), code: `Digit${n}`, keyCode: 48 + n };
  }),
  ...Array.from({ length: 10 }, (_, i) => ({ label: `F${i + 1}`, key: `F${i + 1}`, code: `F${i + 1}`, keyCode: 112 + i })),
  { label: "ESPACIO", key: " ", code: "Space", keyCode: 32 },
  { label: "ENTER", key: "Enter", code: "Enter", keyCode: 13 },
  { label: "ESC", key: "Escape", code: "Escape", keyCode: 27 },
];

function sendKey(k: VKey) {
  const f = document.getElementById("amiga-frame") as HTMLIFrameElement | null;
  f?.contentWindow?.postMessage({ type: "amiga-key", ...k }, location.origin);
  f?.focus();
}

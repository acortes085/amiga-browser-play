import { useState } from "react";
import type { Game } from "@/lib/games";

const toneBg = {
  red: "bg-tone-red",
  blue: "bg-tone-blue",
  green: "bg-tone-green",
  orange: "bg-tone-orange",
  purple: "bg-tone-purple",
} as const;

/** Carátula: archivo real en public/covers/<slug>.jpg; si no existe, muestra el título. */
export function GameCover({ game }: { game: Game }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`${toneBg[game.tone]} relative flex aspect-[3/4] items-end overflow-hidden p-3`}>
      <span className="font-display text-sm leading-relaxed text-foreground">{game.title}</span>
      {!failed && (
        <img
          src={`/covers/${game.slug}.jpg`}
          alt={`Carátula original de ${game.title}`}
          loading="lazy"
          width={600}
          height={800}
          className="absolute inset-0 h-full w-full bg-card object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

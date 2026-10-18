import { useState } from "react";
import type { Game } from "@/lib/games";

const assets = import.meta.glob<{ url: string }>("../assets/covers/*.asset.json", {
  eager: true,
  import: "default",
});

const toneBg = {
  red: "bg-tone-red",
  blue: "bg-tone-blue",
  green: "bg-tone-green",
  orange: "bg-tone-orange",
  purple: "bg-tone-purple",
} as const;

export function GameCover({ game }: { game: Game }) {
  const [failed, setFailed] = useState(false);
  const cover = assets[`../assets/covers/${game.slug}.jpg.asset.json`]?.url;

  return (
    <div className={`${toneBg[game.tone]} relative flex aspect-[3/4] items-end overflow-hidden p-3`}>
      {cover && !failed ? (
        <img
          src={cover}
          alt={`Carátula original de ${game.title}`}
          loading="lazy"
          width={600}
          height={800}
          className="absolute inset-0 h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-display text-sm leading-relaxed text-foreground">{game.title}</span>
      )}
    </div>
  );
}
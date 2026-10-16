export type SavePoint = { label: string; file: string };

export type Game = {
  slug: string;
  title: string;
  year: number;
  publisher: string;
  description: string;
  /** Disco del juego (.adf o .zip con varios .adf + .m3u para multidisco) */
  disk: string;
  /** Puntos de partida preparados (archivos .state de EmulatorJS) */
  points: SavePoint[];
  tone: "red" | "blue" | "green" | "orange" | "purple";
};

/** Kickstart ROM compartida por todos los juegos */
export const KICKSTART_ROM = "/amiga/kick34005.A500";

export const GAMES: Game[] = [
  {
    slug: "faceoff",
    title: "Face Off",
    year: 1991,
    publisher: "Krisalis",
    description: "Hockey sobre hielo rápido y brutal, con peleas incluidas.",
    disk: "/games/faceoff/disk1.adf",
    points: [{ label: "Loaded", file: "/games/faceoff/faceoff.state" }],
    tone: "blue",
  },
  {
    slug: "defender-of-the-crown",
    title: "Defender of the Crown",
    year: 1986,
    publisher: "Cinemaware",
    description: "Conquista Inglaterra con asedios, justas y rescates.",
    disk: "/games/defender-of-the-crown/defender.zip",
    points: [{ label: "Loaded", file: "/games/defender-of-the-crown/defender.state" }],
    tone: "red",
  },
  {
    slug: "sensible-soccer",
    title: "Sensible Soccer",
    year: 1992,
    publisher: "Renegade",
    description: "El fútbol de vista cenital más adictivo de la historia.",
    disk: "/games/sensible-soccer/sensible-soccer.zip",
    points: [{ label: "Loaded", file: "/games/sensible-soccer/sensible.state" }],
    tone: "green",
  },
  {
    slug: "agony",
    title: "Agony",
    year: 1992,
    publisher: "Psygnosis",
    description: "Shoot'em up de scroll lateral con un búho y música mítica.",
    disk: "/games/agony/agony.zip",
    points: [{ label: "Loaded", file: "/games/agony/agony.state" }],
    tone: "purple",
  },
  {
    slug: "outrun-europa",
    title: "OutRun Europa",
    year: 1991,
    publisher: "U.S. Gold",
    description: "Persecución por carreteras de toda Europa en coche, moto y lancha.",
    disk: "/games/outrun-europa/outrun-europa.zip",
    points: [],
    tone: "orange",
  },
];

export const getGame = (slug: string) => GAMES.find((g) => g.slug === slug);

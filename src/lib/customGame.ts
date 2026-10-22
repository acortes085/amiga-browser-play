import JSZip from "jszip";

export type DiskItem = {
  name: string;
  size: number;
  label: string;
  index: number;
};

export type CustomGame = {
  id: string;
  title: string;
  slug: string;
  files: File[];
  isZip: boolean;
  isMultiDisk: boolean;
  disks: DiskItem[];
  totalSize: number;
};

/** Formatea bytes a KB o MB legibles */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/** Limpia el nombre del archivo para obtener un título legible del juego */
export function cleanGameTitle(rawName: string): string {
  let name = rawName.replace(/\.[^/.]+$/, ""); // quitar extensión

  // Quitar patrones típicos de multidisco: (Disk 1), _disk1, [Disk 1 of 4], - disco 2, etc.
  name = name.replace(/[\s_.-]*\((?:disk|disc|dsk|disco|d)\s*[-_#]?\s*\d+(?:\s*(?:of|de)\s*\d+)?\)/gi, "");
  name = name.replace(/[\s_.-]*\[(?:disk|disc|dsk|disco|d)\s*[-_#]?\s*\d+(?:\s*(?:of|de)\s*\d+)?\]/gi, "");
  name = name.replace(/[\s_.-]+(?:disk|disc|dsk|disco|d)\s*[-_#]?\s*\d+.*$/gi, "");
  name = name.replace(/[\s_.-]+(?:side|cara)\s*[a-b0-9].*$/gi, "");
  name = name.replace(/[-_]+/g, " ").trim();

  // Si tras la limpieza queda vacío, volver al original sin extensión
  if (!name) {
    name = rawName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
  }

  // Capitalización de palabras
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Genera un slug seguro a partir del título */
export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "custom-game";
}

/**
 * Analiza una lista de archivos seleccionados o arrastrados:
 * - Filtra por .adf y .zip
 * - Ordena naturalmente por nombre
 * - Detecta el juego y la estructura multidisco
 */
export function detectGameFromFiles(rawFiles: FileList | File[]): CustomGame | null {
  const filesArray = Array.from(rawFiles);
  // Aceptamos solo .adf y .zip (insensible a mayúsculas)
  const validFiles = filesArray.filter((f) => {
    const ext = f.name.toLowerCase();
    return ext.endsWith(".adf") || ext.endsWith(".zip");
  });

  if (validFiles.length === 0) return null;

  // Ordenación natural por nombre de archivo (Disk 1, Disk 2, Disk 10...)
  const sortedFiles = [...validFiles].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );

  const isZip = sortedFiles.length === 1 && sortedFiles[0].name.toLowerCase().endsWith(".zip");
  const isMultiDisk = !isZip && sortedFiles.length > 1;

  const firstFileName = sortedFiles[0].name;
  const title = cleanGameTitle(firstFileName);
  const slug = slugifyTitle(title);
  const totalSize = sortedFiles.reduce((acc, f) => acc + f.size, 0);

  const disks: DiskItem[] = sortedFiles.map((file, idx) => {
    let label = `DF0: (Disco de arranque)`;
    if (isZip) {
      label = "Archivo contenedor .ZIP (arranque automático)";
    } else if (isMultiDisk) {
      label = idx === 0 ? "DF0: Disco 1 (Disco de arranque)" : `DF0: Disco ${idx + 1} (Intercambiable)`;
    }
    return {
      name: file.name,
      size: file.size,
      label,
      index: idx + 1,
    };
  });

  return {
    id: `custom-${slug}-${Date.now()}`,
    title,
    slug,
    files: sortedFiles,
    isZip,
    isMultiDisk,
    disks,
    totalSize,
  };
}

/**
 * Empaqueta o prepara el juego para el emulador:
 * - Si es 1 archivo (.adf o .zip): crea Blob URL directo
 * - Si son varios .adf: genera .m3u + empaqueta en .zip en memoria con JSZip
 * Retorna la URL del Blob y el nombre asignado
 */
export async function buildGameLaunchData(
  game: CustomGame,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; blobUrl: string; name: string; slug: string }> {
  // Caso 1: Archivo único (.adf o .zip) -> Carga directa
  if (!game.isMultiDisk) {
    const file = game.files[0];
    const blobUrl = URL.createObjectURL(file);
    return {
      blob: file,
      blobUrl,
      name: file.name,
      slug: game.slug,
    };
  }

  // Caso 2: Multidisco con varios .adf -> Generar .m3u y empaquetar en .zip
  const zip = new JSZip();

  // Lista ordenada de los nombres de disco
  const diskFileNames = game.files.map((f) => f.name);

  // Archivo de lista de reproducción .m3u para EmulatorJS / PUAE
  const m3uName = `${game.slug}.m3u`;
  const m3uContent = diskFileNames.join("\n") + "\n";
  zip.file(m3uName, m3uContent);

  // Añadir cada archivo .adf al zip
  for (const file of game.files) {
    zip.file(file.name, file);
  }

  // Generar el blob ZIP en memoria (usando DEFLATE rápido level 1)
  const zipBlob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 1 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  const blobUrl = URL.createObjectURL(zipBlob);
  const zipFileName = `${game.slug}.zip`;

  return {
    blob: zipBlob,
    blobUrl,
    name: zipFileName,
    slug: game.slug,
  };
}

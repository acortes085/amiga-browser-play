// Partidas guardadas en el navegador (IndexedDB). Mismo esquema que public/player.html.
const DB = "amiga-saves";
const STORE = "states";

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function getSaveInfo(slug: string): Promise<{ date: number } | null> {
  const db = await open();
  return new Promise((res) => {
    const q = db.transaction(STORE).objectStore(STORE).get(slug);
    q.onsuccess = () => res(q.result ? { date: q.result.date } : null);
    q.onerror = () => res(null);
  });
}

export async function deleteSave(slug: string) {
  const db = await open();
  return new Promise<void>((res) => {
    const t = db.transaction(STORE, "readwrite");
    t.objectStore(STORE).delete(slug);
    t.oncomplete = () => res();
  });
}

/** Solo admin: descarga el guardado actual del juego como archivo .state (para usarlo como "punto elegido") */
export async function exportSave(slug: string, name?: string): Promise<boolean> {
  const db = await open();
  const saved = await new Promise<{ state: Uint8Array | ArrayBuffer } | undefined>((res) => {
    const q = db.transaction(STORE).objectStore(STORE).get(slug);
    q.onsuccess = () => res(q.result);
    q.onerror = () => res(undefined);
  });
  if (!saved) return false;
  const url = URL.createObjectURL(new Blob([saved.state as BlobPart], { type: "application/octet-stream" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name || slug}.state`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
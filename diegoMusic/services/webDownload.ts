type FsDirectoryHandle = any;

const DB_NAME = 'diegomusic-fs';
const STORE = 'handles';
const KEY = 'rootDir';

const supportsFsAccess = (): boolean =>
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

const openDb = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => req.result.createObjectStore(STORE);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const idbGet = async <T>(key: string): Promise<T | null> => {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    tx.onsuccess = () => resolve((tx.result as T) ?? null);
    tx.onerror = () => resolve(null);
  });
};

const idbSet = async (key: string, value: any): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, key);
    tx.onsuccess = () => resolve();
    tx.onerror = () => resolve();
  });
};

const ensurePermission = async (handle: FsDirectoryHandle): Promise<boolean> => {
  const opts = { mode: 'readwrite' as const };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  return (await handle.requestPermission(opts)) === 'granted';
};

const getOrPickRootDir = async (forcePick = false): Promise<FsDirectoryHandle | null> => {
  if (!supportsFsAccess()) return null;

  if (!forcePick) {
    const cached = await idbGet<FsDirectoryHandle>(KEY);
    if (cached && (await ensurePermission(cached))) return cached;
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      id: 'diegomusic-root',
      mode: 'readwrite',
      startIn: 'music',
    });
    await idbSet(KEY, handle);
    return handle;
  }
  catch {
    return null;
  }
};

const sanitizeFilename = (name: string): string =>
  name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 180);

const fileExists = async (dir: FsDirectoryHandle, filename: string): Promise<boolean> => {
  try {
    await dir.getFileHandle(filename);
    return true;
  }
  catch {
    return false;
  }
};

export const webDownload = {
  isSupported: supportsFsAccess,

  async pickFolder(): Promise<boolean> {
    return !!(await getOrPickRootDir(true));
  },

  async hasFolder(): Promise<boolean> {
    if (!supportsFsAccess()) return false;
    const cached = await idbGet<FsDirectoryHandle>(KEY);
    if (!cached) return false;
    return (await cached.queryPermission({ mode: 'readwrite' })) === 'granted';
  },

  async isDownloaded(songId: string, title: string): Promise<boolean> {
    if (!supportsFsAccess()) return false;
    const dir = await getOrPickRootDir();
    if (!dir) return false;
    const filename = `${sanitizeFilename(title || songId)}.mp3`;
    return fileExists(dir, filename);
  },

  async downloadOne(opts: { songId: string; title: string; url: string }): Promise<'downloaded' | 'skipped' | 'failed'> {
    const { songId, title, url } = opts;
    const filename = `${sanitizeFilename(title || songId)}.mp3`;

    const dir = await getOrPickRootDir();
    if (dir) {
      try {
        if (await fileExists(dir, filename)) return 'skipped';
        const res = await fetch(url);
        if (!res.ok) return 'failed';
        const handle = await dir.getFileHandle(filename, { create: true });
        const writable = await handle.createWritable();
        await res.body!.pipeTo(writable);
        return 'downloaded';
      }
      catch {
        return 'failed';
      }
    }

    try {
      const res = await fetch(url);
      if (!res.ok) return 'failed';
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `DiegoMusic_${filename}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return 'downloaded';
    }
    catch {
      return 'failed';
    }
  },
};

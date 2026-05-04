export const cacheDirectory: string | null = null;
export const documentDirectory: string | null = null;

export const FileSystemSessionType = {
  BACKGROUND: 'BACKGROUND' as const,
  FOREGROUND: 'FOREGROUND' as const,
};

export async function getInfoAsync(_uri: string): Promise<{ exists: false; isDirectory: false }> {
  return { exists: false, isDirectory: false };
}

export async function deleteAsync(_uri: string, _options?: { idempotent?: boolean }): Promise<void> {}
export async function makeDirectoryAsync(_uri: string, _options?: { intermediates?: boolean }): Promise<void> {}
export function createDownloadResumable(
  _url: string,
  _fileUri: string,
  _options?: object,
  _callback?: (progress: object) => void,
) {
  return {
    downloadAsync: async () => null,
    pauseAsync: async () => null,
    resumeAsync: async () => null,
    cancelAsync: async () => {},
    savable: () => ({ url: _url, fileUri: _fileUri, options: {}, resumeData: undefined }),
  };
}

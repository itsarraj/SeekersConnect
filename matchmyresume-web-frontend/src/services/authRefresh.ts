let refreshFn: (() => Promise<void>) | null = null;

export function setAuthRefresh(fn: (() => Promise<void>) | null): void {
  refreshFn = fn;
}

export async function tryRefreshAuth(): Promise<boolean> {
  if (refreshFn) {
    await refreshFn();
    return true;
  }
  return false;
}

/**
 * Lightweight scroll-position store backed by sessionStorage.
 *
 * Usage pattern:
 *  – Before navigating away:  saveScrollPosition('home', getScrollContainer()?.scrollTop ?? 0)
 *  – On mount (useEffect):    restoreScrollPosition('home')
 */

const STORAGE_KEY = 'khadam_scroll';

const getStore = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

/** Persist the scroll offset for a named page key. */
export const saveScrollPosition = (key: string, scrollTop: number): void => {
  try {
    const store = getStore();
    store[key] = scrollTop;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* ignore */ }
};

/** Return the persisted scroll offset for a key (0 if not found). */
export const getScrollPosition = (key: string): number => {
  return getStore()[key] ?? 0;
};

/** Scroll the Layout's <main> container to a saved position.
 *  Uses rAF to wait for the DOM to be fully painted. */
export const restoreScrollPosition = (key: string): void => {
  const pos = getScrollPosition(key);
  if (!pos) return;
  requestAnimationFrame(() => {
    const container = document.querySelector('main');
    if (container) container.scrollTop = pos;
  });
};

/** Return the Layout's scrollable container element. */
export const getScrollContainer = (): HTMLElement | null =>
  document.querySelector('main');

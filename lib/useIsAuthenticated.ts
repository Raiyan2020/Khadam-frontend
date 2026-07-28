import { useEffect, useState } from 'react';
import { AUTH_CHANGED_EVENT } from './authBridge';

/**
 * Reactive "is there a token?" check.
 *
 * Use this instead of reading `localStorage.getItem('token')` inline — an inline
 * read is evaluated once per render and won't re-enable a query after login.
 *
 * Updates on:
 * - `auth:changed` — same-tab login/logout (fire it via `notifyAuthChanged`)
 * - `storage`      — login/logout in another tab
 */
export const useIsAuthenticated = (): boolean => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));

  useEffect(() => {
    const sync = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    // Re-check on mount in case the token changed before the listeners attached.
    sync();
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return isAuthenticated;
};

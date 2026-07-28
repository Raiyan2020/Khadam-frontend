/**
 * Bridge between non-React code (apiFetch, the router's beforeLoad guard) and the
 * React AuthProvider.
 *
 * Both of those run outside the component tree, so they can't call `useAuth()`.
 * They call `requestLogin()` instead, which does two things:
 *
 * 1. Dispatches an event the mounted AuthProvider listens to.
 * 2. Parks the request in a module variable, so a request made *before* the
 *    provider has attached its listener (e.g. a cold-start deep link into a
 *    guarded route) isn't lost — the provider drains it on mount.
 */

export const AUTH_REQUIRED_EVENT = 'auth:required';
export const AUTH_CHANGED_EVENT = 'auth:changed';

export interface LoginRequest {
  /** Path to navigate to once the user finishes logging in. */
  redirectTo?: string;
}

let pendingRequest: LoginRequest | null = null;

/** Ask the app to show the login popup. Safe to call from anywhere. */
export function requestLogin(redirectTo?: string) {
  pendingRequest = { redirectTo };
  window.dispatchEvent(
    new CustomEvent<LoginRequest>(AUTH_REQUIRED_EVENT, { detail: { redirectTo } })
  );
}

/** Read and clear any login request made before the provider was listening. */
export function consumePendingLoginRequest(): LoginRequest | null {
  const request = pendingRequest;
  pendingRequest = null;
  return request;
}

export function clearPendingLoginRequest() {
  pendingRequest = null;
}

/**
 * Fire after writing or removing the token so `useAuth()` picks up the change.
 * The native `storage` event only fires in *other* tabs, never the one that wrote.
 */
export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/** Clears every piece of auth state we persist. */
export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_type');
  localStorage.removeItem('khadam_fcm_registered_token');
  notifyAuthChanged();
}

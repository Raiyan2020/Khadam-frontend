import { router } from "@/router";
import { toast } from "sonner";
import { clearAuthStorage } from "./authBridge";

/**
 * Drop-in replacement for `fetch` that:
 * - Automatically injects `Authorization`, `Accept-Language`, and `lang` headers
 *   from localStorage / i18n so individual hooks don't need to repeat them.
 * - Globally handles 401 Unauthorized and block status: clears the stored token
 *   and redirects to /login, showing the toast only once even if multiple
 *   concurrent requests fail at the same time.
 *
 * Caller-supplied headers always take precedence over the injected defaults.
 */

/**
 * Guards against showing multiple toasts / triggering multiple redirects when
 * several concurrent requests all return 401 or block status at the same time.
 * Reset when the user successfully navigates away from the login page.
 */
let isRedirecting = false;

function handleAuthFailure(message?: string) {
  if (isRedirecting) return;
  isRedirecting = true;

  // Clear auth state (token, user, user_type, FCM) and notify, so the role
  // resets alongside it instead of surviving until the next reload.
  clearAuthStorage();

  // Show a single toast
  if (message) {
    toast.error(message);
  }

  // Redirect — use the TanStack router if available, fall back to hard redirect
  try {
    router.navigate({ to: '/login' } as any).finally(() => {
      // Allow the flag to reset after navigation completes so the next
      // real login attempt isn't blocked.
      setTimeout(() => { isRedirecting = false; }, 1000);
    });
  } catch {
    window.location.href = '/login';
  }
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('token');
  const language = localStorage.getItem('app_language') ?? localStorage.getItem('lang') ?? 'ar';

  const injectedHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Accept-Language': language,
    'lang': language,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  options = {
    ...options,
    headers: {
      ...injectedHeaders,
      // Caller-provided headers win over the defaults above
      ...(options.headers as Record<string, string> | undefined),
    },
  };

  const response = await fetch(url, options);

  // Check if response is JSON and has a block status
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const clone = response.clone();
      const body = await clone.json();
      if (body && body.status === 'block') {
        handleAuthFailure(body.message || 'Account blocked');
      }
    }
  } catch (error) {
    console.error('Error parsing response in apiFetch block check:', error);
  }

  if (response.status === 401) {
    handleAuthFailure();
  }

  return response;
}


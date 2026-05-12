import { router } from "@/router";

/**
 * Drop-in replacement for `fetch` that:
 * - Automatically injects `Authorization`, `Accept-Language`, and `lang` headers
 *   from localStorage / i18n so individual hooks don't need to repeat them.
 * - Globally handles 401 Unauthorized: clears the stored token and redirects to /login.
 *
 * Caller-supplied headers always take precedence over the injected defaults.
 */
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

  if (response.status === 401) {
    // Clear auth state
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect — use the TanStack router if available, fall back to hard redirect
    try {
      router.navigate({ to: '/login' } as any);
    } catch {
      window.location.href = '/login';
    }
  }

  return response;
}

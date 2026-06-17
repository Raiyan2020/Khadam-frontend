import { router } from "@/router";
import { toast } from "sonner";

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

  // Check if response is JSON and has a block status
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const clone = response.clone();
      const body = await clone.json();
      if (body && body.status === 'block') {
        // Clear auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Push toast notification
        toast.error(body.message || 'Account blocked');

        // Redirect — use the TanStack router if available, fall back to hard redirect
        try {
          router.navigate({ to: '/login' } as any);
        } catch {
          window.location.href = '/login';
        }
      }
    }
  } catch (error) {
    console.error('Error parsing response in apiFetch block check:', error);
  }

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

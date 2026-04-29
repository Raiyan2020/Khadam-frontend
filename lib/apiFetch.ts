import { router } from "@/router";

/**
 * Drop-in replacement for `fetch` that globally handles 401 Unauthorized:
 * clears the stored token and redirects to /login.
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
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

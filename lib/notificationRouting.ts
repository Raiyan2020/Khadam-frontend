/**
 * Maps an incoming FCM payload to an in-app route.
 *
 * Admin broadcasts (`notification_type: admin_notify`, nav `type: general`)
 * carry no `related_data`, so they — and any type we don't recognise — fall
 * back to the notifications inbox. See ADMIN_NOTIFICATIONS_FRONTEND.md §4.
 *
 * Kept dependency-free so `public/firebase-messaging-sw.js` can mirror it.
 */

export const NOTIFICATIONS_ROUTE = '/notifications';

/** Types that are informational only — never deep-link them. */
const INBOX_ONLY_TYPES = ['general', 'admin_notify'];

/**
 * `related_data` arrives as a string (FCM data values are always strings) and
 * may be an id, a JSON object, or empty for broadcasts.
 */
function extractEntityId(data: Record<string, any>): string | null {
  const raw = data.related_data ?? data.ad_id ?? '';
  if (raw === '' || raw === null || raw === undefined) return null;

  if (typeof raw === 'number') return String(raw);

  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === 'null' || trimmed === '{}' || trimmed === '[]') return null;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const id = Array.isArray(parsed) ? parsed[0]?.id : (parsed?.ad_id ?? parsed?.id);
      return id ? String(id) : null;
    } catch {
      return null;
    }
  }

  return trimmed;
}

export function resolveNotificationUrl(data: Record<string, any> = {}): string {
  // An explicit url from the backend always wins.
  if (data.url) return String(data.url);

  const type = String(data.notification_type || data.type || '').toLowerCase();
  if (INBOX_ONLY_TYPES.includes(type)) return NOTIFICATIONS_ROUTE;

  const entityId = extractEntityId(data);
  return entityId ? `/worker/${entityId}` : NOTIFICATIONS_ROUTE;
}

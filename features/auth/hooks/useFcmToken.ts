import { useEffect } from 'react';
import { requestForToken } from '../../../lib/firebase';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

const FCM_REGISTERED_TOKEN_KEY = 'khadam_fcm_registered_token';

/**
 * Registers the FCM token with the Khadam backend.
 * device_id = the FCM push token (serves as the unique device identifier on web).
 * device_type = 'web'
 */
async function registerTokenWithBackend(fcmToken: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/fcm-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_id: fcmToken,
      device_type: 'web',
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`FCM token registration failed: ${response.status} ${text}`);
  }
}

/**
 * useFcmToken
 *
 * Runs once when the user is authenticated.
 * 1. Registers the Firebase service worker.
 * 2. Asks for Notification permission.
 * 3. Gets the FCM token via Firebase.
 * 4. POSTs it to /fcm-token (only when the token is new/changed).
 */
export const useFcmToken = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const initialize = async () => {
      try {
        // 1. Register the Firebase messaging service worker
        const swReg = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        );
        console.log('[FCM] Service worker registered:', swReg.scope);

        // 2. Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('[FCM] Notification permission:', permission);
          return;
        }

        // 3. Get the FCM token (passing the registered service worker explicitly)
        const fcmToken = await requestForToken(swReg);
        if (!fcmToken) {
          console.warn('[FCM] Could not retrieve FCM token');
          return;
        }

        // 4. Only register with backend when the token is new / changed
        const storedToken = localStorage.getItem(FCM_REGISTERED_TOKEN_KEY);
        if (fcmToken === storedToken) {
          console.log('[FCM] Token already registered, skipping backend call');
          return;
        }

        await registerTokenWithBackend(fcmToken);
        localStorage.setItem(FCM_REGISTERED_TOKEN_KEY, fcmToken);
        console.log('[FCM] Token successfully registered with backend');
      } catch (err) {
        console.error('[FCM] Initialization error:', err);
      }
    };

    initialize();
  }, [isAuthenticated]);

  /**
   * Call this on logout to clear the cached token so it re-registers on next login.
   */
  const clearFcmToken = () => {
    localStorage.removeItem(FCM_REGISTERED_TOKEN_KEY);
  };

  return { clearFcmToken };
};

import { useEffect, useState } from 'react';
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
  const formData = new FormData();
  formData.append('device_id', fcmToken);
  formData.append('device_type', 'web');

  console.log('%c[FCM] 📡 Sending FCM Token to backend...', 'color: #3b82f6; font-weight: bold;', {
    device_id: fcmToken,
    device_type: 'web'
  });

  const response = await apiFetch(`${API_BASE_URL}/fcm-token`, {
    method: 'POST',
    body: formData,
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
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));

  // Keep authToken reactive to changes (e.g. login/logout)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== authToken) {
        setAuthToken(currentToken);
      }
    }, 1000);

    const handleStorageChange = () => {
      setAuthToken(localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [authToken]);

  const isAuthenticated = !!authToken;

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

        console.log('%c[FCM] 🔥 FCM Token Retrieved:', 'color: #10b981; font-weight: bold; font-size: 1.1em;', fcmToken);

        // 4. Only register with backend when the token is new / changed
        const storedToken = localStorage.getItem(FCM_REGISTERED_TOKEN_KEY);
        if (fcmToken === storedToken) {
          console.log('[FCM] Token already registered, skipping backend call');
          return;
        }

        await registerTokenWithBackend(fcmToken);
        localStorage.setItem(FCM_REGISTERED_TOKEN_KEY, fcmToken);
        console.log('%c[FCM] ✅ Token successfully registered with backend and saved locally!', 'color: #10b981; font-weight: bold;');
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

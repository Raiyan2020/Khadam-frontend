import React, { useEffect } from 'react';
import { requestForToken, onMessageListener } from '../lib/firebase';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import { apiFetch } from '../lib/apiFetch';

export const NotificationHandler: React.FC = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      const token = await requestForToken();
      const authToken = localStorage.getItem('token');
      
      if (token && authToken) {
        try {
          const formData = new FormData();
          formData.append('fcm_token', token);
          
          await apiFetch(`${API_BASE_URL}/fcm-token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'application/json',
            },
            body: formData,
          });
          console.log('FCM token registered successfully');
        } catch (error) {
          console.error('Failed to register FCM token:', error);
        }
      }
    };

    setupNotifications();

    const unsubscribe = onMessageListener((payload: any) => {
      console.log('Received foreground message:', payload);
      if (payload.notification) {
        toast.success(payload.notification.title, {
          description: payload.notification.body,
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
};

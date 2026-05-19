import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';
import { NotificationsResponse } from './useNotifications';

/**
 * Polls the unread notifications endpoint every 30 seconds.
 * Returns the raw response so callers can detect new arrivals.
 * Only runs when the user is authenticated (token exists).
 */
export const usePollingNotifications = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return useQuery<NotificationsResponse>({
    queryKey: ['notifications-poll'],
    queryFn: async () => {
      const response = await apiFetch(`${API_BASE_URL}/notifications/unread?page=1`);
      const data: NotificationsResponse = await response.json();
      if (!response.ok || !data.status) throw new Error('Poll failed');
      return data;
    },
    // Poll every 30 seconds
    refetchInterval: 30_000,
    // Also refetch when the tab regains focus
    refetchOnWindowFocus: true,
    // Don't run if the user is not logged in
    enabled: isAuthenticated,
    // Keep previous data while refetching (no flickering)
    placeholderData: (prev) => prev,
  });
};

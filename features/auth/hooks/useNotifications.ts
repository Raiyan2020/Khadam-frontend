import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface NotificationData {
  id: string;
  type: string;
  data: {
    title: string;
    description: string;
    message?: string;
    ad_id?: number;
    type: string;
    data: any[];
  };
  is_read?: boolean;
  created_at: string;
  created_at_diff?: string;
}

export interface NotificationsResponse {
  status: boolean;
  message: string;
  data: NotificationData[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export const useNotifications = () => {
  const { language } = useLanguage();

  return useInfiniteQuery({
    queryKey: ['notifications', language],
    queryFn: async ({ pageParam = 1 }) => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/notifications?page=${pageParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: NotificationsResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.lastPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useUnreadNotifications = () => {
  const { language } = useLanguage();

  return useInfiniteQuery({
    queryKey: ['notifications-unread', language],
    queryFn: async ({ pageParam = 1 }) => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/notifications/unread?page=${pageParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });
      const data: NotificationsResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch unread notifications');
      }
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.lastPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to delete notification');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to delete all notifications');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/notifications/unread`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to mark notifications as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      await apiFetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });
      // Ignore response errors — this is a silent background call
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

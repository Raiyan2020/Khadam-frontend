import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';
import { useIsAuthenticated } from '../../../lib/useIsAuthenticated';
import { toast } from 'sonner';

/**
 * `NotificationResource` returns the copy at the top level (`title` /
 * `description`) and leaves `data` for entity payloads — which is `{}` for
 * admin broadcasts. Older builds nested the copy inside `data`, so both shapes
 * are read through the accessors below.
 */
export interface NotificationData {
  id: string;
  type: string;
  title?: string;
  description?: string;
  data?: {
    title?: string;
    description?: string;
    message?: string;
    ad_id?: number;
    type?: string;
    data?: any[];
  } | null;
  is_read?: boolean;
  created_at: string;
  created_at_diff?: string;
}

/** Title of an inbox row, whichever shape the API returned it in. */
export const getNotificationTitle = (notif: NotificationData): string =>
  notif.title || notif.data?.title || '';

/** Body of an inbox row, whichever shape the API returned it in. */
export const getNotificationBody = (notif: NotificationData): string =>
  notif.description || notif.data?.description || notif.data?.message || '';

/** Every cache key that changes when a notification is read/deleted/received. */
export const NOTIFICATION_QUERY_KEYS = [
  ['notifications'],
  ['notifications-unread'],
  ['notifications-unread-count'],
] as const;

const invalidateNotificationQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  NOTIFICATION_QUERY_KEYS.forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
};

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
  const isAuthenticated = useIsAuthenticated();

  return useInfiniteQuery({
    // Notifications are auth-only — never fetch for a guest.
    enabled: isAuthenticated,
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
  const isAuthenticated = useIsAuthenticated();

  return useInfiniteQuery({
    // Auth-only. The unread dot renders on the public home screen, so without
    // this a guest fires /notifications/unread and gets a 401.
    enabled: isAuthenticated,
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

export interface UnreadCountResponse {
  status: boolean;
  message: string;
  data: { count: number };
  errors: any[];
}

/**
 * Badge counter. Cheaper than paging the unread list just to read
 * `pagination.total`, and it's the endpoint the contract designates for badges.
 */
export const useUnreadCount = () => {
  const { language } = useLanguage();
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    enabled: isAuthenticated,
    queryKey: ['notifications-unread-count', language],
    queryFn: async () => {
      const response = await apiFetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { 'Accept-Language': language },
      });
      const data: UnreadCountResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch unread count');
      }
      return data.data?.count ?? 0;
    },
    // Push already invalidates this; the refetch covers a tab left open.
    refetchOnWindowFocus: true,
    staleTime: 60_000,
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();

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
      toast.success(t('notification_deleted_successfully'));
      invalidateNotificationQueries(queryClient);
    },
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();

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
      toast.success(t('all_notifications_deleted_successfully'));
      invalidateNotificationQueries(queryClient);
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/notifications/read-all`, {
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
      invalidateNotificationQueries(queryClient);
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
      invalidateNotificationQueries(queryClient);
    },
  });
};

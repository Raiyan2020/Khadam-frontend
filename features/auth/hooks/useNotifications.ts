import { useInfiniteQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface NotificationData {
  id: string;
  type: string;
  data: {
    title: string;
    message: string;
    ad_id?: number;
    type: string;
  };
  read_at: string | null;
  created_at: string;
  created_at_diff: string;
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

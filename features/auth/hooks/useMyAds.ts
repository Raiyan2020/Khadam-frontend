import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';
import { toast } from 'sonner';

export interface MyAd {
  id: number;
  title: string;
  worker_name: string;
  image: string;
  category_name: string;
  is_available: number;
  created_at: string;
}

export interface MyAdsResponse {
  status: boolean;
  message: string;
  data: MyAd[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const useMyAds = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['myAds', language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/office/my-ads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: MyAdsResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch my ads');
      }
      return data;
    },
  });
};

export const useToggleAdAvailability = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (adId: number) => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/office/ads/${adId}/toggle-availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to toggle availability');
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      toast.success(data.message || 'Availability updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (adId: number) => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/office/ad/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to delete ad');
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      toast.success(data.message || 'Ad deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

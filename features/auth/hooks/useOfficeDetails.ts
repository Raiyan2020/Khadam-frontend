import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface OfficeDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  state_name: string;
  cover_image: string | null;
  lat: string | null;
  lng: string | null;
  map_desc: string | null;
  website: string | null;
  whatsapp: string | null;
  description: string | null;
  is_liked: boolean;
  numbers_of_ads: number;
}

export interface OfficeAd {
  id: number;
  title: string;
  worker_name: string;
  country_name: string;
  image: string | null;
  salary: string;
}

export interface OfficeAdsResponse {
  status: boolean;
  message: string;
  data: OfficeAd[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const useOfficeDetails = (id: string) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['office', id, language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/office/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to fetch office details');
      }
      return result.data as OfficeDetail;
    },
    enabled: !!id,
  });
};

export const useOfficeAds = (id: string, page: number = 1) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['office-ads', id, page, language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/office/${id}/ads?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to fetch office ads');
      }
      return result as OfficeAdsResponse;
    },
    enabled: !!id,
  });
};

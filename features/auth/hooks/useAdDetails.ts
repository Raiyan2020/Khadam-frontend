import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface AdDetails {
  office: {
    id: number;
    name: string;
    image: string | null;
    whatsapp: string | null;
  };
  id: number;
  title: string;
  worker_name: string;
  image: string | null;
  category_name: string;
  country_name: string;
  age: number;
  description: string;
  years_experience: number;
  salary: string;
  is_available: number;
  gender: string;
  languages: {
    id: number;
    name: string;
  }[];
  is_liked: boolean;
}

export interface AdDetailsResponse {
  status: boolean;
  message: string;
  data: AdDetails;
  errors: any[];
}

export const useAdDetails = (adId: string) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['adDetails', adId, language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/ad/${adId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: AdDetailsResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch ad details');
      }
      return data.data;
    },
    enabled: !!adId,
  });
};

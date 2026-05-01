import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface HomeAd {
  id: number;
  worker_name: string;
  image: string | null;
  category_name: string;
}

export interface HomeAdFull extends HomeAd {
  office: {
    id: number;
    name: string;
    image: string | null;
    state: string;
  };
  country_name: string;
  code: string;
  salary: string;
  is_liked: boolean;
}

export interface HomeData {
  history: any[];
  available_ads: HomeAd[];
  latest_ads: HomeAdFull[];
  most_experience_ads: HomeAdFull[];
}

export interface HomeResponse {
  status: boolean;
  message: string;
  data: HomeData;
  errors: any[];
}

export const useHomeData = (enabled = true) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['homeData', language],
    enabled,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/home`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: HomeResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch home data');
      }
      return data.data;
    },
  });
};

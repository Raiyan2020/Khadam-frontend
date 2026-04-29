import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface Country {
  id: number;
  name: string;
  image: string;
}

export interface CountriesResponse {
  status: boolean;
  message: string;
  data: Country[];
  errors: any[];
}

export const useCountries = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['countries', language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/countries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: CountriesResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch countries');
      }
      return data.data;
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config';
import { apiFetch } from './apiFetch';

export interface ApiCountry {
  id: number;
  name: string;
  country_code: string;
  phone_code: string;
  image: string;
}

export const useCountryCodes = () => {
  return useQuery<ApiCountry[]>({
    queryKey: ['country-codes'],
    queryFn: async () => {
      const response = await apiFetch(`${API_BASE_URL}/country-codes`);
      const data = await response.json();
      if (!data.status) throw new Error(data.message || 'Failed to fetch countries');
      return data.data as ApiCountry[];
    },
    staleTime: 1000 * 60 * 60, // cache 1 hour
    gcTime: 1000 * 60 * 60 * 24,
  });
};

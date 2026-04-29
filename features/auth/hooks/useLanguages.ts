import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface Language {
  id: number;
  name: string;
}

export interface LanguagesResponse {
  status: boolean;
  message: string;
  data: Language[];
  errors: any[];
}

export const useLanguages = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['languages', language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/languages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: LanguagesResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch languages');
      }
      return data.data;
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface OfficeResult {
  id: number;
  name: string;
  image: string | null;
  state_name: string;
  is_favourite: boolean;
}

export interface OfficesResponse {
  status: boolean;
  message: string;
  data: OfficeResult[];
  errors: any[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const useOffices = (page: number = 1) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['offices', page, language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/offices?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: OfficesResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch offices');
      }
      return data;
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface Category {
  id: number;
  name: string;
}

export interface CategoriesResponse {
  status: boolean;
  message: string;
  data: Category[];
  errors: any[];
}

export const useCategories = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['categories', language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: CategoriesResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch categories');
      }
      return data.data;
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface FavoriteAd {
  id: number;
  title: string;
  worker_name: string;
  image: string | null;
  category_name: string;
  salary: string;
  created_at: string;
}

export interface FavoriteOffice {
  id: number;
  name: string;
  image: string | null;
  state_name: string;
  is_favourite: boolean;
}

export const useMyLikes = (type: 'ad' | 'office') => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['my-likes', type, language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/likes/my-likes/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to fetch favorites');
      }
      return result.data as (FavoriteAd[] | FavoriteOffice[]);
    },
  });
};

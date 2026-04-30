import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface ToggleLikeParams {
  type: 'ad' | 'office';
  id: number;
}

export const useToggleLike = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: ToggleLikeParams) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('type', type);
      formData.append('id', String(id));

      const response = await apiFetch(`${API_BASE_URL}/likes/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to toggle favorite');
      }
      return result;
    },
    onSuccess: () => {
      // Revalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      queryClient.invalidateQueries({ queryKey: ['office'] });
      queryClient.invalidateQueries({ queryKey: ['office-ads'] });
      queryClient.invalidateQueries({ queryKey: ['worker'] });
      queryClient.invalidateQueries({ queryKey: ['ad-filter'] });
      queryClient.invalidateQueries({ queryKey: ['home-data'] });
      queryClient.invalidateQueries({ queryKey: ['adDetails'] });
      queryClient.invalidateQueries({ queryKey: ['my-likes'] });
    },
  });
};

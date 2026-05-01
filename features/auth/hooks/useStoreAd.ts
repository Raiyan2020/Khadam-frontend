import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';
import { toast } from 'sonner';

export interface StoreAdPayload {
  image: File;
  category_id: number;
  title: string;
  worker_name: string;
  country_id: number;
  age: number;
  description: string;
  years_experience: number;
  salary: number;
  is_available: boolean;
  gender: 'male' | 'female';
  languages: number[];
  is_single_ad?: boolean;
}

export const useStoreAd = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StoreAdPayload) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('image', payload.image);
      formData.append('category_id', String(payload.category_id));
      formData.append('title', payload.title);
      formData.append('worker_name', payload.worker_name);
      formData.append('country_id', String(payload.country_id));
      formData.append('age', String(payload.age));
      formData.append('description', payload.description);
      formData.append('years_experience', String(payload.years_experience));
      formData.append('salary', String(payload.salary));
      formData.append('is_available', payload.is_available ? '1' : '0');
      formData.append('gender', payload.gender);
      payload.languages.forEach((langId, i) => {
        formData.append(`languages[${i}]`, String(langId));
      });
      // if (payload.is_single_ad !== undefined) {
      formData.append('is_single_ad', '1');
      // }

      const response = await apiFetch(`${API_BASE_URL}/office/store-ad`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to store ad');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      queryClient.invalidateQueries({ queryKey: ['companyHomeData'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

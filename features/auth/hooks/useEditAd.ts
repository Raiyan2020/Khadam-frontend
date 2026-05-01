import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';
import { toast } from 'sonner';

export interface AdDetail {
  office: {
    id: number;
    name: string;
    image: string;
    whatsapp: string;
  };
  id: number;
  title: string;
  worker_name: string;
  image: string;
  category_name: string;
  category_id?: number; // I'll likely need the ID for the update
  country_name: string;
  country_id?: number; // I'll likely need the ID for the update
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

export interface AdDetailResponse {
  status: boolean;
  message: string;
  data: AdDetail;
  errors: any[];
}

export const useAdDetail = (id: string) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['adDetail', id, language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/office/ad/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: AdDetailResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch ad details');
      }
      return data.data;
    },
    enabled: !!id,
  });
};

export interface UpdateAdPayload {
  id: number;
  image?: File | null;
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
}

export const useUpdateAd = () => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAdPayload) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      if (payload.image) {
        formData.append('image', payload.image);
      }
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

      const response = await apiFetch(`${API_BASE_URL}/office/update-ad/${payload.id}`, {
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
        throw new Error(data.message || 'Failed to update ad');
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      queryClient.invalidateQueries({ queryKey: ['adDetail'] });
      toast.success(data.message || 'Ad updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

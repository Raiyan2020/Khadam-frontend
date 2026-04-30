import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface AdFilterParams {
  worker_name?: string;
  category_id?: number;
  years_experience?: number;
  country_id?: number;
  gender?: 'male' | 'female' | 'all';
  salary?: number;
  age?: number;
  languages?: number[];
  latest?: 1 | 0;
  experience?: 1 | 0;
  history?: 1 | 0;
  page?: number;
}

export interface AdFilterResult {
  id: number;
  title: string;
  worker_name: string;
  image: string | null;
  category_name: string;
  salary: string;
  created_at: string;
  is_liked: boolean;
}

export interface AdFilterResponse {
  status: boolean;
  message: string;
  data: AdFilterResult[];
  errors: any[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const useAdFilter = () => {
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (params: AdFilterParams) => {
      const token = localStorage.getItem('token');

      const formData = new FormData();
      if (params.worker_name) formData.append('worker_name', params.worker_name);
      if (params.category_id !== undefined) formData.append('category_id', String(params.category_id));
      if (params.years_experience !== undefined) formData.append('years_experience', String(params.years_experience));
      if (params.country_id !== undefined) formData.append('country_id', String(params.country_id));
      if (params.gender) formData.append('gender', params.gender);
      if (params.salary !== undefined) formData.append('salary', String(params.salary));
      if (params.age !== undefined) formData.append('age', String(params.age));
      if (params.languages && params.languages.length > 0) {
        params.languages.forEach((langId, i) => {
          formData.append(`languages[${i}]`, String(langId));
        });
      }
      if (params.latest !== undefined) formData.append('latest', String(params.latest));
      if (params.experience !== undefined) formData.append('experience', String(params.experience));
      if (params.history !== undefined) formData.append('history', String(params.history));
      if (params.page !== undefined) formData.append('page', String(params.page));

      const response = await apiFetch(`${API_BASE_URL}/ad-filter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data: AdFilterResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch filtered ads');
      }
      return data;
    },
  });
};

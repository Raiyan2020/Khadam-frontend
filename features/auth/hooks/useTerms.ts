import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface TermFeature {
  id: number;
  description: string;
}

export interface Term {
  id: number;
  title: string;
  description: string;
  features: TermFeature[];
}

export interface TermsResponse {
  status: boolean;
  message: string;
  data: Term[];
  errors: any[];
}

export const useTerms = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['terms', language],
    queryFn: async () => {
      const response = await apiFetch(`${API_BASE_URL}/terms`, {
        headers: {
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: TermsResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch terms');
      }
      return data.data;
    },
  });
};

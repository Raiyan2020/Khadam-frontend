import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';
import { HomeAdFull } from './useHomeData';

export interface CompanyAd {
  id: number;
  worker_name: string;
  image: string | null;
  category_name: string;
}

export interface CompanyHistoryAd {
  id: number;
  title: string;
  worker_name: string;
  country_name: string;
  image: string | null;
  salary: string;
}

export interface CompanyHomeData {
  whatsapp_transfers_count: number;
  available_ads_count: number;
  unavailable_ads_count: number;
  available_ads_percentage: number;
  total_ads_count: number;
  profile_views_count: number;
  subscription: {
    name: string;
    image: string | null;
    total_days: number;
    remaining_days: number;
  } | null;
  available_ads: CompanyAd[];
  history: CompanyHistoryAd[];
  latest_ads: HomeAdFull[];
  most_experience_ads: HomeAdFull[];
}

export interface CompanyHomeResponse {
  status: boolean;
  message: string;
  data: CompanyHomeData;
  errors: any[];
}

export const useCompanyHomeData = (enabled: boolean) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['companyHomeData', language],
    enabled,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/company-home`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: CompanyHomeResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch company home data');
      }
      return data.data;
    },
  });
};

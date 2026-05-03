import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface SiteSettings {
  site_name: string;
  site_logo: string | null;
  site_favicon: string | null;
  social_media: {
    facebook: string;
    twitter: string;
    instagram: string;
    phone_support: string;
  };
  single_ad_price: string;
  single_ad_duration: number;
}

export interface SettingsResponse {
  status: boolean;
  message: string;
  data: SiteSettings;
  errors: any[];
}

export const useSettings = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['settings', language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/settings`, {
        headers: {
          'Accept-Language': language,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: SettingsResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch settings');
      }
      return data.data;
    },
  });
};

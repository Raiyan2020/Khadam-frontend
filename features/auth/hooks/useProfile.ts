import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

export interface ProfileData {
  id: number;
  name: string;
  email: string | null;
  type: string;
  type_text: string;
  phone: string;
  image: string | null;
  state_name: string | null;
  cover_image: string | null;
  lat: string | null;
  lng: string | null;
  map_desc: string | null;
  website: string | null;
  whatsapp: string | null;
  description: string | null;
}

export interface ProfileResponse {
  status: boolean;
  message: string;
  data: ProfileData;
  errors: any[];
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await apiFetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data: ProfileResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      return data.data;
    },
  });
};

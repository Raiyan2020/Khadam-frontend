import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface ContactUsPayload {
  name: string;
  email: string;
  message: string;
}

export const useContactUs = () => {
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (payload: ContactUsPayload) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('email', payload.email);
      formData.append('message', payload.message);

      const response = await apiFetch(`${API_BASE_URL}/contact-us`, {
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
        throw new Error(data.message || 'Failed to send message');
      }
      return data;
    },
  });
};

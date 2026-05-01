import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface WhatsappTransferParams {
  company_id: number;
  ad_id: number;
}

export const useWhatsappTransfer = () => {
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async ({ company_id, ad_id }: WhatsappTransferParams) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('company_id', String(company_id));
      formData.append('ad_id', String(ad_id));

      const response = await apiFetch(`${API_BASE_URL}/whatsapp-transfer/store`, {
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
        throw new Error(result.message || 'Failed to record whatsapp transfer');
      }
      return result;
    },
  });
};

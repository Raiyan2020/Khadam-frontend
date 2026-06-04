import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

interface CheckCodePayload {
  phone: string;
  country_id: number;
  code: string;
}

export const useCheckResetCode = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: CheckCodePayload) => {
      const formData = new FormData();
      formData.append('phone', payload.phone);
      formData.append('country_id', String(payload.country_id));
      formData.append('code', payload.code);

      const response = await apiFetch(`${API_BASE_URL}/auth/check-code`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Invalid code');
      }
      return data;
    },

    onSuccess: (_data, variables) => {
      navigate({
        to: '/new-password',
        search: { phone: variables.phone, country_id: variables.country_id },
      });
    },

    onError: (error: any) => {
      toast.error(error.message || 'An error occurred');
    },
  });
};

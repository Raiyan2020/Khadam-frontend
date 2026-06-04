import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

interface ForgotPasswordPayload {
  phone: string;
  country_id: number;
}

export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      const formData = new FormData();
      formData.append('phone', payload.phone);
      formData.append('country_id', String(payload.country_id));

      const response = await apiFetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to send reset code');
      }
      return data;
    },

    onSuccess: (_data, variables) => {
      navigate({
        to: '/reset-otp',
        search: { phone: variables.phone, country_id: variables.country_id },
      });
    },

    onError: (error: any) => {
      toast.error(error.message || 'An error occurred');
    },
  });
};

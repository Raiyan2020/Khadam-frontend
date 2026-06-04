import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';
import { useLanguage } from '../../../i18n';

interface NewPasswordPayload {
  phone: string;
  country_id: number;
  password: string;
  password_confirmation: string;
}

export const useNewPassword = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: async (payload: NewPasswordPayload) => {
      const formData = new FormData();
      formData.append('phone', payload.phone);
      formData.append('country_id', String(payload.country_id));
      formData.append('password', payload.password);
      formData.append('password_confirmation', payload.password_confirmation);

      const response = await apiFetch(`${API_BASE_URL}/auth/new-password`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to reset password');
      }
      return data;
    },

    onSuccess: (data) => {
      toast.success(t('password_reset_success') || 'Password reset successfully');
      navigate({ to: '/login' });
    },

    onError: (error: any) => {
      toast.error(error.message || 'An error occurred');
    },
  });
};

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';
import { useLanguage } from '../../../i18n';

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const useChangePassword = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const formData = new FormData();
      formData.append('current_password', payload.current_password);
      formData.append('new_password', payload.new_password);
      formData.append('new_password_confirmation', payload.new_password_confirmation);

      const response = await apiFetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to change password');
      }
      return data;
    },

    onSuccess: () => {
      toast.success(t('password_changed_success') || 'Password changed successfully');
      navigate({ to: '/profile' });
    },

    onError: (error: any) => {
      toast.error(error.message || 'An error occurred');
    },
  });
};

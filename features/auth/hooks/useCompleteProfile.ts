import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useLanguage } from '../../../i18n';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

export interface CompleteProfileResponse {
  status: boolean;
  message: string;
  data: {
    user: any;
    token?: string; // Present for users (type 1), absent for companies (type 2)
  };
  errors: any[];
}

export const useCompleteProfile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const result: CompleteProfileResponse = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to complete profile');
      }
      return result;
    },
    onSuccess: (data) => {
      const token = data.data?.token;

      if (token) {
        // User (type 1): token returned → save it and go home
        localStorage.setItem('token', token);
        navigate({ to: '/' });
      } else {
        // Company (type 2): no token → pending admin approval → go to login
        toast.success(t('pending_approval_title'), {
          description: t('pending_approval_desc'),
          duration: 5000,
        });
        navigate({ to: '/login' });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during profile completion');
    }
  });
};

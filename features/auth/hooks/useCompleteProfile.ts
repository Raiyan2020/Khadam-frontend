import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

export interface CompleteProfileResponse {
  status: boolean;
  message: string;
  data: any;
  errors: any[];
}

export const useCompleteProfile = () => {
  const navigate = useNavigate();

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
    onSuccess: () => {
      navigate({ to: '/' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during profile completion');
    }
  });
};

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

interface LoginResponse {
  status: boolean;
  message: string;
  data: any[];
  errors: any[];
}

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (phone: string) => {
      const formData = new FormData();
      formData.append('phone', phone);

      const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData,
      });

      const data: LoginResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Login failed');
      }
      return data;
    },
    onSuccess: (_, variables) => {
      navigate({
        to: '/verify-otp',
        search: { phone: variables }
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during login');
    }
  });
};

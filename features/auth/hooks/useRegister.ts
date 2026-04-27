import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

interface RegisterResponse {
  status: boolean;
  message: string;
  data: any[];
  errors: any[];
}

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { type: string; phone: string }) => {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('phone', data.phone);

      const response = await fetch('https://portal.khdm.net/api/auth/register', {
        method: 'POST',
        body: formData,
      });
      const result: RegisterResponse = await response.json();
      
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Registration failed');
      }
      return result;
    },
    onSuccess: (_, variables) => {
      navigate({
        to: '/verify-otp',
        search: { phone: variables.phone }
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during registration');
    }
  });
};

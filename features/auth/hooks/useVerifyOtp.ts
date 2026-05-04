import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useUserRole } from '../../../UserRoleContext';
import { UserRole } from '../../../types';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

export interface VerifyOtpResponse {
  status: boolean;
  message: string;
  data: {
    user: {
      id: number;
      is_completed_profile: number;
      name: string | null;
      email: string | null;
      type: string;
      type_text: string;
      phone: string;
    };
    token: string;
  };
  errors: any[];
}

export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();

  return useMutation({
    mutationFn: async (verifyData: FormData) => {
      const response = await apiFetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        body: verifyData,
      });
      const result: VerifyOtpResponse = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to verify OTP');
      }
      return result;
    },
    onSuccess: (data) => {
      // Store token and user type
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user_type', data.data.user.type);
      setUserRole(data.data.user.type === '2' ? UserRole.OFFICE : UserRole.SEEKER);
      console.log(data);

      // Check if profile is completed
      if (data.data.user.is_completed_profile == 0) {
        console.log('Profile not completed');
        navigate({ to: '/complete-profile', search: { phone: data.data.user.phone } });
      } else {
        navigate({ to: '/' });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during verification');
    }
  });
};

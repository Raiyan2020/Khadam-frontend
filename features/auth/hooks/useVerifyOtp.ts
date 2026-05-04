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
    token?: string; // Only present on login, not on sign-up
    is_completed_profile?: number;
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
      const { user, token } = data.data;

      // Save user type for profile completion page
      localStorage.setItem('user_type', user.type);
      setUserRole(user.type === '2' ? UserRole.OFFICE : UserRole.SEEKER);

      if (user.is_completed_profile === 1 && token) {
        // Login flow: profile complete + token given → go home
        localStorage.setItem('token', token);
        navigate({ to: '/' });
      } else {
        // Sign-up flow OR incomplete profile: go to complete-profile
        // Do NOT store token here (there is none in sign-up response)
        navigate({ to: '/complete-profile', search: { phone: user.phone } });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during verification');
    }
  });
};

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useUserRole, roleFromUserType } from '../../../UserRoleContext';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';
import { notifyAuthChanged } from '../../../lib/authBridge';
import { useLanguage } from '../../../i18n';

export interface VerifyOtpResponse {
  status: boolean;
  message: string;
  data: {
    user: {
      id: number;
      is_completed_profile: number;
      name: string | null;
      email: string | null;
      /** `'1'` seeker / `'2'` office — the API sends it as a string or a number. */
      type: string | number;
      type_text: string;
      phone: string;
      country_id?: string;
    };
    token?: string; // Only present on login, not on sign-up
    is_completed_profile?: number;
  };
  errors: any[];
}

export const useVerifyOtp = () => {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();
  const { t } = useLanguage();
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
    onSuccess: (data, variables) => {
      const { user, token } = data.data;

      // Clear OTP session data now that it's been used
      sessionStorage.removeItem('otp_phone');
      sessionStorage.removeItem('otp_country_id');

      // Save user type for profile completion page
      localStorage.setItem('user_type', String(user.type));
      setUserRole(roleFromUserType(user.type));

      if (user.is_completed_profile === 1 && token) {
        // Login flow: profile complete + token given → go home
        localStorage.setItem('token', token);
        notifyAuthChanged();
        toast.success(t('welcome_back'), { description: t('login_success') })
        navigate({ to: '/' });
      } else {
        // Sign-up flow OR incomplete profile: go to complete-profile
        // Do NOT store token here (there is none in sign-up response)
        toast.success(data.message);
        const countryId = variables.get('country_id') as string | undefined || user.country_id;
        sessionStorage.setItem('complete_profile_phone', user.phone);
        if (countryId) {
          sessionStorage.setItem('complete_profile_country_id', String(countryId));
        }
        navigate({ to: '/complete-profile' });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during verification');
    }
  });
};

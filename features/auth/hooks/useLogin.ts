import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';
import { useUserRole } from '../../../UserRoleContext';
import { UserRole } from '../../../types';
import { useLanguage } from '../../../i18n';

// ─── Types ────────────────────────────────────────────────────────────────────

type PhonePayload = {
  login_type: 'phone';
  country_id: number;
  phone: string;
  password: string;
};

type EmailPayload = {
  login_type: 'email';
  email: string;
  password: string;
};

export type LoginPayload = PhonePayload | EmailPayload;

interface LoginUser {
  id: number;
  is_completed_profile: number;
  name: string | null;
  email: string | null;
  type: string;
  type_text: string;
  phone: string;
  country_id: number;
  image: string | null;
}

interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    user: LoginUser;
    is_completed_profile: number;
    token: string;
  };
  errors: any[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const formData = new FormData();
      formData.append('login_type', payload.login_type);
      formData.append('password', payload.password);

      if (payload.login_type === 'phone') {
        formData.append('country_id', String(payload.country_id));
        formData.append('phone', payload.phone);
      } else {
        formData.append('email', payload.email);
      }

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

    onSuccess: (data) => {
      const { user, token } = data.data;

      // Persist token & user role
      localStorage.setItem('token', token);
      localStorage.setItem('user_type', user.type);
      setUserRole(user.type === '2' ? UserRole.OFFICE : UserRole.SEEKER);

      if (user.is_completed_profile === 1) {
        // Profile is complete → go home
        toast.success(t('welcome_back'), { description: t('login_success') });
        navigate({ to: '/' });
      } else {
        // Profile incomplete → redirect to complete-profile step
        navigate({
          to: '/complete-profile',
          search: { phone: user.phone, country_id: String(user.country_id) },
        });
      }
    },

    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during login');
    },
  });
};

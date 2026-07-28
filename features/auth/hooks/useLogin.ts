import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';
import { notifyAuthChanged } from '../../../lib/authBridge';
import { useUserRole, roleFromUserType } from '../../../UserRoleContext';
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
  /** `'1'` seeker / `'2'` office — the API sends it as a string or a number. */
  type: string | number;
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

interface UseLoginOptions {
  /**
   * Called once the token is stored, before any navigation. The login popup
   * uses it to close itself.
   */
  onAuthenticated?: (ctx: { isProfileComplete: boolean }) => void;
  /**
   * Skip the "go home / go to ?redirect" navigation for a completed profile.
   * An incomplete profile still routes to /complete-profile regardless — that
   * step is mandatory in both the page and popup flows.
   */
  skipRedirect?: boolean;
}

export const useLogin = (options: UseLoginOptions = {}) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const { setUserRole } = useUserRole();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

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
      localStorage.setItem('user_type', String(user.type));
      setUserRole(roleFromUserType(user.type));
      // Wakes up everything gated on useIsAuthenticated (FCM, notifications)
      // and re-reads the stored role (bottom nav, home screen).
      notifyAuthChanged();

      const isProfileComplete = user.is_completed_profile === 1;

      // Anything fetched as a guest (likes, availability, personalised home)
      // is now stale — refetch it with the token attached.
      queryClient.invalidateQueries();

      options.onAuthenticated?.({ isProfileComplete });

      if (isProfileComplete) {
        toast.success(t('welcome_back'), { description: t('login_success') });
        // The popup handles its own follow-up navigation.
        if (options.skipRedirect) return;

        if (search.redirect && search.redirect !== '/login') {
          navigate({ to: search.redirect } as any);
        } else {
          navigate({ to: '/' });
        }
      } else {
        // Profile incomplete → redirect to complete-profile step
        sessionStorage.setItem('complete_profile_phone', user.phone);
        if (user.country_id) {
          sessionStorage.setItem('complete_profile_country_id', String(user.country_id));
        }
        navigate({
          to: '/complete-profile',
        });
      }
    },

    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during login');
    },
  });
};

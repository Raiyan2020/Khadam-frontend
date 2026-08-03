import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';
import { clearAuthStorage } from '../../../lib/authBridge';
import { unregisterFcmToken } from './useFcmToken';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Drop the push subscription first — it needs the session that logout
      // is about to end. Best-effort; never blocks signing out.
      await unregisterFcmToken();

      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Logout failed');
      }
      return result;
    },
    onSuccess: () => {
      // Clear all cached query data
      queryClient.clear();

      // Drops token/user/user_type/FCM and notifies, so the role resets too.
      clearAuthStorage();

      // Navigate to login
      navigate({ to: '/login' });
    },
    onError: (error: any) => {
      // Even if the server request fails, we should probably still log them out locally
      queryClient.clear();
      clearAuthStorage();
      navigate({ to: '/login' });
      toast.error(error.message || 'An error occurred during logout');
    }
  });
};

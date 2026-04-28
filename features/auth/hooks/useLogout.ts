import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
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

      // Clear auth-related local storage data
      localStorage.removeItem('token');
      localStorage.removeItem('user_type');

      // Navigate to login
      navigate({ to: '/login' });
    },
    onError: (error: any) => {
      // Even if the server request fails, we should probably still log them out locally
      queryClient.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('user_type');
      navigate({ to: '/login' });
      toast.error(error.message || 'An error occurred during logout');
    }
  });
};

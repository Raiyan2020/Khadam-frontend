import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

export interface UpdateProfileResponse {
  status: boolean;
  message: string;
  data: any;
  errors: any[];
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await apiFetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Note: Do not set Content-Type header when using FormData
        },
        body: formData,
      });

      const data: UpdateProfileResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to update profile');
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred during profile update');
    },
  });
};

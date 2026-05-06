import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config';
import { apiFetch } from '../../../lib/apiFetch';

interface ResendOtpResponse {
  status: boolean;
  message: string;
  data: any[];
  errors: any[];
}

export const useResendOtp = () => {
  return useMutation({
    mutationFn: async ({ phone, country_id }: { phone: string; country_id: number }) => {
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('county_id', String(country_id));


      const response = await apiFetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        body: formData,
      });

      const data: ResendOtpResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'OTP resent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while resending OTP');
    }
  });
};

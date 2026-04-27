import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ResendOtpResponse {
  status: boolean;
  message: string;
  data: any[];
  errors: any[];
}

export const useResendOtp = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      const formData = new FormData();
      formData.append('phone', phone);

      const response = await fetch('https://portal.khdm.net/api/auth/resend-otp', {
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

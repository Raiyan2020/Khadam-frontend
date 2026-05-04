import { useMutation, useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';
import { useLanguage } from '../../../i18n';
import { apiFetch } from '../../../lib/apiFetch';

export interface PackageFeature {
  id: number;
  description: string;
}

export interface Package {
  id: number;
  name: string;
  image: string | null;
  price: string;
  duration: number;
  features: PackageFeature[];
}

export interface PackagesResponse {
  status: boolean;
  message: string;
  data: Package[];
  errors: any[];
}

export const usePackages = () => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['packages', language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data: PackagesResponse = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch packages');
      }
      return data.data;
    },
  });
};

export const usePackageDetail = (id: string) => {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['packageDetail', id, language],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`${API_BASE_URL}/packages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to fetch package details');
      }
      return data.data as Package;
    },
    enabled: !!id,
  });
};

export interface SubscribeResponse {
  status: boolean;
  message: string;
  data: {
    payment_url: string;
    transaction_id: number;
  };
  errors: any[];
}

export interface CouponResponse {
  original_price: string;
  discount_amount: string;
  final_price: string;
  coupon_num: string;
}

export const useCheckCoupon = () => {
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (payload: { package_id: number; coupon_num: string }) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('package_id', String(payload.package_id));
      formData.append('coupon_num', payload.coupon_num);

      const response = await apiFetch(`${API_BASE_URL}/check-coupon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Invalid coupon');
      }
      return data.data as CouponResponse;
    },
  });
};

export const useSubscribe = () => {
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (payload: { package_id: number; coupon_num?: string }) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('package_id', String(payload.package_id));
      if (payload.coupon_num) {
        formData.append('coupon_num', payload.coupon_num);
      }

      const response = await apiFetch(`${API_BASE_URL}/packages/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data: SubscribeResponse = await response.json();
      if (!response.ok || !data.status) {
        const errorMsg = (data.errors as any)?.package_id?.[0] || data.message || 'Subscription failed';
        throw new Error(errorMsg);
      }
      return data;
    },
    onSuccess: (data) => {
      if (data?.data?.payment_url) {
        window.location.href = data.data.payment_url;
      }
    },
  });
};

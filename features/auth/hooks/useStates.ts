import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../config';

export interface StateOption {
  id: number;
  name: string;
}

export const useStates = (enabled: boolean) => {
  return useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/states`);
      const data = await response.json();
      return data;
    },
    enabled,
  });
};

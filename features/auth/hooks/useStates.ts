import { useQuery } from '@tanstack/react-query';

export interface StateOption {
  id: number;
  name: string;
}

export const useStates = (enabled: boolean) => {
  return useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      const response = await fetch('https://portal.khdm.net/api/states');
      const data = await response.json();
      return data;
    },
    enabled,
  });
};

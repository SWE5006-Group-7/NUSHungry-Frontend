import apiClient from '@/utils/request';

export const getStalls = () => {
  return apiClient.get('/api/stalls');
};

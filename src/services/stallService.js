import apiClient from '@/utils/request';

export const getStalls = () => {
  return apiClient.get('/api/stalls');
};

export const getStallsByCafeteriaId = (cafeteriaId) => {
  return apiClient.get(`/api/cafeterias/${cafeteriaId}/stalls`);
};

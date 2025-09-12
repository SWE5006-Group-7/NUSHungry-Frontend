import apiClient from '@/utils/request';

export const getCafeterias = () => {
  return apiClient.get('/api/cafeterias');
};

export const getPopularCafeterias = () => {
  return apiClient.get('/api/cafeterias/popular');
};
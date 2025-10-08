import apiClient from '@/utils/request';

export const getCafeterias = () => {
  return apiClient.get('/cafeterias');
};

export const getPopularCafeterias = () => {
  return apiClient.get('/cafeterias/popular');
};

export const getCafeteriaById = (id) => {
  return apiClient.get(`/cafeterias/${id}`);
};
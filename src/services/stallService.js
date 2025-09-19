import apiClient from '@/utils/request';

export const getStalls = () => {
  return apiClient.get('/api/stalls');
};

export const getStallById = (id) => {
  return apiClient.get(`/api/stalls/${id}`);
};

export const getReviewsByStallId = (stallId) => {
  return apiClient.get(`/api/reviews?stallId=${stallId}`);
};

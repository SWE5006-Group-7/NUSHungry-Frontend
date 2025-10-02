import apiClient from '@/utils/request';

export const getStalls = () => {
  return apiClient.get('/stalls');
};

export const getStallById = (id) => {
  return apiClient.get(`/stalls/${id}`);
};

export const getReviewsByStallId = (stallId) => {
  return apiClient.get(`/reviews?stallId=${stallId}`);
};

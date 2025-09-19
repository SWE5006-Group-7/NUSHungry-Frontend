import { defineStore } from 'pinia';
import { getStallById, getReviewsByStallId } from '@/services/stallService';

export const useStallStore = defineStore('stall', {
  state: () => ({
    currentStall: null,
    reviews: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchStallById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getStallById(id);
        this.currentStall = response.data;
      } catch (err) {
        this.error = err.message || `Failed to fetch stall with id ${id}`;
        this.currentStall = null;
      } finally {
        this.loading = false;
      }
    },
    async fetchReviewsByStallId(stallId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getReviewsByStallId(stallId);
        this.reviews = response.data;
      } catch (err) {
        this.error = err.message || `Failed to fetch reviews for stall ${stallId}`;
        this.reviews = [];
      } finally {
        this.loading = false;
      }
    },
  },
});
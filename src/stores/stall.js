import { defineStore } from 'pinia';
import { getStalls } from '@/services/stallService';

export const useStallStore = defineStore('stall', {
  state: () => ({
    stalls: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchStalls() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getStalls();
        this.stalls = response.data;
      } catch (err) {
        this.error = err.message || 'Failed to fetch stalls';
      } finally {
        this.loading = false;
      }
    },
  },
});
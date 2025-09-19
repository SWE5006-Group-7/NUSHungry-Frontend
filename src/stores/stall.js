import { defineStore } from 'pinia';
import { getStallsByCafeteriaId } from '@/services/stallService';

export const useStallStore = defineStore('stall', {
  state: () => ({
    stallsByCafeteria: {}, // Store stalls keyed by cafeteria ID
    loading: false,
    error: null,
  }),
  actions: {
    async fetchStallsByCafeteriaId(cafeteriaId) {
      if (!cafeteriaId) return;
      this.loading = true;
      this.error = null;
      try {
        const response = await getStallsByCafeteriaId(cafeteriaId);
        this.stallsByCafeteria[cafeteriaId] = response.data;
      } catch (err) {
        this.error = err.message || `Failed to fetch stalls for cafeteria ${cafeteriaId}`;
      } finally {
        this.loading = false;
      }
    },
  },
});
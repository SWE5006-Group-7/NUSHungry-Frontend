import { defineStore } from 'pinia';
import { getCafeterias, getPopularCafeterias } from '@/services/cafeteriaService';

export const useCafeteriaStore = defineStore('cafeteria', {
  state: () => ({
    cafeterias: [],
    popularCafeterias: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchCafeterias() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getCafeterias();
        this.cafeterias = response.data;
      } catch (err) {
        this.error = err.message || 'Failed to fetch cafeterias';
      } finally {
        this.loading = false;
      }
    },
    async fetchPopularCafeterias() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getPopularCafeterias();
        this.popularCafeterias = response.data;
      } catch (err) {
        this.error = err.message || 'Failed to fetch popular cafeterias';
      } finally {
        this.loading = false;
      }
    },
  },
});
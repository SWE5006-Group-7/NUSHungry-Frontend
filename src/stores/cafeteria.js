import { defineStore } from 'pinia';
import { getCafeterias, getCafeteriaById } from '@/services/cafeteriaService';

export const useCafeteriaStore = defineStore('cafeteria', {
  state: () => ({
    cafeterias: [],
    currentCafeteria: null,
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
    async fetchCafeteriaById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getCafeteriaById(id);
        this.currentCafeteria = response.data;
        return this.currentCafeteria;
      } catch (err) {
        this.error = err.message || `Failed to fetch cafeteria with id ${id}`;
        this.currentCafeteria = null;
      } finally {
        this.loading = false;
      }
    },
  },
});
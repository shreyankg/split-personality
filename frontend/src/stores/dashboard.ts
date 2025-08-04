import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DashboardData, EquityAnalysis } from '@/types';
import { dashboardApi } from '@/services/api';

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboardData = ref<DashboardData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function setError(message: string) {
    error.value = message;
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }

  async function loadDashboard(householdId: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await dashboardApi.get(householdId);
      dashboardData.value = response.data.data;
      return dashboardData.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function getAnalysis(
    householdId: string,
    startDate?: string,
    endDate?: string
  ): Promise<EquityAnalysis> {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await dashboardApi.getAnalysis(householdId, startDate, endDate);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analysis');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function reset() {
    dashboardData.value = null;
    error.value = null;
  }

  return {
    dashboardData,
    isLoading,
    error,
    loadDashboard,
    getAnalysis,
    reset,
  };
});
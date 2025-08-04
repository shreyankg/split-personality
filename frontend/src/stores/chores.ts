import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Chore, CompletedChore, SkillLevel } from '@/types';
import { choreApi } from '@/services/api';

export const useChoresStore = defineStore('chores', () => {
  const chores = ref<(Chore & { completedChores: CompletedChore[] })[]>([]);
  const completedChores = ref<CompletedChore[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function setError(message: string) {
    error.value = message;
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }

  async function loadChores(householdId: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await choreApi.getAll(householdId);
      chores.value = response.data.data.chores;
      return chores.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load chores');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createChore(
    householdId: string,
    name: string,
    skillLevel: SkillLevel,
    assignedTo?: string
  ) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await choreApi.create(householdId, name, skillLevel, assignedTo);
      const newChore = { ...response.data.data.chore, completedChores: [] };
      chores.value.unshift(newChore);
      return newChore;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create chore');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function completeChore(choreId: string, completedBy: string, timeSpent: number) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await choreApi.complete(choreId, completedBy, timeSpent);
      const completedChore = response.data.data.completedChore;
      
      // Update the chore's completed history
      const choreIndex = chores.value.findIndex(c => c.id === choreId);
      if (choreIndex !== -1) {
        chores.value[choreIndex].completedChores.unshift(completedChore);
      }
      
      // Add to completed chores list if it's loaded
      completedChores.value.unshift(completedChore);
      
      return completedChore;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete chore');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadCompletedChores(
    householdId: string,
    startDate?: string,
    endDate?: string
  ) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await choreApi.getCompleted(householdId, startDate, endDate);
      completedChores.value = response.data.data.completedChores;
      return completedChores.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load completed chores');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function reset() {
    chores.value = [];
    completedChores.value = [];
    error.value = null;
  }

  return {
    chores,
    completedChores,
    isLoading,
    error,
    loadChores,
    createChore,
    completeChore,
    loadCompletedChores,
    reset,
  };
});
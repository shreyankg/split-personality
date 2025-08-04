import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, Household } from '@/types';
import { userApi, householdApi } from '@/services/api';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const currentHousehold = ref<Household | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function setError(message: string) {
    error.value = message;
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }

  async function createUser(firstName: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await userApi.create(firstName);
      currentUser.value = response.data.data.user;
      localStorage.setItem('userId', currentUser.value.id);
      return currentUser.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadUser(userId: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await userApi.get(userId);
      currentUser.value = response.data.data.user;
      
      if (currentUser.value.householdId) {
        await loadHousehold(currentUser.value.householdId);
      }
      
      return currentUser.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createHousehold() {
    if (!currentUser.value) {
      throw new Error('No current user');
    }

    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await householdApi.create(currentUser.value.id);
      currentHousehold.value = response.data.data.household;
      currentUser.value.householdId = currentHousehold.value.id;
      return currentHousehold.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create household');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function joinHousehold(inviteCode: string) {
    if (!currentUser.value) {
      throw new Error('No current user');
    }

    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await householdApi.join(currentUser.value.id, inviteCode);
      currentHousehold.value = response.data.data.household;
      currentUser.value.householdId = currentHousehold.value.id;
      return currentHousehold.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join household');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadHousehold(householdId: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await householdApi.get(householdId);
      currentHousehold.value = response.data.data.household;
      return currentHousehold.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load household');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateHouseholdSettings(baseRate: number) {
    if (!currentHousehold.value) {
      throw new Error('No current household');
    }

    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await householdApi.updateSettings(currentHousehold.value.id, baseRate);
      currentHousehold.value = response.data.data.household;
      return currentHousehold.value;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update settings');
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function initializeFromStorage() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      loadUser(userId).catch(() => {
        localStorage.removeItem('userId');
      });
    }
  }

  function logout() {
    currentUser.value = null;
    currentHousehold.value = null;
    localStorage.removeItem('userId');
  }

  return {
    currentUser,
    currentHousehold,
    isLoading,
    error,
    createUser,
    loadUser,
    createHousehold,
    joinHousehold,
    loadHousehold,
    updateHouseholdSettings,
    initializeFromStorage,
    logout,
  };
});
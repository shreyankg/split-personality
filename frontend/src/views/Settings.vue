<template>
  <div class="container py-6 pb-20 md:pb-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

    <div class="space-y-6">
      <!-- Household Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Household Settings</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Household Name
            </label>
            <div class="input bg-gray-50">
              {{ userStore.currentHousehold?.name }}
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Household name is automatically generated based on members
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </label>
            <div class="flex space-x-2">
              <div class="input bg-gray-50 flex-1 font-mono">
                {{ userStore.currentHousehold?.inviteCode }}
              </div>
              <button
                @click="copyInviteCode"
                class="btn-secondary"
              >
                Copy
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Share this code with new members to join your household
            </p>
          </div>

          <form @submit.prevent="handleUpdateBaseRate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Base Hourly Rate
              </label>
              <div class="flex space-x-2">
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    v-model.number="baseRateForm"
                    type="number"
                    step="0.25"
                    min="5"
                    max="100"
                    class="input pl-7"
                    :disabled="userStore.isLoading"
                  />
                </div>
                <button
                  type="submit"
                  class="btn-primary"
                  :disabled="userStore.isLoading || baseRateForm === userStore.currentHousehold?.baseRate"
                >
                  <span v-if="userStore.isLoading">Saving...</span>
                  <span v-else>Update</span>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                This rate is used as the base for calculating chore values
              </p>
            </div>
          </form>
        </div>
      </div>

      <!-- Members -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Household Members</h2>
        
        <div class="space-y-3">
          <div
            v-for="member in userStore.currentHousehold?.members"
            :key="member.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-semibold">
                  {{ member.firstName.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ member.firstName }}</div>
                <div class="text-sm text-gray-500">
                  {{ member.id === userStore.currentUser?.id ? 'You' : 'Partner' }}
                </div>
              </div>
            </div>
            
            <div class="text-sm text-gray-500">
              Joined {{ formatDate(member.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Settlement History -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Settlement History</h2>
          <button
            @click="loadSettlements"
            class="text-sm text-primary-600 hover:text-primary-700"
            :disabled="isLoadingSettlements"
          >
            Refresh
          </button>
        </div>
        
        <div v-if="settlements.length === 0 && !isLoadingSettlements" class="text-center py-8 text-gray-500">
          No settlements yet
        </div>
        
        <div v-if="isLoadingSettlements" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
        
        <div class="space-y-3">
          <div
            v-for="settlement in settlements.slice(0, 10)"
            :key="settlement.id"
            class="p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium text-gray-900">
                ${{ settlement.amount.toFixed(2) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(settlement.settledAt) }}
              </div>
            </div>
            
            <div class="text-sm text-gray-600 mb-1">
              {{ settlement.fromUserName }} → {{ settlement.toUserName }}
            </div>
            
            <div v-if="settlement.note" class="text-sm text-gray-500 italic">
              "{{ settlement.note }}"
            </div>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">About Chore Equity</h2>
        
        <div class="text-sm text-gray-600 space-y-2">
          <p>
            Chore Equity helps couples fairly distribute household work by assigning monetary values to chores.
          </p>
          
          <div class="bg-gray-50 rounded-lg p-3 mt-4">
            <h3 class="font-medium text-gray-900 mb-2">How it works:</h3>
            <ul class="space-y-1 text-sm">
              <li>• <strong>Base Rate:</strong> Time × hourly rate</li>
              <li>• <strong>Skill Bonus:</strong> +15% (Intermediate), +30% (Advanced)</li>
              <li>• <strong>Rarity Bonus:</strong> +25% if only one person can do the task</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card border-red-200 bg-red-50">
        <h2 class="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm text-red-700 mb-3">
              Leave this household. This action cannot be undone and you'll lose access to all chore history.
            </p>
            <button
              @click="showLeaveModal = true"
              class="btn-danger"
            >
              Leave Household
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Household Modal -->
    <div v-if="showLeaveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Leave Household</h2>
        
        <div class="mb-6">
          <p class="text-gray-700 mb-4">
            Are you sure you want to leave "{{ userStore.currentHousehold?.name }}"?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-700">
              <strong>Warning:</strong> This action cannot be undone. You'll lose access to all chore history and settlement records.
            </p>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button
            @click="showLeaveModal = false"
            class="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            @click="handleLeaveHousehold"
            class="btn-danger flex-1"
          >
            Leave Household
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { settlementApi } from '@/services/api';
import type { Settlement } from '@/types';

const router = useRouter();
const userStore = useUserStore();

const baseRateForm = ref(15);
const settlements = ref<Settlement[]>([]);
const isLoadingSettlements = ref(false);
const showLeaveModal = ref(false);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const copyInviteCode = async () => {
  if (userStore.currentHousehold?.inviteCode) {
    try {
      await navigator.clipboard.writeText(userStore.currentHousehold.inviteCode);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy invite code:', error);
    }
  }
};

const handleUpdateBaseRate = async () => {
  if (!userStore.currentHousehold || baseRateForm.value === userStore.currentHousehold.baseRate) {
    return;
  }

  try {
    await userStore.updateHouseholdSettings(baseRateForm.value);
  } catch (error) {
    console.error('Failed to update base rate:', error);
  }
};

const loadSettlements = async () => {
  if (!userStore.currentHousehold) return;

  isLoadingSettlements.value = true;
  
  try {
    const response = await settlementApi.getAll(userStore.currentHousehold.id);
    settlements.value = response.data.data.settlements;
  } catch (error) {
    console.error('Failed to load settlements:', error);
  } finally {
    isLoadingSettlements.value = false;
  }
};

const handleLeaveHousehold = () => {
  // In a real app, this would make an API call to remove the user from the household
  // For now, we'll just log them out and clear local data
  userStore.logout();
  router.push('/');
};

onMounted(() => {
  if (userStore.currentHousehold) {
    baseRateForm.value = userStore.currentHousehold.baseRate;
    loadSettlements();
  }
});
</script>
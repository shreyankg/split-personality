<template>
  <div class="container py-6 pb-20 md:pb-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p class="text-gray-600">{{ userStore.currentHousehold?.name }}</p>
    </div>

    <!-- Period Selector -->
    <div class="mb-6">
      <div class="flex space-x-2 bg-gray-100 rounded-lg p-1">
        <button
          v-for="period in periods"
          :key="period.key"
          @click="activePeriod = period.key"
          :class="[
            'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            activePeriod === period.key
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          ]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <div v-if="currentData">
      <!-- Net Balance Card -->
      <div class="card mb-6" :class="getBalanceCardClass()">
        <div class="text-center">
          <div v-if="currentData.netBalance">
            <div class="text-3xl font-bold mb-2" :class="getBalanceTextClass()">
              ${{ currentData.netBalance.amount.toFixed(2) }}
            </div>
            <p class="text-gray-700 mb-4">
              {{ getBalanceMessage() }}
            </p>
            <button
              v-if="canSettle"
              @click="showSettlementModal = true"
              class="btn-success"
            >
              Settle Up
            </button>
          </div>
          <div v-else>
            <div class="text-3xl font-bold text-green-600 mb-2">$0.00</div>
            <p class="text-gray-700">You're all caught up! 🎉</p>
          </div>
        </div>
      </div>

      <!-- Individual Contributions -->
      <div class="grid md:grid-cols-2 gap-4 mb-6">
        <div
          v-for="balance in currentData.balances"
          :key="balance.userId"
          class="card"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">{{ balance.userName }}</h3>
            <div class="text-right">
              <div class="text-2xl font-bold text-primary-600">${{ balance.totalValue.toFixed(2) }}</div>
              <div class="text-sm text-gray-500">{{ balance.choreCount }} chores</div>
            </div>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: getContributionPercentage(balance.totalValue) + '%' }"
            ></div>
          </div>
          
          <div class="text-xs text-gray-500">
            {{ getContributionPercentage(balance.totalValue).toFixed(1) }}% of household contributions
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card text-center">
          <div class="text-2xl font-bold text-gray-900 mb-1">
            ${{ currentData.totalHouseholdValue.toFixed(2) }}
          </div>
          <div class="text-sm text-gray-600">Total Value</div>
        </div>
        
        <div class="card text-center">
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ getTotalChores() }}
          </div>
          <div class="text-sm text-gray-600">Total Chores</div>
        </div>
        
        <div class="card text-center">
          <div class="text-2xl font-bold text-gray-900 mb-1">
            ${{ getAverageChoreValue().toFixed(2) }}
          </div>
          <div class="text-sm text-gray-600">Avg per Chore</div>
        </div>
        
        <div class="card text-center">
          <div class="text-2xl font-bold text-gray-900 mb-1">
            ${{ (userStore.currentHousehold?.baseRate || 0).toFixed(2) }}
          </div>
          <div class="text-sm text-gray-600">Base Rate/hr</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div class="space-y-3">
          <div
            v-for="chore in recentChores.slice(0, 5)"
            :key="chore.id"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
          >
            <div>
              <div class="font-medium text-gray-900">{{ chore.chore.name }}</div>
              <div class="text-sm text-gray-600">
                {{ chore.completedByUser.firstName }} • {{ formatTimeAgo(chore.completedAt) }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-green-600">${{ chore.value.toFixed(2) }}</div>
              <div class="text-sm text-gray-500">{{ chore.timeSpent }}h</div>
            </div>
          </div>
          
          <div v-if="recentChores.length === 0" class="text-center py-4 text-gray-500">
            No completed chores for this period
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="dashboardStore.isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Settlement Modal -->
    <div v-if="showSettlementModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Settle Debt</h2>
        
        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary-600 mb-2">
              ${{ currentData?.netBalance?.amount.toFixed(2) }}
            </div>
            <p class="text-gray-700">
              {{ getBalanceMessage() }}
            </p>
          </div>
        </div>
        
        <form @submit.prevent="handleSettlement" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              How was this settled?
            </label>
            <textarea
              v-model="settlementNote"
              class="input"
              rows="3"
              placeholder="e.g., Paid via Venmo, Covered dinner bill, Cash payment..."
            ></textarea>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="showSettlementModal = false"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-success flex-1"
              :disabled="isSettling"
            >
              <span v-if="isSettling">Settling...</span>
              <span v-else>Confirm Settlement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { useDashboardStore } from '@/stores/dashboard';
import { useChoresStore } from '@/stores/chores';
import { settlementApi } from '@/services/api';
import type { EquityAnalysis } from '@/types';

const userStore = useUserStore();
const dashboardStore = useDashboardStore();
const choresStore = useChoresStore();

const activePeriod = ref<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');
const showSettlementModal = ref(false);
const settlementNote = ref('');
const isSettling = ref(false);

const periods = [
  { key: 'daily' as const, label: 'Today' },
  { key: 'weekly' as const, label: 'This Week' },
  { key: 'monthly' as const, label: 'This Month' },
  { key: 'allTime' as const, label: 'All Time' },
];

const currentData = computed(() => {
  if (!dashboardStore.dashboardData) return null;
  return dashboardStore.dashboardData[activePeriod.value];
});

const canSettle = computed(() => {
  return currentData.value?.netBalance?.owedTo === userStore.currentUser?.id;
});

const recentChores = computed(() => {
  return choresStore.completedChores.slice(0, 10);
});

const getBalanceCardClass = () => {
  if (!currentData.value?.netBalance) return 'bg-green-50 border-green-200';
  return currentData.value.netBalance.owedTo === userStore.currentUser?.id
    ? 'bg-green-50 border-green-200'
    : 'bg-orange-50 border-orange-200';
};

const getBalanceTextClass = () => {
  if (!currentData.value?.netBalance) return 'text-green-600';
  return currentData.value.netBalance.owedTo === userStore.currentUser?.id
    ? 'text-green-600'
    : 'text-orange-600';
};

const getBalanceMessage = () => {
  if (!currentData.value?.netBalance || !userStore.currentHousehold) return '';
  
  const { owedBy, owedTo } = currentData.value.netBalance;
  const owedByUser = userStore.currentHousehold.members.find(m => m.id === owedBy);
  const owedToUser = userStore.currentHousehold.members.find(m => m.id === owedTo);
  
  if (owedTo === userStore.currentUser?.id) {
    return `${owedByUser?.firstName} owes you money`;
  } else {
    return `You owe ${owedToUser?.firstName} money`;
  }
};

const getTotalChores = () => {
  return currentData.value?.balances.reduce((sum, balance) => sum + balance.choreCount, 0) || 0;
};

const getAverageChoreValue = () => {
  const totalChores = getTotalChores();
  const totalValue = currentData.value?.totalHouseholdValue || 0;
  return totalChores > 0 ? totalValue / totalChores : 0;
};

const getContributionPercentage = (value: number) => {
  const total = currentData.value?.totalHouseholdValue || 0;
  return total > 0 ? (value / total) * 100 : 0;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
};

const handleSettlement = async () => {
  if (!currentData.value?.netBalance || !userStore.currentHousehold || !userStore.currentUser) return;
  
  isSettling.value = true;
  
  try {
    await settlementApi.create(
      userStore.currentHousehold.id,
      userStore.currentUser.id,
      currentData.value.netBalance.amount,
      currentData.value.netBalance.owedBy,
      currentData.value.netBalance.owedTo,
      settlementNote.value.trim() || undefined
    );
    
    // Refresh dashboard data
    await dashboardStore.loadDashboard(userStore.currentHousehold.id);
    
    showSettlementModal.value = false;
    settlementNote.value = '';
  } catch (error) {
    console.error('Failed to settle debt:', error);
  } finally {
    isSettling.value = false;
  }
};

// Load data when period changes
watch(activePeriod, async () => {
  if (userStore.currentHousehold) {
    // The dashboard data contains all periods, so no need to reload
    // But we can refresh recent chores for the current period
    const periodData = currentData.value;
    if (periodData) {
      try {
        await choresStore.loadCompletedChores(
          userStore.currentHousehold.id,
          periodData.period.startDate,
          periodData.period.endDate
        );
      } catch (error) {
        console.error('Failed to load period chores:', error);
      }
    }
  }
});

onMounted(async () => {
  if (userStore.currentHousehold) {
    try {
      await dashboardStore.loadDashboard(userStore.currentHousehold.id);
      await choresStore.loadCompletedChores(userStore.currentHousehold.id);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }
});
</script>
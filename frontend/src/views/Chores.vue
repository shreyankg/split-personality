<template>
  <div class="container py-6 pb-20 md:pb-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Chores</h1>
      <button
        @click="showCreateModal = true"
        class="btn-primary"
      >
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Add Chore
      </button>
    </div>

    <!-- Chores List -->
    <div class="space-y-4">
      <div
        v-for="chore in choresStore.chores"
        :key="chore.id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <h3 class="text-lg font-medium text-gray-900">{{ chore.name }}</h3>
              <span
                :class="getSkillLevelClass(chore.skillLevel)"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ getSkillLevelLabel(chore.skillLevel) }}
              </span>
            </div>
            
            <div class="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div v-if="chore.assignedUser" class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                Assigned to {{ chore.assignedUser.firstName }}
              </div>
              <div v-else class="flex items-center text-orange-600">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Unassigned
              </div>
              
              <div v-if="chore.completedChores.length > 0" class="flex items-center text-green-600">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Last completed {{ formatTimeAgo(chore.completedChores[0].completedAt) }}
              </div>
            </div>

            <div v-if="chore.completedChores.length > 0" class="text-sm text-gray-500">
              Last earned: ${{ chore.completedChores[0].value.toFixed(2) }} 
              ({{ chore.completedChores[0].timeSpent }}h by {{ chore.completedChores[0].completedByUser.firstName }})
            </div>
          </div>

          <button
            @click="startCompleteChore(chore)"
            class="btn-success"
          >
            Complete
          </button>
        </div>
      </div>

      <div v-if="choresStore.chores.length === 0 && !choresStore.isLoading" class="text-center py-12">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No chores yet</h3>
        <p class="text-gray-600 mb-4">Create your first chore to get started</p>
        <button
          @click="showCreateModal = true"
          class="btn-primary"
        >
          Add Chore
        </button>
      </div>
    </div>

    <!-- Create Chore Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Create New Chore</h2>
        
        <form @submit.prevent="handleCreateChore" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Chore Name
            </label>
            <input
              v-model="newChore.name"
              type="text"
              required
              class="input"
              placeholder="e.g., Deep Clean Kitchen"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Skill Level
            </label>
            <select v-model="newChore.skillLevel" class="input">
              <option value="BASIC">Basic (No bonus)</option>
              <option value="INTERMEDIATE">Intermediate (+15% bonus)</option>
              <option value="ADVANCED">Advanced (+30% bonus)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <select v-model="newChore.assignedTo" class="input">
              <option value="">Anyone can do it</option>
              <option
                v-for="member in userStore.currentHousehold?.members"
                :key="member.id"
                :value="member.id"
              >
                {{ member.firstName }}
              </option>
            </select>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="cancelCreateChore"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary flex-1"
              :disabled="choresStore.isLoading"
            >
              <span v-if="choresStore.isLoading">Creating...</span>
              <span v-else>Create Chore</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Complete Chore Modal -->
    <div v-if="showCompleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Complete Chore</h2>
        
        <div class="mb-4">
          <h3 class="font-medium text-gray-900">{{ selectedChore?.name }}</h3>
          <p class="text-sm text-gray-600">{{ getSkillLevelLabel(selectedChore?.skillLevel || 'BASIC') }} level chore</p>
        </div>
        
        <form @submit.prevent="handleCompleteChore" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Time Spent (in hours)
            </label>
            <input
              v-model.number="completeForm.timeSpent"
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              required
              class="input"
              placeholder="e.g., 1.5"
            />
            <p class="text-xs text-gray-500 mt-1">Enter time in hours (e.g., 1.5 for 1 hour 30 minutes)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Completed By
            </label>
            <select v-model="completeForm.completedBy" class="input" required>
              <option value="">Select person</option>
              <option
                v-for="member in userStore.currentHousehold?.members"
                :key="member.id"
                :value="member.id"
              >
                {{ member.firstName }}
              </option>
            </select>
          </div>

          <div v-if="estimatedValue > 0" class="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <div class="text-sm">
              <span class="text-primary-700 font-medium">Estimated value: </span>
              <span class="text-primary-900 font-semibold">${{ estimatedValue.toFixed(2) }}</span>
            </div>
            <div class="text-xs text-primary-600 mt-1">
              Based on ${{ userStore.currentHousehold?.baseRate || 15 }}/hour base rate
            </div>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="cancelCompleteChore"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-success flex-1"
              :disabled="choresStore.isLoading"
            >
              <span v-if="choresStore.isLoading">Completing...</span>
              <span v-else>Complete Chore</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useChoresStore } from '@/stores/chores';
import type { Chore, SkillLevel } from '@/types';

const userStore = useUserStore();
const choresStore = useChoresStore();

const showCreateModal = ref(false);
const showCompleteModal = ref(false);
const selectedChore = ref<Chore | null>(null);

const newChore = ref({
  name: '',
  skillLevel: 'BASIC' as SkillLevel,
  assignedTo: '',
});

const completeForm = ref({
  timeSpent: 1,
  completedBy: '',
});

const estimatedValue = computed(() => {
  if (!completeForm.value.timeSpent || !selectedChore.value || !userStore.currentHousehold) {
    return 0;
  }

  const baseRate = userStore.currentHousehold.baseRate;
  const baseValue = baseRate * completeForm.value.timeSpent;
  
  let skillBonus = 0;
  if (selectedChore.value.skillLevel === 'INTERMEDIATE') {
    skillBonus = 0.15;
  } else if (selectedChore.value.skillLevel === 'ADVANCED') {
    skillBonus = 0.30;
  }

  // Note: We can't easily calculate rarity bonus in frontend without more data
  // For now, just show base + skill bonus
  return baseValue * (1 + skillBonus);
});

const getSkillLevelLabel = (level: SkillLevel) => {
  const labels = {
    BASIC: 'Basic',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
  };
  return labels[level];
};

const getSkillLevelClass = (level: SkillLevel) => {
  const classes = {
    BASIC: 'bg-gray-100 text-gray-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-purple-100 text-purple-800',
  };
  return classes[level];
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
};

const handleCreateChore = async () => {
  if (!userStore.currentHousehold) return;

  try {
    await choresStore.createChore(
      userStore.currentHousehold.id,
      newChore.value.name,
      newChore.value.skillLevel,
      newChore.value.assignedTo || undefined
    );
    cancelCreateChore();
  } catch (error) {
    console.error('Failed to create chore:', error);
  }
};

const cancelCreateChore = () => {
  showCreateModal.value = false;
  newChore.value = {
    name: '',
    skillLevel: 'BASIC',
    assignedTo: '',
  };
};

const startCompleteChore = (chore: Chore) => {
  selectedChore.value = chore;
  completeForm.value = {
    timeSpent: 1,
    completedBy: userStore.currentUser?.id || '',
  };
  showCompleteModal.value = true;
};

const handleCompleteChore = async () => {
  if (!selectedChore.value) return;

  try {
    await choresStore.completeChore(
      selectedChore.value.id,
      completeForm.value.completedBy,
      completeForm.value.timeSpent
    );
    cancelCompleteChore();
  } catch (error) {
    console.error('Failed to complete chore:', error);
  }
};

const cancelCompleteChore = () => {
  showCompleteModal.value = false;
  selectedChore.value = null;
  completeForm.value = {
    timeSpent: 1,
    completedBy: '',
  };
};

onMounted(async () => {
  if (userStore.currentHousehold) {
    try {
      await choresStore.loadChores(userStore.currentHousehold.id);
    } catch (error) {
      console.error('Failed to load chores:', error);
    }
  }
});
</script>
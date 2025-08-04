<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container py-8">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {{ userStore.currentUser?.firstName }}!
          </h1>
          <p class="text-lg text-gray-600">
            Let's set up your household
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Create Household -->
          <div class="card">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Create New Household</h2>
              <p class="text-gray-600 mb-6">
                Start a new household and invite your partner
              </p>
              <button
                @click="handleCreateHousehold"
                class="btn-primary w-full"
                :disabled="userStore.isLoading"
              >
                <span v-if="userStore.isLoading">Creating...</span>
                <span v-else>Create Household</span>
              </button>
            </div>
          </div>

          <!-- Join Household -->
          <div class="card">
            <div class="text-center">
              <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Join Existing Household</h2>
              <p class="text-gray-600 mb-6">
                Enter the invite code from your partner
              </p>
              
              <form @submit.prevent="handleJoinHousehold" class="space-y-4">
                <input
                  v-model="inviteCode"
                  type="text"
                  placeholder="Enter invite code"
                  class="input"
                  :disabled="userStore.isLoading"
                  required
                />
                <button
                  type="submit"
                  class="btn-success w-full"
                  :disabled="userStore.isLoading || !inviteCode.trim()"
                >
                  <span v-if="userStore.isLoading">Joining...</span>
                  <span v-else>Join Household</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Success State -->
        <div v-if="showInviteCode" class="card mt-8 bg-success-50 border-success-200">
          <div class="text-center">
            <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Household Created!</h2>
            <p class="text-gray-600 mb-4">
              Share this invite code with your partner:
            </p>
            <div class="bg-white border-2 border-dashed border-success-300 rounded-lg p-4 mb-4">
              <div class="text-2xl font-mono font-bold text-success-700 tracking-wider">
                {{ userStore.currentHousehold?.inviteCode }}
              </div>
            </div>
            <p class="text-sm text-gray-500 mb-6">
              Once your partner joins, you'll both be redirected to the dashboard
            </p>
            <button
              @click="copyInviteCode"
              class="btn-success"
            >
              Copy Invite Code
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const inviteCode = ref('');
const showInviteCode = computed(() => {
  return userStore.currentHousehold && userStore.currentHousehold.members.length === 1;
});

const handleCreateHousehold = async () => {
  try {
    await userStore.createHousehold();
  } catch (error) {
    console.error('Failed to create household:', error);
  }
};

const handleJoinHousehold = async () => {
  if (!inviteCode.value.trim()) return;

  try {
    await userStore.joinHousehold(inviteCode.value.trim());
    router.push('/dashboard');
  } catch (error) {
    console.error('Failed to join household:', error);
  }
};

const copyInviteCode = async () => {
  if (userStore.currentHousehold?.inviteCode) {
    try {
      await navigator.clipboard.writeText(userStore.currentHousehold.inviteCode);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy invite code:', error);
    }
  }
};

// Watch for household member changes to redirect when partner joins
let intervalId: number | null = null;

watch(
  () => userStore.currentHousehold,
  (household) => {
    if (household && household.members.length === 1) {
      // Start polling for new members
      intervalId = window.setInterval(async () => {
        try {
          await userStore.loadHousehold(household.id);
          if (userStore.currentHousehold && userStore.currentHousehold.members.length === 2) {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Failed to check household status:', error);
        }
      }, 3000);
    } else if (household && household.members.length === 2) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      router.push('/dashboard');
    }
  },
  { immediate: true }
);

// Cleanup interval on component unmount
import { onUnmounted } from 'vue';

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
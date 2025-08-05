<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Split Personality</h1>
        <p class="text-lg text-gray-600 mb-8">
          Fair and transparent household chore management
        </p>
      </div>

      <div class="card">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Welcome!</h2>
            <p class="text-gray-600 mb-6">
              Get started by creating your profile. You'll be able to create or join a household with your partner.
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                Your First Name
              </label>
              <input
                id="firstName"
                v-model="firstName"
                type="text"
                required
                class="input"
                placeholder="Enter your first name"
                :disabled="userStore.isLoading"
              />
            </div>

            <button
              type="submit"
              class="btn-primary w-full"
              :disabled="userStore.isLoading || !firstName.trim()"
            >
              <span v-if="userStore.isLoading">Creating...</span>
              <span v-else>Get Started</span>
            </button>
          </form>

          <div class="text-center">
            <p class="text-sm text-gray-500">
              By continuing, you agree to our simple household equity system
            </p>
          </div>
        </div>
      </div>

      <div class="text-center">
        <div class="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Track Chores</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>Fair Values</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mb-2">
              <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
            </div>
            <span>Happy Home</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const firstName = ref('');

const handleSubmit = async () => {
  if (!firstName.value.trim()) return;

  try {
    await userStore.createUser(firstName.value.trim());
    router.push('/onboarding');
  } catch (error) {
    console.error('Failed to create user:', error);
  }
};
</script>
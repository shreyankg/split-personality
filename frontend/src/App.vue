<template>
  <div id="app">
    <header v-if="showNavigation" class="bg-white shadow-sm border-b border-gray-200">
      <nav class="container">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-8">
            <router-link to="/dashboard" class="text-xl font-bold text-primary-600">
              Chore Equity
            </router-link>
            <div class="hidden md:flex space-x-4">
              <router-link
                to="/dashboard"
                class="nav-link"
                active-class="nav-link-active"
              >
                Dashboard
              </router-link>
              <router-link
                to="/chores"
                class="nav-link"
                active-class="nav-link-active"
              >
                Chores
              </router-link>
              <router-link
                to="/settings"
                class="nav-link"
                active-class="nav-link-active"
              >
                Settings
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div v-if="userStore.currentHousehold" class="text-sm text-gray-600">
              {{ userStore.currentHousehold.name }}
            </div>
            <button
              v-if="userStore.currentUser"
              @click="userStore.logout"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>

    <main class="min-h-screen bg-gray-50">
      <div v-if="userStore.error" class="bg-danger-50 border-l-4 border-danger-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-danger-700">{{ userStore.error }}</p>
          </div>
        </div>
      </div>

      <router-view />
    </main>

    <nav v-if="showNavigation" class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div class="flex justify-around py-2">
        <router-link
          to="/dashboard"
          class="mobile-nav-link"
          active-class="mobile-nav-link-active"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span class="text-xs">Dashboard</span>
        </router-link>
        <router-link
          to="/chores"
          class="mobile-nav-link"
          active-class="mobile-nav-link-active"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
          </svg>
          <span class="text-xs">Chores</span>
        </router-link>
        <router-link
          to="/settings"
          class="mobile-nav-link"
          active-class="mobile-nav-link-active"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
          <span class="text-xs">Settings</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const userStore = useUserStore();

const showNavigation = computed(() => {
  return userStore.currentHousehold && route.name !== 'onboarding' && route.name !== 'home';
});

onMounted(() => {
  userStore.initializeFromStorage();
});
</script>

<style scoped>
.nav-link {
  @apply px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors;
}

.nav-link-active {
  @apply text-primary-600 bg-primary-50;
}

.mobile-nav-link {
  @apply flex flex-col items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors;
}

.mobile-nav-link-active {
  @apply text-primary-600;
}
</style>
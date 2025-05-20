<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// Initialize auth state on app mount
onMounted(() => {
  const authStore = useAuthStore()
  authStore.initAuth()
})
</script>

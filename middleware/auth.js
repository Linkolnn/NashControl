export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage if available
  if (!authStore.isAuthenticated) {
    authStore.initAuth()
  }
  
  // If user is not authenticated and tries to access a protected route
  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    return navigateTo('/login')
  }
})

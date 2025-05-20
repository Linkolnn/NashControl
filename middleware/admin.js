export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage if available
  if (!authStore.isAuthenticated) {
    authStore.initAuth()
  }
  
  // If user is not an admin and tries to access admin routes
  if (!authStore.isAdmin()) {
    return navigateTo('/')
  }
})

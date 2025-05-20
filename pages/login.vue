<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Вход в систему</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="login" class="auth-form">
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input 
            id="username" 
            v-model="username" 
            type="text" 
            required 
            placeholder="Введите имя пользователя"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            placeholder="Введите пароль"
          >
        </div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      
      <div class="auth-links">
        <p>Еще нет аккаунта? <NuxtLink to="/register">Зарегистрироваться</NuxtLink></p>
        <p><NuxtLink to="/">Вернуться на главную</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

definePageMeta({
  layout: 'default'
})

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// Redirect if already logged in
onMounted(() => {
  authStore.initAuth()
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})

const login = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля'
    return
  }
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    // Вызываем метод входа из хранилища аутентификации
    const result = await authStore.login(username.value, password.value)
    
    if (result.success) {
      // Показываем сообщение об успешном входе
      successMessage.value = 'Вход выполнен успешно!'
      
      // Перенаправляем на главную страницу после небольшой задержки
      setTimeout(() => {
        navigateTo('/')
      }, 1000)
    } else {
      errorMessage.value = result.message || 'Ошибка входа. Пожалуйста, проверьте данные и попробуйте снова.'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'Произошла ошибка при входе. Пожалуйста, попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.auth-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--primary-color);
  }
}

.auth-form {
  margin-bottom: 20px;
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .btn-block {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
  }
}

.error-message {
  background-color: #ffebee;
  color: #f44336;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.success-message {
  background-color: #e8f5e9;
  color: #4caf50;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-links {
  text-align: center;
  margin-top: 20px;
  
  p {
    margin-bottom: 10px;
    font-size: 0.9rem;
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>

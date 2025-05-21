<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Регистрация</h1>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="register" class="auth-form">
        <div class="form-group">
          <label for="name">Ваше имя</label>
          <input 
            id="name" 
            v-model="formData.name" 
            type="text" 
            required 
            placeholder="Введите ваше имя"
          >
        </div>
        
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input 
            id="username" 
            v-model="formData.username" 
            type="text" 
            required 
            placeholder="Придумайте имя пользователя"
          >
        </div>
        
        <div class="form-group">
          <label for="phone">Телефон</label>
          <input 
            id="phone" 
            v-model="formData.phone" 
            type="tel" 
            placeholder="+7 (___) ___-__-__"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input 
            id="password" 
            v-model="formData.password" 
            type="password" 
            required 
            placeholder="Придумайте пароль"
          >
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Подтверждение пароля</label>
          <input 
            id="confirmPassword" 
            v-model="formData.confirmPassword" 
            type="password" 
            required 
            placeholder="Повторите пароль"
          >
        </div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      
      <div class="auth-links">
        <p>Уже есть аккаунт? <NuxtLink to="/login">Войти</NuxtLink></p>
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
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const formData = ref({
  name: '',
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// Redirect if already logged in
onMounted(() => {
  authStore.initAuth()
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})

const register = async () => {
  // Validate form
  if (!formData.value.name || !formData.value.username || !formData.value.password) {
    errorMessage.value = 'Пожалуйста, заполните все обязательные поля'
    return
  }
  
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }
  
  // Проверка пароля на сложность
  if (formData.value.password.length < 6) {
    errorMessage.value = 'Пароль должен быть не менее 6 символов'
    return
  }
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // Используем метод регистрации из хранилища аутентификации
    const result = await authStore.register({
      username: formData.value.username,
      password: formData.value.password,
      name: formData.value.name,
      phone: formData.value.phone || ''
    })
    
    if (result.success) {
      // Показываем уведомление об успешной регистрации
      successMessage.value = 'Регистрация успешно завершена!'
      
      // Перенаправляем на главную страницу после небольшой задержки
      setTimeout(() => {
        navigateTo('/')
      }, 1500)
    } else {
      errorMessage.value = result.message || 'Произошла ошибка при регистрации'
    }
  } catch (error) {
    console.error('Registration error:', error)
    errorMessage.value = 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.'
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
  
  @media (max-width: 480px) {
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: var(--primary-color);
    font-size: 1.8rem;
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
      margin-bottom: 20px;
    }
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

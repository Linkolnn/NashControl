<template>
  <div class="app-container">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <NuxtLink to="/" class="logo">
            <h1>Народный Контроль</h1>
          </NuxtLink>
          
          <nav class="main-nav">
            <ul>
              <li><NuxtLink to="/">Главная</NuxtLink></li>
              <li><NuxtLink to="/map">Карта проблем</NuxtLink></li>
              <li v-if="authStore.isAdmin()"><NuxtLink to="/admin">Панель администратора</NuxtLink></li>
            </ul>
          </nav>
          
          <div class="auth-actions">
            <template v-if="authStore.isAuthenticated">
              <span class="user-name">{{ authStore.user.name }}</span>
              <button @click="logout" class="logout-btn">Выйти</button>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="login-btn">Войти</NuxtLink>
              <NuxtLink to="/register" class="register-btn">Регистрация</NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <div class="container">
        <slot />
      </div>
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} Народный Контроль. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Initialize auth state on component mount
onMounted(() => {
  authStore.initAuth()
})

// Logout function
const logout = () => {
  authStore.logout()
  navigateTo('/')
}
</script>

<style lang="scss">
/* Global styles */
:root {
  --primary-color: #2196F3;
  --secondary-color: #4CAF50;
  --danger-color: #f44336;
  --text-color: #333;
  --light-gray: #f5f5f5;
  --dark-gray: #757575;
  --border-color: #ddd;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Roboto', 'Arial', sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background-color: var(--light-gray);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Layout styles */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 15px;
    }
  }
  
  .logo {
    text-decoration: none;
    
    h1 {
      color: var(--primary-color);
      font-size: 1.8rem;
      font-weight: 700;
    }
  }
}

.main-nav {
  ul {
    display: flex;
    list-style: none;
    gap: 20px;
    
    @media (max-width: 768px) {
      margin-top: 10px;
    }
    
    li a {
      text-decoration: none;
      color: var(--text-color);
      font-weight: 500;
      padding: 5px 0;
      position: relative;
      
      &:hover, &.router-link-active {
        color: var(--primary-color);
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--primary-color);
        }
      }
    }
  }
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  
  .user-name {
    font-weight: 500;
  }
  
  .login-btn, .register-btn, .logout-btn {
    padding: 8px 16px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
  }
  
  .login-btn {
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    background-color: transparent;
  }
  
  .register-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
  }
  
  .logout-btn {
    background-color: transparent;
    color: var(--danger-color);
    border: 1px solid var(--danger-color);
  }
}

.main-content {
  flex: 1;
  padding: 30px 0;
}

.footer {
  background-color: white;
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--dark-gray);
}

/* Common component styles */
.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  border: none;
  transition: background-color 0.2s, color 0.2s;
  
  &.btn-primary {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: darken(#2196F3, 10%);
    }
  }
  
  &.btn-secondary {
    background-color: var(--secondary-color);
    color: white;
    
    &:hover {
      background-color: darken(#4CAF50, 10%);
    }
  }
  
  &.btn-danger {
    background-color: var(--danger-color);
    color: white;
    
    &:hover {
      background-color: darken(#f44336, 10%);
    }
  }
  
  &.btn-outline {
    background-color: transparent;
    border: 1px solid currentColor;
    
    &.btn-primary {
      color: var(--primary-color);
      
      &:hover {
        background-color: var(--primary-color);
        color: white;
      }
    }
  }
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.section {
  margin-bottom: 40px;
  
  &-title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--primary-color);
    font-weight: 700;
  }
  
  &-subtitle {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: var(--text-color);
  }
}

/* Form styles */
.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
    }
  }
  
  textarea {
    min-height: 120px;
    resize: vertical;
  }
}
</style>

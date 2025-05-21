<template>
  <div class="app-container">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <NuxtLink to="/" class="logo">
            <h1>Народный Контроль</h1>
          </NuxtLink>
          
          <!-- Бургер-меню для мобильных устройств -->
          <button 
            class="burger-menu" 
            :class="{ 'active': menuOpen }" 
            @click="toggleMenu"
            aria-label="Меню"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <!-- Навигация -->
          <nav class="main-nav" :class="{ 'open': menuOpen }">
            <ul>
              <li><NuxtLink to="/" @click="closeMenu">Главная</NuxtLink></li>
              <li><NuxtLink to="/map" @click="closeMenu">Карта проблем</NuxtLink></li>
              <li v-if="authStore.isAdmin()"><NuxtLink to="/admin" @click="closeMenu">Панель администратора</NuxtLink></li>
            </ul>
            
            <!-- Кнопка выхода в мобильном меню -->
            <div class="mobile-auth-actions" v-if="authStore.isAuthenticated">
              <div class="user-info">
                <span class="user-name">{{ authStore.user.name }}</span>
              </div>
              <button @click="logout" class="mobile-logout-btn">
                <i class="fas fa-sign-out-alt"></i> Выйти
              </button>
            </div>
          </nav>
          
          <!-- Действия авторизации -->
          <div class="auth-actions">
            <template v-if="authStore.isAuthenticated">
              <span class="user-name">{{ authStore.user.name }}</span>
              <button @click="logout" class="logout-btn desktop-only">Выйти</button>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="login-btn">Войти</NuxtLink>
              <NuxtLink to="/register" class="register-btn">Регистрация</NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Затемнение фона при открытом мобильном меню -->
    <div 
      v-if="menuOpen" 
      class="menu-overlay" 
      @click="closeMenu"
    ></div>
    
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
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Состояние мобильного меню
const menuOpen = ref(false)

// Переключение состояния меню
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
  
  // Блокировка прокрутки страницы при открытом меню
  if (menuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Закрытие меню
const closeMenu = () => {
  menuOpen.value = false
  document.body.style.overflow = ''
}

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

/* Utility classes */
.desktop-only {
  @media (max-width: 768px) {
    display: none !important;
  }
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
  position: relative;
  z-index: 100;
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    @media (max-width: 768px) {
      flex-wrap: wrap;
    }
  }
  
  .logo {
    text-decoration: none;
    margin-right: auto;
    
    h1 {
      color: var(--primary-color);
      font-size: 1.8rem;
      font-weight: 700;
      
      @media (max-width: 768px) {
        font-size: 1.4rem;
      }
    }
  }
  
  // Стили для бургер-меню
  .burger-menu {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 20px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 110;
    
    span {
      display: block;
      width: 100%;
      height: 3px;
      background-color: var(--primary-color);
      border-radius: 3px;
      transition: all 0.3s ease;
    }
    
    &.active {
      span:nth-child(1) {
        transform: translateY(8.5px) rotate(45deg);
      }
      
      span:nth-child(2) {
        opacity: 0;
      }
      
      span:nth-child(3) {
        transform: translateY(-8.5px) rotate(-45deg);
      }
    }
    
    @media (max-width: 768px) {
      display: flex;
      order: 3;
    }
  }
}

// Стили для навигации
.main-nav {
  margin: 0 20px;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: -280px;
    width: 280px;
    height: 100vh;
    background-color: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    padding: 80px 20px 20px;
    z-index: 100;
    transition: right 0.3s ease;
    margin: 0;
    
    &.open {
      right: 0;
    }
  }
  
  ul {
    display: flex;
    list-style: none;
    gap: 20px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    li a {
      text-decoration: none;
      color: var(--text-color);
      font-weight: 500;
      padding: 5px 0;
      position: relative;
      transition: color 0.2s ease;
      
      @media (max-width: 768px) {
        display: block;
        padding: 10px 0;
        font-size: 1.1rem;
      }
      
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
          
          @media (max-width: 768px) {
            height: 1px;
          }
        }
      }
    }
  }
  
  // Стили для мобильных действий авторизации
  .mobile-auth-actions {
    display: none;
    padding-top: 15px;
    margin-top: 15px;
    border-top: 1px solid var(--border-color);
    
    @media (max-width: 768px) {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .user-name {
        font-weight: 500;
        color: var(--primary-color);
      }
    }
    
    .mobile-logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: transparent;
      color: var(--danger-color);
      border: 1px solid var(--danger-color);
      padding: 10px 15px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      width: 100%;
      justify-content: center;
      
      i {
        font-size: 16px;
      }
      
      &:hover {
        background-color: rgba(244, 67, 54, 0.1);
      }
    }
  }
}

// Затемнение фона при открытом меню
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  animation: fadeIn 0.3s ease;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    order: 2;
    margin-right: 15px;
  }
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .user-name {
    font-weight: 500;
    
    @media (max-width: 480px) {
      display: none;
    }
  }
  
  .login-btn, .register-btn, .logout-btn {
    padding: 8px 16px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    @media (max-width: 480px) {
      padding: 6px 12px;
      font-size: 0.9rem;
    }
  }
  
  .login-btn {
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    background-color: transparent;
    
    &:hover {
      background-color: rgba(33, 150, 243, 0.1);
    }
  }
  
  .register-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover {
      background-color: darken(#2196F3, 10%);
    }
  }
  
  .logout-btn {
    background-color: transparent;
    color: var(--danger-color);
    border: 1px solid var(--danger-color);
    
    &:hover {
      background-color: rgba(244, 67, 54, 0.1);
    }
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

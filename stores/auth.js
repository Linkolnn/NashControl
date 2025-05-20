import { defineStore } from 'pinia'
import { saveUserToCookie, getUserFromCookie, removeUserFromCookie } from '@/utils/cookie'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    users: [] // Кэш пользователей для работы в памяти
  }),
  
  actions: {
    async fetchUsers() {
      try {
        // Загружаем пользователей из JSON-файла
        const data = await import('@/data/users.json').then(m => m.default || m)
        this.users = data
        return true
      } catch (error) {
        console.error('Error fetching users:', error)
        return false
      }
    },
    
    async login(username, password) {
      try {
        // Загружаем пользователей, если еще не загружены
        if (this.users.length === 0) {
          await this.fetchUsers()
        }
        
        const user = this.users.find(u => u.username === username && u.password === password)
        
        if (user) {
          // Создаем копию пользователя без пароля
          const userWithoutPassword = { ...user }
          delete userWithoutPassword.password
          
          // Сохраняем в состояние
          this.user = userWithoutPassword
          this.isAuthenticated = true
          
          // Сохраняем в зашифрованные cookie
          saveUserToCookie(userWithoutPassword)
          
          return { success: true }
        }
        
        return { success: false, message: 'Неверное имя пользователя или пароль' }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, message: 'Произошла ошибка при входе' }
      }
    },
    
    async register(userData) {
      try {
        // Загружаем пользователей, если еще не загружены
        if (this.users.length === 0) {
          await this.fetchUsers()
        }
        
        // Проверяем, что пользователь с таким именем не существует
        const existingUser = this.users.find(u => u.username === userData.username)
        if (existingUser) {
          return { success: false, message: 'Пользователь с таким именем уже существует' }
        }
        
        // Создаем нового пользователя
        const newUser = {
          id: (this.users.length + 1).toString(),
          username: userData.username,
          password: userData.password,
          role: 'user',
          name: userData.name || userData.username,
          phone: userData.phone || ''
        }
        
        // Добавляем в кэш пользователей
        this.users.push(newUser)
        
        // В реальном приложении здесь был бы API-запрос для сохранения пользователя
        
        // Автоматически входим в систему
        const userWithoutPassword = { ...newUser }
        delete userWithoutPassword.password
        
        this.user = userWithoutPassword
        this.isAuthenticated = true
        
        // Сохраняем в зашифрованные cookie
        saveUserToCookie(userWithoutPassword)
        
        return { success: true, user: userWithoutPassword }
      } catch (error) {
        console.error('Registration error:', error)
        return { success: false, message: 'Произошла ошибка при регистрации' }
      }
    },
    
    logout() {
      this.user = null
      this.isAuthenticated = false
      // Удаляем из cookie
      removeUserFromCookie()
    },
    
    initAuth() {
      // Пытаемся получить пользователя из cookie
      const cookieUser = getUserFromCookie()
      
      if (cookieUser) {
        try {
          this.user = cookieUser
          this.isAuthenticated = true
        } catch (e) {
          console.error('Error parsing user from cookie:', e)
          removeUserFromCookie()
        }
      }
    },
    
    isAdmin() {
      return this.user && this.user.role === 'admin'
    }
  }
})

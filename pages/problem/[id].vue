<template>
  <div class="problem-details-page">
    <div v-if="loading" class="loading">
      <p>Загрузка данных...</p>
    </div>
    
    <div v-else-if="!problem" class="error-message">
      <h2>Ошибка</h2>
      <p>Проблема не найдена</p>
      <NuxtLink to="/map" class="back-btn">
        <i class="fas fa-arrow-left"></i> Вернуться к карте
      </NuxtLink>
    </div>
    
    <div v-else class="problem-container">
      <div class="problem-header">
        <NuxtLink to="/map" class="back-btn">
          <i class="fas fa-arrow-left"></i> Вернуться к карте
        </NuxtLink>
        <div class="problem-status" :class="getStatusClass(problem.status)">
          {{ problem.status }}
        </div>
      </div>
      
      <h1 class="problem-title">{{ problem.title }}</h1>
      
      <div class="problem-meta">
        <div class="meta-item">
          <i class="fas fa-calendar"></i>
          <span>Добавлено: {{ formatDate(problem.createdAt) }}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-user"></i>
          <span>Автор: {{ problem.userName || 'Анонимный пользователь' }}</span>
        </div>
        <div v-if="isAdmin" class="meta-item">
          <i class="fas fa-phone"></i>
          <span>Телефон: {{ problem.phone || 'Не указан' }}</span>
        </div>
      </div>
      
      <div class="problem-content">
        <div v-if="problem.imageUrl" class="problem-image">
          <img :src="problem.imageUrl" alt="Фото проблемы">
        </div>
        
        <div class="problem-description">
          <h2>Описание</h2>
          <p>{{ problem.description }}</p>
        </div>
        
        <div class="problem-location">
          <h2>Местоположение</h2>
          <p>{{ problem.address || 'Адрес не определен' }}</p>
          <div class="mini-map">
            <MapComponent 
              :initialCenter="problem.coords" 
              :initialZoom="16"
              :readOnly="true"
              :singleProblem="problem"
            />
          </div>
        </div>
      </div>
      
      <!-- Секция комментариев -->
      <div class="comments-section">
        <h2>Комментарии</h2>
        
        <div class="comments-list">
          <div v-if="comments.length === 0" class="no-comments">
            <p>Пока нет комментариев. Будьте первым!</p>
          </div>
          
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <div class="comment-author">{{ comment.author }}</div>
              <div class="comment-date">{{ formatDate(comment.createdAt) }}</div>
              <button 
                v-if="isAdmin" 
                @click="deleteComment(comment.id)" 
                class="delete-comment-btn"
                title="Удалить комментарий"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div class="comment-text">{{ comment.text }}</div>
          </div>
        </div>
        
        <div class="add-comment">
          <h3>Добавить комментарий</h3>
          <textarea 
            v-model="newComment" 
            placeholder="Напишите ваш комментарий..."
            rows="4"
          ></textarea>
          <button @click="addComment" class="submit-comment-btn" :disabled="!newComment.trim()">
            Отправить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProblemsStore } from '~/stores/problems'
import { useAuthStore } from '~/stores/auth'
import { useCommentsStore } from '~/stores/comments'
import MapComponent from '~/components/MapComponent.vue'

const route = useRoute()
const problemsStore = useProblemsStore()
const authStore = useAuthStore()
const commentsStore = useCommentsStore()

const problem = ref(null)
const loading = ref(true)
const newComment = ref('')

// Проверка, является ли пользователь администратором
const isAdmin = computed(() => authStore.isAdmin())

// Получение комментариев из хранилища
const comments = computed(() => {
  if (!problem.value) return []
  return commentsStore.getCommentsByProblemId(problem.value.id)
})

// Загрузка данных проблемы
onMounted(async () => {
  try {
    const problemId = route.params.id
    
    // Загружаем проблемы, если они еще не загружены
    if (problemsStore.problems.length === 0) {
      await problemsStore.fetchProblems()
    }
    
    // Получаем проблему по ID
    problem.value = problemsStore.getProblemById(problemId)
    
    // Загружаем комментарии из хранилища
    if (problem.value) {
      commentsStore.loadComments(problemId)
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error)
  } finally {
    loading.value = false
  }
})

// Добавление нового комментария
const addComment = () => {
  if (!newComment.value.trim() || !problem.value) return
  
  // Определяем автора комментария
  const commentAuthor = authStore.isAuthenticated && authStore.user 
    ? authStore.user.name 
    : 'Анонимный пользователь'
  
  // Добавляем комментарий через хранилище
  commentsStore.addComment(
    problem.value.id,
    newComment.value.trim(),
    commentAuthor
  )
  
  // Очищаем поле ввода
  newComment.value = ''
}

// Удаление комментария (только для админов)
const deleteComment = (commentId) => {
  if (!authStore.isAdmin() || !problem.value) return
  
  commentsStore.deleteComment(problem.value.id, commentId)
}

// Форматирование даты
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Получение класса для статуса
const getStatusClass = (status) => {
  switch (status) {
    case 'Новая':
      return 'status-new'
    case 'В работе':
      return 'status-in-progress'
    case 'Исправлено':
      return 'status-resolved'
    default:
      return ''
  }
}
</script>

<style lang="scss" scoped>
.problem-details-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error-message {
  text-align: center;
  margin: 50px 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 20px;
  
  &:hover {
    text-decoration: underline;
  }
}

.problem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.problem-status {
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  
  &.status-new {
    background-color: #ffebee;
    color: #f44336;
  }
  
  &.status-in-progress {
    background-color: #fff8e1;
    color: #ff9800;
  }
  
  &.status-resolved {
    background-color: #e8f5e9;
    color: #4caf50;
  }
}

.problem-title {
  font-size: 2rem;
  color: var(--dark-color);
  margin-bottom: 20px;
}

.problem-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--dark-gray);
    font-size: 0.9rem;
    
    i {
      color: var(--primary-color);
    }
  }
}

.problem-content {
  margin-bottom: 40px;
  
  h2 {
    font-size: 1.5rem;
    color: var(--dark-color);
    margin-bottom: 15px;
    border-bottom: 1px solid var(--light-gray);
    padding-bottom: 10px;
  }
}

.problem-image {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
}

.problem-description {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  p {
    line-height: 1.6;
  }
}

.problem-location {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  p {
    margin-bottom: 15px;
  }
  
  .mini-map {
    height: 600px;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
}

// Стили для секции комментариев
.comments-section {
  margin-top: 40px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  h2 {
    font-size: 1.5rem;
    color: var(--dark-color);
    margin-bottom: 20px;
    border-bottom: 1px solid var(--light-gray);
    padding-bottom: 10px;
  }
}

.no-comments {
  text-align: center;
  padding: 20px;
  background-color: var(--light-bg);
  border-radius: 8px;
  color: var(--dark-gray);
}

.comment-item {
  background-color: #fff;
  padding: 0px 10px;
  margin-bottom: 15px;
  
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
    
    .comment-author {
      font-weight: 500;
      color: var(--primary-color);
      margin-right: auto;
    }
    
    .comment-date {
      font-size: 0.8rem;
      color: var(--dark-gray);
      margin-right: 10px;
    }
    
    .delete-comment-btn {
      background: none;
      border: none;
      color: var(--danger-color);
      cursor: pointer;
      padding: 0;
      font-size: 0.85rem;
      opacity: 0.7;
      transition: opacity 0.2s;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .comment-text {
    line-height: 1.5;
  }
}

.add-comment {
  margin-top: 30px;
  background-color: #fff;
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 15px;
    color: var(--dark-color);
    border-bottom: 1px solid var(--light-gray);
    padding-bottom: 10px;
  }
  
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--light-gray);
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
    margin-bottom: 15px;
    
    &:focus {
      border-color: var(--primary-color);
      outline: none;
    }
  }
  
  .submit-comment-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: darken(#2196F3, 10%);
    }
    
    &:disabled {
      background-color: var(--light-gray);
      cursor: not-allowed;
    }
  }
}

// Адаптивные стили
@media (max-width: 768px) {
  .problem-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .problem-title {
    font-size: 1.5rem;
  }
  
  .mini-map {
    height: 250px;
  }
}
</style>

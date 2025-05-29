<template>
  <div class="map-page">
    <div class="map-header">
      <h1>Карта городских проблем</h1>
      <p>Нажмите на карту, чтобы отметить проблему, или выберите существующую метку для просмотра деталей</p>
    </div>
    
    <!-- Кнопка для показа/скрытия фильтров -->
    <button 
      class="toggle-filters-btn" 
      @click="toggleFilters"
      :class="{ 'active': showFilters }"
    >
      <i class="fas fa-filter"></i> Фильтры
    </button>
    
    <div class="map-content">
      <!-- Контейнер карты -->
      <div class="map-container">
        <MapComponent ref="mapComponent" />
      </div>
    </div>
    
    <!-- Панель фильтров (появляется по нажатию на кнопку) -->
    <div 
      class="filters-overlay" 
      v-if="showFilters"
      @click.self="toggleFilters"
    >
      <div class="filters-panel">
        <div class="filters-header">
          <h3>Фильтры</h3>
          <button class="close-filters-btn" @click="toggleFilters">&times;</button>
        </div>
        <MapFilters @filter-change="applyFilters" />
      </div>
    </div>
    
    <div class="map-stats">
      <div class="stat-card">
        <h3>{{ totalProblems }}</h3>
        <p>Всего проблем</p>
      </div>
      <div class="stat-card">
        <h3>{{ newProblems }}</h3>
        <p>Новых</p>
      </div>
      <div class="stat-card">
        <h3>{{ inProgressProblems }}</h3>
        <p>В работе</p>
      </div>
      <div class="stat-card">
        <h3>{{ resolvedProblems }}</h3>
        <p>Решено</p>
      </div>
    </div>
    
    <div class="recent-problems">
      <h2>Недавние проблемы</h2>
      <div class="problems-list">
        <div 
          v-for="problem in recentProblems" 
          :key="problem.id" 
          class="problem-card"
          @click="navigateToProblem(problem.id)"
        >
          <div class="problem-status" :class="getStatusClass(problem.status)">
            {{ problem.status }}
          </div>
          <h3>{{ problem.title }}</h3>
          <p>{{ problem.description }}</p>
          <div class="problem-meta">
            <span>{{ formatDate(problem.createdAt) }}</span>
            <span>{{ problem.userName || 'Анонимный пользователь' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useProblemsStore } from '~/stores/problems'
import MapFilters from '~/components/MapFilters.vue'
import MapComponent from '~/components/MapComponent.vue'

const problemsStore = useProblemsStore()
const mapComponent = ref(null)

// Состояние отображения фильтров (для мобильной версии)
// Сначала скрываем фильтры для исключения проблем с гидратацией
const showFilters = ref(false)

// Fetch problems when component is mountedProblemsStore()
const statusFilter = ref('all')

// Fetch problems when component is mounted

// Переключение отображения фильтров
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// Применение фильтров из компонента MapFilters
const activeFilters = ref({
  status: {
    new: true,
    inProgress: true,
    fixed: true
  },
  date: {
    from: null,
    to: null
  },
  search: ''
})

// Обработчик изменения фильтров
const applyFilters = (filters) => {
  activeFilters.value = filters
  
  // Обновляем метки на карте с применением фильтров
  updateMapMarkers()
}

// Вычисляемые свойства для статистики
const totalProblems = computed(() => problemsStore.problems.length)
const newProblems = computed(() => problemsStore.problems.filter(p => p.status === 'Новая').length)
const inProgressProblems = computed(() => problemsStore.problems.filter(p => p.status === 'В работе').length)
const resolvedProblems = computed(() => problemsStore.problems.filter(p => p.status === 'Исправлено').length)

// Недавние проблемы (последние 5)
const recentProblems = computed(() => {
  return [...problemsStore.problems]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// Фильтрованные проблемы
const filteredProblems = computed(() => {
  return problemsStore.problems.filter(problem => {
    // Фильтр по статусу
    const statusMatch = 
      (activeFilters.value.status.new && problem.status === 'Новая') ||
      (activeFilters.value.status.inProgress && problem.status === 'В работе') ||
      (activeFilters.value.status.fixed && problem.status === 'Исправлено')
    
    // Фильтр по дате
    let dateMatch = true
    if (activeFilters.value.date.from) {
      dateMatch = dateMatch && new Date(problem.createdAt) >= activeFilters.value.date.from
    }
    if (activeFilters.value.date.to) {
      dateMatch = dateMatch && new Date(problem.createdAt) <= activeFilters.value.date.to
    }
    
    // Фильтр по поиску
    let searchMatch = true
    if (activeFilters.value.search) {
      const searchTerm = activeFilters.value.search.toLowerCase()
      searchMatch = 
        problem.title.toLowerCase().includes(searchTerm) ||
        problem.description.toLowerCase().includes(searchTerm)
    }
    
    return statusMatch && dateMatch && searchMatch
  })
})

// Функция обновления меток на карте в соответствии с фильтрами
const updateMapMarkers = () => {
  // Если есть ссылка на компонент карты, вызываем метод обновления меток
  if (mapComponent.value) {
    mapComponent.value.updateMarkers(filteredProblems.value)
  }
}

// Адаптивность: отслеживание изменения размера окна
onMounted(async () => {
  await problemsStore.fetchProblems()
  
  // Обновляем метки на карте после загрузки проблем
  nextTick(() => {
    updateMapMarkers()
  })
  
  // Устанавливаем начальное состояние фильтров на клиенте
  // Это исключит проблемы с гидратацией, так как начальное состояние на сервере и клиенте будет одинаковым
  handleResize()
  
  // Обработчик изменения размера окна
  window.addEventListener('resize', handleResize)
})

// Обработчик изменения размера окна
const handleResize = () => {
  // Проверяем, что window доступен (только на клиенте)
  if (typeof window !== 'undefined') {
    // Автоматически показываем фильтры на десктопе и скрываем на мобильных
    if (window.innerWidth >= 768) {
      showFilters.value = true
    } else {
      showFilters.value = false
    }
  }
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Функция для перехода на страницу подробной информации о проблеме
const navigateToProblem = (problemId) => {
  navigateTo(`/problem/${problemId}`)
}

// Get status class for styling
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

// Reset filters
const resetFilters = () => {
  statusFilter.value = 'all'
}
</script>

<style lang="scss" scoped>
.map-page {
  padding-bottom: 50px;
  position: relative;
}

.map-header {
  margin-bottom: 30px;
  text-align: center;
  
  h1 {
    color: var(--primary-color);
    margin-bottom: 10px;
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }
  
  p {
    color: var(--dark-gray);
    max-width: 700px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
}

// Кнопка переключения фильтров
.toggle-filters-btn {
  display: flex;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 15px;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  
  i {
    font-size: 14px;
  }
  
  &:hover {
    background-color: darken(#2196F3, 10%);
  }
  
  &.active {
    background-color: darken(#2196F3, 15%);
  }
}

// Контейнер для карты и фильтров
.map-content {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

// Оверлей для фильтров
.filters-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

// Панель фильтров
.filters-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  
  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    h3 {
      margin: 0;
      color: var(--primary-color);
      font-size: 1.3rem;
    }
    
    .close-filters-btn {
      background: none;
      border: none;
      font-size: 1.8rem;
      line-height: 1;
      color: #999;
      cursor: pointer;
      padding: 0;
      
      &:hover {
        color: var(--danger-color);
      }
    }
  }
}

// Контейнер карты
.map-container {
  flex-grow: 1;
  height: 90vh;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.map-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    
    h3 {
      font-size: 2rem;
      margin-bottom: 5px;
      color: var(--primary-color);
    }
    
    p {
      color: var(--dark-gray);
      font-size: 1rem;
    }
  }
}

.recent-problems {
  h2 {
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: var(--text-color);
  }
  
  .problems-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .problem-card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
    }
    
    .problem-status {
      position: absolute;
      top: 0;
      right: 0;
      padding: 5px 10px;
      font-size: 0.8rem;
      font-weight: 500;
      color: white;
      
      &.status-new {
        background-color: #f44336;
      }
      
      &.status-in-progress {
        background-color: #ff9800;
      }
      
      &.status-resolved {
        background-color: #4caf50;
      }
    }
    
    h3 {
      margin-top: 10px;
      margin-bottom: 10px;
      font-size: 1.1rem;
      color: var(--dark-color);
    }
    
    p {
      color: var(--dark-gray);
      margin-bottom: 15px;
      font-size: 0.9rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .problem-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--medium-gray);
    }
  }
}
</style>

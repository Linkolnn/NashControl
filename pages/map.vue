<template>
  <div class="map-page">
    <div class="map-header">
      <h1>Карта городских проблем</h1>
      <p>Нажмите на карту, чтобы отметить проблему, или выберите существующую метку для просмотра деталей</p>
    </div>
    
    <div class="map-filters">
      <div class="filter-group">
        <label for="status-filter">Фильтр по статусу:</label>
        <select id="status-filter" v-model="statusFilter">
          <option value="all">Все статусы</option>
          <option value="Новая">Новые</option>
          <option value="В работе">В работе</option>
          <option value="Исправлено">Исправленные</option>
        </select>
      </div>
      
      <div class="filter-group">
        <button @click="resetFilters" class="btn btn-outline btn-primary">Сбросить фильтры</button>
      </div>
    </div>
    
    <div class="map-container">
      <MapComponent />
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
        <div v-for="problem in recentProblems" :key="problem.id" class="problem-card">
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
import { ref, computed, onMounted } from 'vue'
import { useProblemsStore } from '@/stores/problems'

definePageMeta({
  layout: 'default'
})

const problemsStore = useProblemsStore()
const statusFilter = ref('all')

// Fetch problems when component is mounted
onMounted(async () => {
  await problemsStore.fetchProblems()
})

// Computed properties for filtered problems
const filteredProblems = computed(() => {
  if (statusFilter.value === 'all') {
    return problemsStore.problems
  }
  return problemsStore.problems.filter(p => p.status === statusFilter.value)
})

// Statistics
const totalProblems = computed(() => problemsStore.problems.length)
const newProblems = computed(() => problemsStore.problems.filter(p => p.status === 'Новая').length)
const inProgressProblems = computed(() => problemsStore.problems.filter(p => p.status === 'В работе').length)
const resolvedProblems = computed(() => problemsStore.problems.filter(p => p.status === 'Исправлено').length)

// Recent problems (last 5)
const recentProblems = computed(() => {
  return [...problemsStore.problems]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
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
}

.map-header {
  margin-bottom: 30px;
  text-align: center;
  
  h1 {
    font-size: 2.2rem;
    color: var(--primary-color);
    margin-bottom: 10px;
  }
  
  p {
    color: var(--dark-gray);
    font-size: 1.1rem;
  }
}

.map-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
    
    label {
      font-weight: 500;
    }
    
    select {
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background-color: white;
    }
  }
}

.map-container {
  height: 600px;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
      font-size: 1.2rem;
    }
    
    p {
      color: var(--text-color);
      margin-bottom: 15px;
      font-size: 0.95rem;
      line-height: 1.5;
      
      // Truncate long descriptions
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .problem-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--dark-gray);
      border-top: 1px solid var(--border-color);
      padding-top: 10px;
    }
  }
}
</style>

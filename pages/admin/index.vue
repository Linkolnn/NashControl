<template>
  <div class="admin-page">
    <h1>Панель администратора</h1>
    
    <div class="admin-stats">
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
    
    <div class="admin-filters">
      <h3 class="filters-title">Фильтры</h3>
      
      <div class="filter-group">
        <label>Статус проблемы</label>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input 
              type="checkbox" 
              id="status-new" 
              :checked="statusFilter === 'all' || statusFilter === 'Новая'"
              @change="toggleStatus('Новая')"
            >
            <label for="status-new">
              <span class="status-badge status-new">Новая</span>
            </label>
          </div>
          
          <div class="checkbox-item">
            <input 
              type="checkbox" 
              id="status-in-progress" 
              :checked="statusFilter === 'all' || statusFilter === 'В работе'"
              @change="toggleStatus('В работе')"
            >
            <label for="status-in-progress">
              <span class="status-badge status-in-progress">В работе</span>
            </label>
          </div>
          
          <div class="checkbox-item">
            <input 
              type="checkbox" 
              id="status-fixed" 
              :checked="statusFilter === 'all' || statusFilter === 'Исправлено'"
              @change="toggleStatus('Исправлено')"
            >
            <label for="status-fixed">
              <span class="status-badge status-fixed">Исправлено</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="filter-group">
        <label>Дата добавления</label>
        <div class="date-range">
          <div class="date-input">
            <label for="date-from">От</label>
            <input 
              id="date-from" 
              v-model="dateFilter.from" 
              type="date" 
              @change="applyFilters"
            >
          </div>
          
          <div class="date-input">
            <label for="date-to">До</label>
            <input 
              id="date-to" 
              v-model="dateFilter.to" 
              type="date" 
              @change="applyFilters"
            >
          </div>
        </div>
      </div>
      
      <div class="filter-group">
        <label for="search">Поиск по названию</label>
        <input 
          id="search" 
          v-model="searchQuery" 
          type="text" 
          placeholder="Введите текст для поиска"
        >
      </div>
      
      <div class="filter-actions">
        <button @click="resetFilters" class="reset-btn">
          <i class="fas fa-undo"></i> Сбросить фильтры
        </button>
      </div>
    </div>
    
    <div class="problems-table-container">
      <table class="problems-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Статус</th>
            <th>Дата создания</th>
            <th>Автор</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="problem in filteredProblems" :key="problem.id" @click="viewProblem(problem)">
            <td>{{ problem.id }}</td>
            <td>{{ problem.title }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(problem.status)">
                {{ problem.status }}
              </span>
            </td>
            <td>{{ formatDate(problem.createdAt) }}</td>
            <td>{{ problem.userName || 'Анонимный пользователь' }}</td>
            <td class="actions-cell">
              <button @click="viewProblem(problem)" class="btn-icon view-btn" title="Просмотреть">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editProblem(problem)" class="btn-icon edit-btn" title="Редактировать">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteProblem(problem.id)" class="btn-icon delete-btn" title="Удалить">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredProblems.length === 0">
            <td colspan="6" class="empty-table">Нет проблем, соответствующих фильтрам</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Problem Details Modal -->
    <div v-if="selectedProblem" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Редактирование проблемы' : 'Детали проблемы' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="isEditing" class="edit-form">
            <div class="form-group">
              <label for="edit-title">Название</label>
              <input id="edit-title" v-model="editForm.title" type="text" required>
            </div>
            
            <div class="form-group">
              <label for="edit-description">Описание</label>
              <textarea id="edit-description" v-model="editForm.description" required></textarea>
            </div>
            
            <div class="form-group">
              <label for="edit-status">Статус</label>
              <select id="edit-status" v-model="editForm.status">
                <option value="Новая">Новая</option>
                <option value="В работе">В работе</option>
                <option value="Исправлено">Исправлено</option>
              </select>
            </div>
          </div>
          
          <div v-else class="problem-details">
            <div class="detail-row">
              <strong>ID:</strong>
              <span>{{ selectedProblem.id }}</span>
            </div>
            
            <div class="detail-row">
              <strong>Название:</strong>
              <span>{{ selectedProblem.title }}</span>
            </div>
            
            <div class="detail-row">
              <strong>Описание:</strong>
              <p>{{ selectedProblem.description }}</p>
            </div>
            
            <div class="detail-row">
              <strong>Статус:</strong>
              <span class="status-badge" :class="getStatusClass(selectedProblem.status)">
                {{ selectedProblem.status }}
              </span>
            </div>
            
            <div class="detail-row">
              <strong>Координаты:</strong>
              <span>{{ selectedProblem.coords.join(', ') }}</span>
            </div>
            
            <div class="detail-row">
              <strong>Дата создания:</strong>
              <span>{{ formatDate(selectedProblem.createdAt, true) }}</span>
            </div>
            
            <div class="detail-row">
              <strong>Последнее обновление:</strong>
              <span>{{ formatDate(selectedProblem.updatedAt, true) }}</span>
            </div>
            
            <div class="detail-row">
              <strong>Автор:</strong>
              <span>{{ selectedProblem.userName || 'Анонимный пользователь' }}</span>
            </div>
            
            <div class="detail-row" v-if="selectedProblem.userPhone">
              <strong>Телефон:</strong>
              <span>{{ selectedProblem.userPhone }}</span>
            </div>
            
            <div class="detail-row" v-if="selectedProblem.imageUrl">
              <strong>Изображение:</strong>
              <div class="problem-image">
                <img :src="selectedProblem.imageUrl" alt="Фото проблемы">
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button v-if="isEditing" @click="saveChanges" class="btn btn-primary">Сохранить</button>
          <button v-if="isEditing" @click="cancelEdit" class="btn btn-outline">Отмена</button>
          <button v-if="!isEditing" @click="editProblem(selectedProblem)" class="btn btn-primary">Редактировать</button>
          <button v-if="!isEditing" @click="closeModal" class="btn btn-outline">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProblemsStore } from '@/stores/problems'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'admin']
})

const problemsStore = useProblemsStore()
const statusFilter = ref('all')
const searchQuery = ref('')
const dateFilter = ref({
  from: '',
  to: ''
})
const selectedProblem = ref(null)
const isEditing = ref(false)
const editForm = ref({
  id: null,
  title: '',
  description: '',
  status: ''
})

// Fetch problems when component is mounted
onMounted(async () => {
  await problemsStore.fetchProblems()
})

// Функция для переключения статуса фильтра
const toggleStatus = (status) => {
  if (statusFilter.value === status) {
    // Если текущий фильтр равен выбранному статусу, сбрасываем фильтр на 'all'
    statusFilter.value = 'all'
  } else {
    // Иначе устанавливаем фильтр на выбранный статус
    statusFilter.value = status
  }
}

// Функция для применения фильтров
const applyFilters = () => {
  // Эта функция вызывается при изменении фильтров даты
  // Она не требует дополнительной логики, так как фильтрация происходит в computed свойстве
}

// Функция для сброса всех фильтров
const resetFilters = () => {
  statusFilter.value = 'all'
  searchQuery.value = ''
  dateFilter.value.from = ''
  dateFilter.value.to = ''
}

// Computed properties for filtered problems
const filteredProblems = computed(() => {
  let result = [...problemsStore.problems]
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    result = result.filter(problem => problem.status === statusFilter.value)
  }
  
  // Apply date filters
  if (dateFilter.value.from) {
    const fromDate = new Date(dateFilter.value.from)
    fromDate.setHours(0, 0, 0, 0) // Устанавливаем время на начало дня
    result = result.filter(problem => new Date(problem.createdAt) >= fromDate)
  }
  
  if (dateFilter.value.to) {
    const toDate = new Date(dateFilter.value.to)
    toDate.setHours(23, 59, 59, 999) // Устанавливаем время на конец дня
    result = result.filter(problem => new Date(problem.createdAt) <= toDate)
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(problem => 
      problem.title.toLowerCase().includes(query) || 
      problem.description.toLowerCase().includes(query)
    )
  }
  
  // Sort by creation date (newest first)
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// Statistics
const totalProblems = computed(() => problemsStore.problems.length)
const newProblems = computed(() => problemsStore.problems.filter(p => p.status === 'Новая').length)
const inProgressProblems = computed(() => problemsStore.problems.filter(p => p.status === 'В работе').length)
const resolvedProblems = computed(() => problemsStore.problems.filter(p => p.status === 'Исправлено').length)

// Format date
const formatDate = (dateString, includeTime = false) => {
  const date = new Date(dateString)
  if (includeTime) {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
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

// View problem details
const viewProblem = (problem) => {
  selectedProblem.value = problem
  isEditing.value = false
}

// Edit problem
const editProblem = (problem) => {
  selectedProblem.value = problem
  editForm.value = {
    id: problem.id,
    title: problem.title,
    description: problem.description,
    status: problem.status
  }
  isEditing.value = true
}

// Save changes to problem
const saveChanges = async () => {
  try {
    // Update the problem in the store
    const index = problemsStore.problems.findIndex(p => p.id === editForm.value.id)
    if (index !== -1) {
      const updatedProblem = {
        ...problemsStore.problems[index],
        title: editForm.value.title,
        description: editForm.value.description,
        status: editForm.value.status,
        updatedAt: new Date().toISOString()
      }
      
      problemsStore.problems[index] = updatedProblem
      await problemsStore.saveProblemData()
      
      // Update selected problem
      selectedProblem.value = updatedProblem
      isEditing.value = false
    }
  } catch (error) {
    console.error('Error saving changes:', error)
    alert('Произошла ошибка при сохранении изменений')
  }
}

// Cancel edit
const cancelEdit = () => {
  isEditing.value = false
}

// Delete problem
const deleteProblem = async (id) => {
  if (confirm('Вы уверены, что хотите удалить эту проблему?')) {
    try {
      const index = problemsStore.problems.findIndex(p => p.id === id)
      if (index !== -1) {
        problemsStore.problems.splice(index, 1)
        await problemsStore.saveProblemData()
        
        // Close modal if the deleted problem is currently selected
        if (selectedProblem.value && selectedProblem.value.id === id) {
          closeModal()
        }
      }
    } catch (error) {
      console.error('Error deleting problem:', error)
      alert('Произошла ошибка при удалении проблемы')
    }
  }
}

// Close modal
const closeModal = () => {
  selectedProblem.value = null
  isEditing.value = false
}
</script>

<style lang="scss" scoped>
.admin-page {
  padding-bottom: 50px;
  
  h1 {
    font-size: 2.2rem;
    color: var(--primary-color);
    margin-bottom: 30px;
  }
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  
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

.admin-filters {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
  
  .filters-title {
    margin-top: 0;
    margin-bottom: 20px;
    color: var(--primary-color);
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .filter-group {
    margin-bottom: 20px;
    
    > label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    
    input[type="text"] {
      width: 100%;
      padding: 10px 12px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      font-size: 0.9rem;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
      }
    }
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 8px;
    }
    
    .checkbox-item {
      display: flex;
      align-items: center;
      
      input[type="checkbox"] {
        margin-right: 6px;
      }
    }
  }
  
  .date-range {
    display: flex;
    gap: 15px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }
    
    .date-input {
      flex: 1;
      
      label {
        display: block;
        margin-bottom: 5px;
        font-size: 0.85rem;
        color: var(--dark-gray);
      }
      
      input[type="date"] {
        width: 100%;
        padding: 8px 10px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        font-size: 0.9rem;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }
      }
    }
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
    
    &.status-new {
      background-color: #ffebee;
      color: #f44336;
    }
    
    &.status-in-progress {
      background-color: #fff8e1;
      color: #ff9800;
    }
    
    &.status-fixed {
      background-color: #e8f5e9;
      color: #4caf50;
    }
  }
  
  .filter-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
    
    .reset-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: transparent;
      color: var(--dark-gray);
      border: 1px solid var(--border-color);
      padding: 8px 15px;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: #f5f5f5;
        border-color: #ccc;
      }
      
      i {
        font-size: 0.8rem;
      }
    }
  }
}

.problems-table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.problems-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 600;
    color: var(--text-color);
  }
  
  tr:hover {
    background-color: #f9f9f9;
  }
  
  .empty-table {
    text-align: center;
    padding: 30px;
    color: var(--dark-gray);
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
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
  
  .actions-cell {
    white-space: nowrap;
    
    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: none;
      background-color: transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 5px;
      
      &:hover {
        background-color: #f0f0f0;
      }
      
      &.view-btn {
        color: var(--primary-color);
      }
      
      &.edit-btn {
        color: #ff9800;
      }
      
      &.delete-btn {
        color: #f44336;
      }
    }
  }
}

.modal {
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
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    
    h3 {
      margin: 0;
      color: var(--primary-color);
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--dark-gray);
      
      &:hover {
        color: var(--danger-color);
      }
    }
  }
  
  .modal-body {
    padding: 20px;
    
    .problem-details {
      .detail-row {
        margin-bottom: 15px;
        
        strong {
          display: block;
          margin-bottom: 5px;
          color: var(--dark-gray);
        }
        
        p {
          margin: 0;
          line-height: 1.5;
        }
        
        .problem-image {
          margin-top: 10px;
          
          img {
            max-width: 100%;
            border-radius: 4px;
          }
        }
      }
    }
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>

<template>
  <div class="map-filters">
    <h3 class="filters-title">Фильтры</h3>
    
    <div class="filter-group">
      <label>Статус проблемы</label>
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input 
            type="checkbox" 
            id="status-new" 
            v-model="filters.status.new"
            @change="applyFilters"
          >
          <label for="status-new">
            <span class="status-badge status-new">Новая</span>
          </label>
        </div>
        
        <div class="checkbox-item">
          <input 
            type="checkbox" 
            id="status-in-progress" 
            v-model="filters.status.inProgress"
            @change="applyFilters"
          >
          <label for="status-in-progress">
            <span class="status-badge status-in-progress">В работе</span>
          </label>
        </div>
        
        <div class="checkbox-item">
          <input 
            type="checkbox" 
            id="status-fixed" 
            v-model="filters.status.fixed"
            @change="applyFilters"
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
            type="date" 
            id="date-from" 
            v-model="filters.date.from"
            @change="applyFilters"
          >
        </div>
        
        <div class="date-input">
          <label for="date-to">До</label>
          <input 
            type="date" 
            id="date-to" 
            v-model="filters.date.to"
            @change="applyFilters"
          >
        </div>
      </div>
    </div>
    
    <div class="filter-group">
      <label for="search">Поиск по названию</label>
      <input 
        type="text" 
        id="search" 
        v-model="filters.search"
        @input="applyFilters"
        placeholder="Введите текст для поиска"
      >
    </div>
    
    <div class="filter-actions">
      <button @click="resetFilters" class="reset-btn">
        <i class="fas fa-undo"></i> Сбросить фильтры
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['filter-change'])

// Состояние фильтров
const filters = reactive({
  status: {
    new: true,
    inProgress: true,
    fixed: true
  },
  date: {
    from: '',
    to: ''
  },
  search: ''
})

// Применить фильтры
const applyFilters = () => {
  emit('filter-change', {
    status: {
      new: filters.status.new ? 'Новая' : null,
      inProgress: filters.status.inProgress ? 'В работе' : null,
      fixed: filters.status.fixed ? 'Исправлено' : null
    },
    date: {
      from: filters.date.from ? new Date(filters.date.from) : null,
      to: filters.date.to ? new Date(filters.date.to) : null
    },
    search: filters.search
  })
}

// Сбросить все фильтры
const resetFilters = () => {
  filters.status.new = true
  filters.status.inProgress = true
  filters.status.fixed = true
  filters.date.from = ''
  filters.date.to = ''
  filters.search = ''
  
  applyFilters()
}
</script>

<style lang="scss" scoped>
.map-filters {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  
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
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .checkbox-item {
      display: flex;
      align-items: center;
      
      input[type="checkbox"] {
        margin-right: 6px;
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
  
  .date-range {
    display: flex;
    gap: 15px;
    
    .date-input {
      flex: 1;
      
      label {
        display: block;
        margin-bottom: 5px;
        font-size: 0.9rem;
        color: #666;
      }
      
      input[type="date"] {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    }
  }
  
  input[type="text"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
    }
  }
  
  .filter-actions {
    margin-top: 25px;
    display: flex;
    justify-content: flex-end;
    
    .reset-btn {
      background-color: #f5f5f5;
      color: #666;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #e0e0e0;
      }
      
      i {
        font-size: 14px;
      }
    }
  }
  
  // Адаптивность для мобильных устройств
  @media (max-width: 768px) {
    padding: 15px;
    
    .date-range {
      flex-direction: column;
      gap: 10px;
    }
    
    .checkbox-group {
      flex-direction: column;
      gap: 8px;
    }
    
    .filter-actions {
      justify-content: center;
    }
  }
}
</style>

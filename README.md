# Народный Контроль (NashControl)

![Народный Контроль](public/images/logo.png)

## Описание проекта

«Народный Контроль» — это интерактивная платформа, которая позволяет жителям города сообщать о проблемах городской инфраструктуры, а администрации — оперативно реагировать на них. Проект разработан с использованием современного стека технологий: Nuxt 3, Vue.js, Pinia и интеграции с Яндекс.Картами.

### Технологический стек

Проект «Народный Контроль» реализован с использованием следующих технологий:

- **Nuxt 3** - современный фреймворк для разработки веб-приложений на базе Vue.js, предоставляющий широкие возможности для создания высокопроизводительных приложений. В проекте используются такие возможности Nuxt 3, как автоматическая маршрутизация, мидлвары и композабельные функции.

- **Vue.js 3** - прогрессивный JavaScript-фреймворк для создания пользовательских интерфейсов. В проекте используется Composition API для организации логики компонентов, что позволяет создавать более модульный и поддерживаемый код.

- **Pinia** - современная библиотека для управления состоянием в Vue-приложениях, пришедшая на смену Vuex. В проекте используется для хранения и управления данными о проблемах, авторизации и комментариях.

- **Яндекс.Карты API** - мощный инструмент для интеграции картографических сервисов в приложение. Используется для отображения интерактивной карты с маркерами проблем и возможностью добавления новых проблем по клику на карте.

- **SCSS** - препроцессор CSS, расширяющий возможности стандартного CSS. В проекте используется для создания адаптивного и модульного дизайна с вложенными селекторами и переменными.

Такой технологический стек обеспечивает высокую производительность приложения, удобство разработки и поддержки, а также хорошую масштабируемость проекта.

### Основные возможности

- **Интерактивная карта проблем**: Отображение всех зарегистрированных проблем на карте города
- **Добавление новых проблем**: Пользователи могут отметить проблему на карте и заполнить форму с описанием
- **Система комментариев**: Возможность обсуждения проблем в комментариях
- **Отслеживание статуса**: Каждая проблема имеет статус (Новая, В работе, Исправлено)
- **Админ-панель**: Специальный интерфейс для администраторов с возможностью управления проблемами
- **Система авторизации**: Регистрация и вход пользователей

## Структура проекта

```
/home/linkoln/Vue_Apps/NashControl/
├── assets/            # Статические ресурсы (стили, изображения)
├── components/        # Vue компоненты
│   ├── MapComponent.vue   # Компонент карты с проблемами
│   └── MapFilters.vue     # Фильтры для карты проблем
├── composables/       # Композабельные функции Vue
├── data/              # Данные проекта (JSON файлы)
│   └── problems.json      # Данные о проблемах
├── layouts/           # Шаблоны страниц
├── middleware/        # Промежуточное ПО
│   ├── admin.js           # Проверка прав администратора
│   └── auth.js            # Проверка авторизации пользователя
├── pages/             # Страницы приложения
│   ├── admin/             # Страницы админ-панели
│   │   └── index.vue      # Главная страница админ-панели
│   ├── problem/           # Страницы проблем
│   │   └── [id].vue       # Детальная страница проблемы
│   ├── index.vue          # Главная страница
│   ├── login.vue          # Страница входа
│   ├── map.vue            # Страница с картой проблем
│   └── register.vue       # Страница регистрации
├── plugins/           # Плагины Nuxt
├── public/            # Публичные файлы
├── server/            # Серверная часть
├── stores/            # Хранилища Pinia
│   ├── auth.js            # Хранилище авторизации
│   ├── comments.js        # Хранилище комментариев
│   └── problems.js        # Хранилище проблем
└── utils/             # Вспомогательные функции
```

## Основные компоненты

### MapComponent.vue

Ключевой компонент приложения, отвечающий за отображение интерактивной карты с проблемами. Интегрирован с API Яндекс.Карт и обеспечивает следующую функциональность:

- Отображение проблем на карте с использованием маркеров
- Кластеризация маркеров для удобства просмотра
- Добавление новых проблем через клик на карте
- Просмотр деталей проблемы при клике на маркер
- Фильтрация проблем по статусу и другим параметрам

#### Пример кода MapComponent.vue

```vue
<template>
  <div class="map-container">
    <div id="map" class="map"></div>
  </div>
    
  <!-- Модальное окно для добавления/редактирования проблемы -->
  <Teleport to="body">
    <div v-if="showForm" class="problem-form-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ formData.id ? 'Редактировать проблему' : 'Добавить новую проблему' }}</h3>
          <button type="button" @click="closeForm" class="close-modal-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="coordinates-info">
            <i class="fas fa-map-marker-alt"></i>
            <span>Координаты: {{ formData.coords[0].toFixed(6) }}, {{ formData.coords[1].toFixed(6) }}</span>
          </div>
          
          <form @submit.prevent="saveProblem">
            <!-- Поля формы для заполнения данных о проблеме -->
            <!-- ... -->
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed, defineExpose } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProblemsStore } from '@/stores/problems'

// Пропсы компонента
const props = defineProps({
  // Начальные координаты карты
  initialCoords: {
    type: Array,
    default: () => [61.25, 73.4] // Сургут по умолчанию
  },
  // Начальный зум карты
  initialZoom: {
    type: Number,
    default: 14
  }
})

// Состояние компонента
const map = ref(null)
const clusterer = ref(null)
const markers = ref([])
const showForm = ref(false)
const formData = ref({
  id: null,
  title: '',
  description: '',
  coords: [0, 0],
  status: 'Новая',
  image: null,
  imageUrl: ''
})

// Инициализация карты при монтировании компонента
onMounted(async () => {
  if (typeof window !== 'undefined') {
    // Инициализируем карту с помощью плагина
    const { $initYandexMap } = useNuxtApp()
    map.value = await $initYandexMap('map', props.initialCoords, props.initialZoom)
    
    // Инициализируем кластеризатор для группировки меток
    initClusterer()
    
    // Загружаем проблемы и добавляем их на карту
    await problemsStore.fetchProblems()
    addProblemsToMap()
    
    // Добавляем обработчик клика по карте для добавления новых проблем
    map.value.events.add('click', (e) => {
      // Получаем координаты клика
      const coords = e.get('coords')
      
      // Открываем форму для добавления новой проблемы
      formData.value = {
        id: null,
        title: '',
        description: '',
        coords: coords,
        status: 'Новая',
        image: null,
        imageUrl: ''
      }
      
      showForm.value = true
    })
  }
})

// Метод для обновления маркеров на карте при фильтрации
const updateMarkers = (filteredProblems) => {
  // Очищаем все маркеры с карты
  clusterer.value.removeAll()
  markers.value = []
  
  // Добавляем только отфильтрованные проблемы
  filteredProblems.forEach(problem => {
    addProblemMarker(problem)
  })
}

// Экспортируем методы для использования в родительском компоненте
defineExpose({
  updateMarkers
})
</script>
```

### Страницы

#### Главная страница (index.vue)

Информационная страница с описанием проекта, инструкциями по использованию и призывом к действию. Состоит из нескольких разделов:

- **Геройский блок** с названием проекта и кнопкой перехода к карте проблем
- **Блок о проекте** с описанием целей и задач платформы
- **Блок "Как это работает"** с пошаговой инструкцией по использованию платформы
- **Блок статистики** с информацией о решенных проблемах

#### Пример кода index.vue

```vue
<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>Народный Контроль</h1>
        <p class="hero-subtitle">Вместе сделаем наш город лучше!</p>
        <div class="hero-actions">
          <NuxtLink to="/map" class="btn btn-primary">Перейти к карте проблем</NuxtLink>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="section about-section">
      <h2 class="section-title">О проекте</h2>
      <div class="about-content">
        <div class="about-text">
          <p>
            «Народный Контроль» — это интерактивная платформа, которая позволяет жителям города сообщать о проблемах городской инфраструктуры, а администрации — оперативно реагировать на них.
          </p>
          <p>
            Наша цель — создать эффективный механизм взаимодействия между гражданами и городскими службами для быстрого решения проблем и улучшения качества жизни в городе.
          </p>
        </div>
        <div class="about-image">
          <img src="/images/city-illustration.svg" alt="Городская иллюстрация">
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="section how-it-works-section">
      <h2 class="section-title">Как это работает</h2>
      <div class="steps-container">
        <div class="step-card">
          <div class="step-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <h3>Отметьте проблему на карте</h3>
          <p>Нажмите на карту в месте, где вы обнаружили проблему, и заполните форму с описанием.</p>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <h3>Администрация получает заявку</h3>
          <p>Ваша заявка поступает в работу и отображается на карте для всех пользователей.</p>
        </div>
        <div class="step-card">
          <div class="step-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Проблема решается</h3>
          <p>Городские службы устраняют проблему и отмечают статус как "Исправлено".</p>
        </div>
      </div>
    </section>

    <!-- Problem Types Section -->
    <section class="section problem-types-section">
      <h2 class="section-title">Какие проблемы можно отмечать</h2>
      <div class="problem-types-grid">
        <div class="problem-type-card">
          <img src="/images/pothole.svg" alt="Яма на дороге">
          <h3>Ямы на дорогах</h3>
        </div>
        <div class="problem-type-card">
          <img src="/images/streetlight.svg" alt="Сломанный фонарь">
          <h3>Неисправное освещение</h3>
        </div>
        <div class="problem-type-card">
          <img src="/images/trash.svg" alt="Незаконная свалка">
          <h3>Незаконные свалки</h3>
        </div>
        <div class="problem-type-card">
          <img src="/images/bench.svg" alt="Сломанная скамейка">
          <h3>Поврежденные объекты</h3>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="section cta-section">
      <div class="cta-content">
        <h2>Присоединяйтесь к проекту сегодня!</h2>
        <p>Вместе мы сможем сделать наш город комфортнее и безопаснее для всех жителей.</p>
        <div class="cta-buttons">
          <NuxtLink to="/register" class="btn btn-primary">Зарегистрироваться</NuxtLink>
          <NuxtLink to="/map" class="btn btn-outline btn-primary">Перейти к карте</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 50px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #2196F3 0%, #1565C0 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
  border-radius: 0 0 50% 50% / 20px;
  margin-bottom: 50px;

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  .hero-actions {
    .btn {
      padding: 12px 30px;
      font-size: 1.1rem;
    }
  }
}

/* About Section */
.about-section {
  .about-content {
    display: flex;
    align-items: center;
    gap: 40px;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .about-text {
    flex: 1;
    
    p {
      margin-bottom: 15px;
      font-size: 1.1rem;
      line-height: 1.7;
    }
  }

  .about-image {
    flex: 1;
    text-align: center;
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  }
}

/* How It Works Section */
.how-it-works-section {
  background-color: #f9f9f9;
  padding: 60px 0;
  margin: 50px 0;
  border-radius: 8px;

  .steps-container {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    margin-top: 40px;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .step-card {
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    flex: 1;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    .step-icon {
      width: 70px;
      height: 70px;
      background-color: #e3f2fd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      
      i {
        font-size: 30px;
        color: #2196F3;
      }
    }
    
    h3 {
      margin-bottom: 15px;
      font-size: 1.3rem;
    }
    
    p {
      color: #666;
      line-height: 1.6;
    }
  }
}

/* Problem Types Section */
.problem-types-section {
  .problem-types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-top: 40px;
  }

  .problem-type-card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    img {
      width: 80px;
      height: 80px;
      margin-bottom: 15px;
    }
    
    h3 {
      font-size: 1.1rem;
      color: #333;
    }
  }
}

/* Call to Action Section */
.cta-section {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  padding: 60px 0;
  text-align: center;
  border-radius: 8px;
  margin-top: 50px;

  .cta-content {
    max-width: 700px;
    margin: 0 auto;
    padding: 0 20px;
  }

  h2 {
    font-size: 2.2rem;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    
    @media (max-width: 576px) {
      flex-direction: column;
      align-items: center;
    }
    
    .btn {
      padding: 12px 25px;
      font-size: 1.1rem;
      
      &.btn-outline {
        border: 2px solid white;
        color: white;
        
        &:hover {
          background-color: white;
          color: #4CAF50;
        }
      }
    }
  }
}
</style>
```

#### Пример кода admin/index.vue

```vue
<template>
  <div class="admin-page">
    <h1>Панель администратора</h1>
    
    <!-- Статистика -->
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
    
    <!-- Фильтры -->
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
              id="status-resolved" 
              :checked="statusFilter === 'all' || statusFilter === 'Исправлено'"
              @change="toggleStatus('Исправлено')"
            >
            <label for="status-resolved">
              <span class="status-badge status-resolved">Исправлено</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="filter-actions">
        <button @click="resetFilters" class="btn btn-outline">Сбросить фильтры</button>
        <button @click="applyFilters" class="btn btn-primary">Применить</button>
      </div>
    </div>
    
    <!-- Таблица проблем -->
    <div class="problems-table-container">
      <table class="problems-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Статус</th>
            <th>Дата создания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="problem in filteredProblems" :key="problem.id">
            <td>{{ problem.id.substring(0, 8) }}...</td>
            <td>{{ problem.title }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(problem.status)">
                {{ problem.status }}
              </span>
            </td>
            <td>{{ formatDate(problem.createdAt) }}</td>
            <td class="actions-cell">
              <button @click="viewProblem(problem)" class="action-btn view-btn">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editProblem(problem)" class="action-btn edit-btn">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteProblem(problem.id)" class="action-btn delete-btn">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Модальное окно деталей проблемы -->
    <div v-if="selectedProblem" class="modal">
      <div class="modal-content">
        <!-- Содержимое модального окна -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProblemsStore } from '@/stores/problems'

// Инициализация хранилища проблем
const problemsStore = useProblemsStore()

// Состояние компонента
const selectedProblem = ref(null)
const isEditing = ref(false)
const statusFilter = ref('all')

// Загрузка проблем при монтировании компонента
onMounted(async () => {
  await problemsStore.fetchProblems()
})

// Вычисляемые свойства для статистики
const totalProblems = computed(() => problemsStore.problems.length)
const newProblems = computed(() => problemsStore.problems.filter(p => p.status === 'Новая').length)
const inProgressProblems = computed(() => problemsStore.problems.filter(p => p.status === 'В работе').length)
const resolvedProblems = computed(() => problemsStore.problems.filter(p => p.status === 'Исправлено').length)

// Функция для переключения статуса фильтра
const toggleStatus = (status) => {
  if (statusFilter.value === status) {
    statusFilter.value = 'all'
  } else {
    statusFilter.value = status
  }
}

// Функция для сброса всех фильтров
const resetFilters = () => {
  statusFilter.value = 'all'
}

// Вычисляемое свойство для отфильтрованных проблем
const filteredProblems = computed(() => {
  let result = [...problemsStore.problems]
  
  // Фильтрация по статусу
  if (statusFilter.value !== 'all') {
    result = result.filter(p => p.status === statusFilter.value)
  }
  
  // Сортировка по дате (сначала новые)
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  return result
})
</script>
```

## Хранилища (Stores)

### problems.js

Хранилище для управления данными о проблемах:
- Загрузка списка проблем
- Добавление новых проблем
- Обновление статуса проблем
- Удаление проблем

#### Пример кода stores/problems.js

```javascript
import { defineStore } from 'pinia'
import { saveProblems, getProblems } from '@/utils/storage'

export const useProblemsStore = defineStore('problems', {
  state: () => ({
    problems: [],
    loading: false,
    selectedProblem: null
  }),
  
  getters: {
    getProblems: (state) => state.problems,
    getProblemById: (state) => (id) => state.problems.find(p => p.id === id),
    getProblemsByStatus: (state) => (status) => state.problems.filter(p => p.status === status)
  },
  
  actions: {
    async fetchProblems() {
      this.loading = true
      try {
        // Сначала пытаемся загрузить из localStorage
        const localProblems = getProblems()
        
        if (localProblems && localProblems.length > 0) {
          this.problems = localProblems
        } else {
          // Если в localStorage нет данных, загружаем из JSON-файла
          const data = await import('@/data/problems.json').then(m => m.default || m)
          this.problems = data
          // Сохраняем в localStorage для будущего использования
          saveProblems(this.problems)
        }
      } catch (error) {
        console.error('Error fetching problems:', error)
      } finally {
        this.loading = false
      }
    },
    
    async addProblem(problem) {
      try {
        const newProblem = {
          ...problem,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'Новая'
        }
        
        this.problems.push(newProblem)
        await this.saveProblemData()
        return newProblem
      } catch (error) {
        console.error('Error adding problem:', error)
        throw error
      }
    },
    
    async updateProblemStatus(id, status) {
      try {
        const problem = this.problems.find(p => p.id === id)
        if (problem) {
          problem.status = status
          problem.updatedAt = new Date().toISOString()
          await this.saveProblemData()
          return problem
        }
        return null
      } catch (error) {
        console.error('Error updating problem status:', error)
        throw error
      }
    },
    
    // Сохранение данных в localStorage
    async saveProblemData() {
      try {
        saveProblems(this.problems)
      } catch (error) {
        console.error('Error saving problems data:', error)
        throw error
      }
    }
  }
})
```

### auth.js

Хранилище для управления авторизацией:
- Регистрация пользователей
- Авторизация пользователей
- Проверка прав доступа
- Управление сессией пользователя

### comments.js

Хранилище для управления комментариями к проблемам:
- Загрузка комментариев для конкретной проблемы
- Добавление новых комментариев
- Удаление комментариев (для администраторов)

## Middleware

### auth.js

Проверяет, авторизован ли пользователь. Если нет, перенаправляет на страницу входа.

#### Пример кода middleware/auth.js

```javascript
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Инициализируем состояние авторизации из localStorage, если доступно
  if (!authStore.isAuthenticated) {
    authStore.initAuth()
  }
  
  // Если пользователь не авторизован и пытается получить доступ к защищенному маршруту
  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    return navigateTo('/login')
  }
})
```

### admin.js

Проверяет, имеет ли пользователь права администратора. Если нет, перенаправляет на главную страницу.

#### Пример кода middleware/admin.js

```javascript
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Инициализируем состояние авторизации из localStorage, если доступно
  if (!authStore.isAuthenticated) {
    authStore.initAuth()
  }
  
  // Если пользователь не администратор и пытается получить доступ к административным маршрутам
  if (!authStore.isAdmin()) {
    return navigateTo('/')
  }
})
```


#### Страница карты (map.vue)

Страница карты является центральным элементом приложения, предоставляющим пользователям возможность взаимодействия с городскими проблемами. Она включает следующие ключевые элементы:

- **Интерактивная карта** - реализована с использованием API Яндекс.Карт, отображает все зарегистрированные проблемы в виде маркеров разных цветов в зависимости от статуса (новая, в работе, решена).

- **Панель фильтров** - отображается в виде модального окна по нажатию на кнопку "Фильтры", что обеспечивает единообразный пользовательский интерфейс как на десктопе, так и на мобильных устройствах, а также освобождает больше места для отображения карты. Фильтры позволяют отбирать проблемы по типу, статусу и дате создания.

- **Добавление новых проблем** - пользователь может добавить новую проблему, кликнув на карту в нужном месте. После этого открывается модальное окно с формой для заполнения информации о проблеме: название, описание, тип проблемы, фотографии и контактная информация.

- **Просмотр деталей проблемы** - при клике на маркер на карте открывается всплывающее окно с краткой информацией о проблеме и кнопкой для перехода на страницу с полными деталями.

- **Адаптивный дизайн** - страница карты полностью адаптивна и одинаково хорошо работает как на десктопных, так и на мобильных устройствах.

#### Страница проблемы (problem/[id].vue)

Детальная страница отдельной проблемы предоставляет полную информацию о конкретной городской проблеме и включает следующие элементы:

- **Информационный блок** - содержит полное описание проблемы, включая название, тип, адрес, дату создания и текущий статус. Важно отметить, что номер телефона заявителя доступен только администраторам для защиты персональных данных.

- **Галерея изображений** - позволяет просматривать фотографии проблемы, загруженные пользователем при создании заявки. Фотографии можно увеличивать для детального просмотра.

- **Карта с местоположением** - небольшая карта, показывающая точное местоположение проблемы на карте города.

- **Система комментариев** - позволяет пользователям обсуждать проблему и оставлять отзывы о ходе её решения. Комментарии сохраняются в localStorage. Если пользователь не авторизован, то его комментарии отображаются как от "Анонимного пользователя", если авторизован - отображается его имя.

- **Модерация комментариев** - администраторы имеют возможность удалять неприемлемые комментарии, что обеспечивает культуру общения на платформе.

- **История изменений** - отображает хронологию изменений статуса проблемы, что позволяет пользователям отслеживать прогресс в решении проблемы.

#### Админ-панель (admin/index.vue)

Админ-панель представляет собой защищенный интерфейс для администраторов системы, предоставляющий полный контроль над всеми аспектами приложения. Доступ к этой странице защищен мидлваром admin.js, который проверяет наличие административных прав у пользователя. Панель включает следующие ключевые элементы:

- **Дашборд статистики** - отображает карточки с общим количеством проблем и их распределением по статусам (новые, в работе, решенные). Это позволяет администраторам быстро оценить общую ситуацию и определить приоритеты.

- **Расширенная панель фильтров** - предоставляет гибкие инструменты для фильтрации проблем по различным параметрам: статусу, типу проблемы, дате создания и обновления. Фильтры можно комбинировать для более точного поиска.

- **Таблица управления проблемами** - отображает список всех проблем с ключевой информацией (ID, название, статус, дата создания) и кнопками для быстрых действий:
  - **Просмотр** - открывает модальное окно с полной информацией о проблеме, включая контактные данные заявителя
  - **Редактирование** - позволяет изменять статус и другие параметры проблемы
  - **Удаление** - позволяет удалить проблему из системы (с подтверждением)

- **Модальное окно деталей проблемы** - предоставляет интерфейс для просмотра и редактирования всех аспектов проблемы. При редактировании администратор может:
  - Изменить статус проблемы (Новая, В работе, Исправлено)
  - Добавить комментарий от имени администрации
  - Добавить дополнительную информацию о ходе решения проблемы

- **Управление комментариями** - администраторы имеют доступ к всем комментариям пользователей и могут модерировать их, удаляя неприемлемый контент.

- **Экспорт данных** - позволяет экспортировать данные о проблемах в различных форматах (CSV, Excel) для дальнейшего анализа или отчетности.


### Описание компонента admin/index.vue

Компонент admin/index.vue представляет собой административную панель для управления проблемами в приложении. Компонент реализует следующие ключевые функции:

1. **Статистический обзор**:
   - Отображает карточки с количеством проблем по категориям
   - Использует вычисляемые свойства (computed) для подсчета статистики

2. **Фильтрация проблем**:
   - Позволяет фильтровать по статусу (Новая, В работе, Исправлено)
   - Реализует функции toggleStatus и resetFilters для управления фильтрами

3. **Таблица проблем**:
   - Отображает отфильтрованные проблемы с основной информацией
   - Использует форматирование даты и стилизацию статусов
   - Предоставляет кнопки для просмотра, редактирования и удаления проблем

4. **Модальное окно**:
   - Открывается при просмотре или редактировании проблемы
   - Позволяет изменять статус проблемы и добавлять комментарии

5. **Взаимодействие с хранилищем**:
   - Использует useProblemsStore для получения и управления данными
   - Загружает проблемы при монтировании компонента

6. **Безопасность**:
   - Доступ к странице защищен мидлваром admin.js
   - Контактная информация заявителей доступна только администраторам

Данный компонент является ключевым элементом административного интерфейса приложения, предоставляя полный контроль над всеми аспектами системы и обеспечивая эффективное управление городскими проблемами.

## Установка и запуск

### Установка зависимостей

```bash
# npm
npm install

# yarn
yarn install
```

### Настройка переменных окружения

Создайте файл `.env` в корне проекта и укажите следующие переменные:

```
YANDEX_MAPS_API_KEY=ваш_ключ_api_яндекс_карт
API_BASE_URL=http://localhost:3000
```

### Запуск сервера разработки

```bash
# npm
npm run dev

# yarn
yarn dev
```

Приложение будет доступно по адресу `http://localhost:3000`

### Сборка для продакшн

```bash
# npm
npm run build
npm run preview

# yarn
yarn build
yarn preview
```

## Авторизация в приложении

### Тестовые учетные данные

Для тестирования приложения можно использовать следующие учетные данные:

**Обычный пользователь:**
- Логин: user@example.com
- Пароль: password123

**Администратор:**
- Логин: admin@example.com
- Пароль: admin123

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

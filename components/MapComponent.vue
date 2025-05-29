<template>
  <div class="map-container">
    <div id="map" class="map"></div>
  </div>
    
  <!-- Problem Form Modal - вынесен за пределы контейнера карты -->
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
            <div class="form-group">
              <label for="title">Название проблемы <span class="required">*</span></label>
              <input 
                id="title" 
                v-model="formData.title" 
                type="text" 
                required 
                placeholder="Кратко опишите проблему"
              >
            </div>
            
            <div class="form-group">
              <label for="description">Подробное описание <span class="required">*</span></label>
              <textarea 
                id="description" 
                v-model="formData.description" 
                required 
                placeholder="Опишите проблему подробнее"
              ></textarea>
            </div>
            
            <!-- Status field for admins -->
            <div v-if="authStore.isAdmin() && formData.id" class="form-group">
              <label for="status">Статус</label>
              <select id="status" v-model="formData.status">
                <option value="Новая">Новая</option>
                <option value="В работе">В работе</option>
                <option value="Исправлено">Исправлено</option>
              </select>
            </div>
            
            <!-- Optional fields for non-authenticated users -->
            <template v-if="!authStore.isAuthenticated">
              <div class="optional-fields-info">
                <p>Укажите ваши контактные данные (необязательно):</p>
              </div>
              
              <div class="form-group">
                <label for="userName">Ваше имя</label>
                <input 
                  id="userName" 
                  v-model="formData.userName" 
                  type="text" 
                  placeholder="Укажите ваше имя"
                >
              </div>
              
              <div class="form-group">
                <label for="userPhone">Телефон</label>
                <input 
                  id="userPhone" 
                  v-model="formData.userPhone" 
                  type="tel" 
                  placeholder="+7 (___) ___-__-__"
                >
              </div>
            </template>
            
            <div class="form-group">
              <label for="image">Фото проблемы</label>
              <div class="file-upload-container">
                <label for="image" class="file-upload-label">
                  <i class="fas fa-camera"></i>
                  <span>Выберите фото</span>
                </label>
                <input 
                  id="image" 
                  type="file" 
                  @change="handleFileUpload" 
                  accept="image/*"
                  class="file-upload-input"
                >
              </div>
              <small class="file-info">Максимальный размер файла: 5MB</small>
            </div>
            
            <div v-if="formData.imageUrl" class="image-preview">
              <img :src="formData.imageUrl" alt="Preview">
              <button type="button" @click="clearImage" class="clear-image-btn">
                <i class="fas fa-times"></i> Удалить фото
              </button>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeForm" class="cancel-btn">
                <i class="fas fa-times"></i> Отмена
              </button>
              <button type="submit" class="save-btn">
                <i class="fas fa-save"></i> Сохранить
              </button>
              <button 
                v-if="formData.id && authStore.isAdmin()" 
                type="button" 
                @click="deleteProblem" 
                class="delete-btn"
              >
                <i class="fas fa-trash"></i> Удалить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
    
  <!-- Problem Details Modal -->
  <Teleport to="body">
    <div v-if="showProblemModal" @click="closeProblemModal" class="problem-details-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Детали проблемы</h3>
          <button type="button" @click="closeProblemModal" class="close-modal-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="problem-info">
            <h4>{{ selectedProblem.title }}</h4>
            <p><strong>Статус:</strong> <span :class="`status-badge status-${selectedProblem.status.toLowerCase().replace(' ', '-')}`">{{ selectedProblem.status }}</span></p>
            <p><strong>Координаты:</strong> {{ selectedProblem.coords[0].toFixed(6) }}, {{ selectedProblem.coords[1].toFixed(6) }}</p>
            <p><strong>Описание:</strong> {{ selectedProblem.description }}</p>
            <p><strong>Дата создания:</strong> {{ new Date(selectedProblem.createdAt).toLocaleString() }}</p>
            <p v-if="selectedProblem.userName"><strong>Имя пользователя:</strong> {{ selectedProblem.userName }}</p>
            <p v-if="selectedProblem.userPhone"><strong>Телефон пользователя:</strong> {{ selectedProblem.userPhone }}</p>
            <div v-if="selectedProblem.imageUrl" class="problem-image-container">
              <img :src="selectedProblem.imageUrl" alt="Фото проблемы">
            </div>
            
            <div class="problem-actions" v-if="authStore.isAdmin()">
              <button @click="editProblem(selectedProblem)" class="edit-btn">
                <i class="fas fa-edit"></i> Редактировать
              </button>
              <button @click="deleteProblemFromModal(selectedProblem.id)" class="delete-btn">
                <i class="fas fa-trash"></i> Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed, defineExpose } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProblemsStore } from '@/stores/problems'

// Props для компонента
const props = defineProps({
  // Начальный центр карты
  initialCenter: {
    type: Array,
    default: () => [60.118891, 64.790629]
  },
  // Начальный зум карты
  initialZoom: {
    type: Number,
    default: 14
  },
  // Режим только для чтения (без возможности добавления/редактирования)
  readOnly: {
    type: Boolean,
    default: false
  },
  // Одна проблема для отображения (для страницы подробной информации)
  singleProblem: {
    type: Object,
    default: null
  }
})

// Состояние модального окна с деталями проблемы
const showProblemModal = ref(false)
const selectedProblem = ref(null)

const config = useRuntimeConfig()
const authStore = useAuthStore()
const problemsStore = useProblemsStore()

const showForm = ref(false)
const formData = ref({
  id: null,
  coords: [],
  title: '',
  description: '',
  status: 'Новая',
  userName: '',
  userPhone: '',
  imageUrl: ''
})

let map = null
let clusterer = null

// Generate unique ID for new problems
const generateId = () => {
  return Date.now().toString()
}

// Получаем доступ к плагину Яндекс Карт
const { $initYandexMap } = useNuxtApp()

// Функция для перехода на страницу подробной информации о проблеме
const navigateToProblemDetails = (problemId) => {
  navigateTo(`/problem/${problemId}`)
}

// Инициализация кластеризатора
const initClusterer = () => {
  if (!map || !window.ymaps) return
  
  // Создаем кластеризатор
  clusterer = new ymaps.Clusterer({
    preset: 'islands#blueClusterIcons',
    groupByCoordinates: false,
    clusterDisableClickZoom: false,
    clusterHideIconOnBalloonOpen: false,
    geoObjectHideIconOnBalloonOpen: false
  })
  
  map.geoObjects.add(clusterer)
}

// Initialize map when component is mounted
onMounted(async () => {
  if (typeof window !== 'undefined') {
    // Инициализируем карту с помощью плагина
    try {
      // Создаем карту с помощью нашего плагина
      map = await $initYandexMap('map', {
        center: props.initialCenter, // Используем начальный центр из props
        zoom: props.initialZoom, // Используем начальный зум из props
        controls: ['zoomControl', 'typeSelector']
      })
      
      // Если карта в режиме только для чтения и есть одна проблема для отображения
      if (props.readOnly && props.singleProblem) {
        // Добавляем одну метку на карту
        addProblemMarker(props.singleProblem)
      } else {
        // Инициализируем кластеризатор после создания карты
        initClusterer()
        
        // Fetch problems data
        await problemsStore.fetchProblems()
        
        // Добавляем проблемы на карту
        addProblemsToMap()
        
        // Добавляем обработчик события изменения полноэкранного режима
        map.container.events.add(['fullscreenenter', 'fullscreenexit'], () => {
          // Небольшая задержка, чтобы DOM успел обновиться
          setTimeout(() => {
            // Перерисовываем метки после изменения полноэкранного режима
            updateMarkers(problemsStore.problems)
          }, 100)
        })
        
        // Добавляем обработчик клика по карте для добавления новой проблемы
        if (!props.readOnly) {
          map.events.add('click', function(e) {
            // Получаем координаты клика
            const coords = e.get('coords')
            
            // Открываем форму добавления проблемы
            // Используем функцию из компонента
            formData.value.coords = coords
            showForm.value = true
          })
        }
      }
    } catch (error) {
      console.error('Ошибка при инициализации карты:', error)
    }
  }
})

// Дублирующий код удален, т.к. эта функциональность уже реализована внутри onMounted

// Add all problems from store to map
const addProblemsToMap = () => {
  if (!map || !clusterer) return
  
  clusterer.removeAll()
  
  problemsStore.problems.forEach(problem => {
    addProblemMarker(problem)
  })
}

// Обновление меток на карте в соответствии с фильтрами
// Этот метод будет вызываться из родительского компонента при изменении фильтров
const updateMarkers = (filteredProblems) => {
  if (!map || !clusterer) return
  
  // Удаляем все текущие метки
  clusterer.removeAll()
  
  // Добавляем только отфильтрованные проблемы
  filteredProblems.forEach(problem => {
    addProblemMarker(problem)
  })
}

  // Add a single problem marker to the map
const addProblemMarker = (problem) => {
  if (!map || !window.ymaps) return
  
  // Define marker colors based on status
  const markerColors = {
    'Новая': 'red',
    'В работе': 'orange',
    'Исправлено': 'green'
  }
  
  const color = markerColors[problem.status] || 'blue'
  
  // Создаем простой HTML-макет для метки с изображением
  let placemarkOptions
  
  if (problem.imageUrl) {
    // Создаем макет для иконки с изображением - похожий на Umap
    const customPlacemark = ymaps.templateLayoutFactory.createClass(`
      <div class="custom-placemark custom-placemark--${problem.status.toLowerCase().replace(' ', '-')}">
        <div class="custom-placemark__title">${problem.title}</div>
        <div class="custom-placemark__status">${problem.status}</div>
        <div class="custom-placemark__image" style="background-image: url('${problem.imageUrl}')"></div>
      </div>
    `);
    
    placemarkOptions = {
      iconLayout: customPlacemark,
      iconShape: {
        type: 'Rectangle',
        coordinates: [[-20, -40], [20, 0]]
      },
      // Важные параметры для корректной работы в полноэкранном режиме
      hideIconOnBalloonOpen: false,
      zIndexHover: 9999
    }
  } else {
    // Для меток без изображения используем стандартные иконки
    placemarkOptions = {
      preset: `islands#${color}Icon`,
      hideIconOnBalloonOpen: false,
      zIndexHover: 9999
    }
  }
  
  // Create placemark
  const placemark = new ymaps.Placemark(
    problem.coords,
    {
      // Добавляем данные проблемы в свойства метки
      problemData: problem,
      hintContent: problem.title
    },
    placemarkOptions
  )
  
  // Добавляем обработчик клика на метку
  placemark.events.add('click', function(e) {
    try {
      // Предотвращаем всплытие события
      e.stopPropagation();
      
      // Получаем данные проблемы из свойств метки
      const problemData = placemark.properties.get('problemData')
      
      // Если карта находится в режиме только для чтения (на странице подробной информации), то не делаем ничего
      if (props.readOnly) {
        return;
      }
      
      // Переходим на страницу подробной информации о проблеме
      navigateToProblemDetails(problemData.id)
    } catch (error) {
      console.error('Ошибка при клике на метку:', error)
    }
  })
  
  // Добавляем обработчики для отображения заголовка и статуса при наведении
  if (problem.imageUrl) {
    placemark.events.add('mouseenter', function() {
      try {
        const overlay = placemark.getOverlaySync();
        if (overlay) {
          const element = overlay.getLayoutSync().getElement();
          const title = element.querySelector('.custom-placemark__title');
          const status = element.querySelector('.custom-placemark__status');
          
          if (title) title.style.opacity = '1';
          if (status) status.style.opacity = '1';
        }
      } catch (error) {
        console.error('Ошибка при наведении на метку:', error);
      }
    });
    
    placemark.events.add('mouseleave', function() {
      try {
        const overlay = placemark.getOverlaySync();
        if (overlay) {
          const element = overlay.getLayoutSync().getElement();
          const title = element.querySelector('.custom-placemark__title');
          const status = element.querySelector('.custom-placemark__status');
          
          if (title) title.style.opacity = '0';
          if (status) status.style.opacity = '0';
        }
      } catch (error) {
        console.error('Ошибка при уходе курсора с метки:', error);
      }
    });
  }
  
  // Если пользователь администратор, добавляем кнопку редактирования в модальное окно
  if (authStore.isAdmin()) {
    problemsStore.selectProblem(problem)
      
      // Add button to balloon after it's opened
      setTimeout(() => {
        const balloonContent = document.querySelector('.ymaps-2-1-79-balloon__content')
        if (balloonContent) {
          balloonContent.appendChild(editButton)
        }
      }, 100)
    }
  
  // Добавляем метку на карту
  if (clusterer && !props.readOnly) {
    // В обычном режиме добавляем в кластеризатор
    clusterer.add(placemark)
  } else {
    // В режиме "только для чтения" добавляем напрямую на карту
    map.geoObjects.add(placemark)
  }
}

// Save problem data
const saveProblem = async () => {
  try {
    if (formData.value.id) {
      // Update existing problem
      await problemsStore.updateProblemStatus(formData.value.id, formData.value.status)
    } else {
      // Add new problem
      const result = await problemsStore.addProblem({
        ...formData.value,
        userId: authStore.user ? authStore.user.id : null
      })
      
      if (result.success) {
        formData.value.id = result.id
      }
    }
    
    // Refresh map markers
    await problemsStore.fetchProblems()
    addProblemsToMap()
    
    // Close form
    closeForm()
  } catch (error) {
    console.error('Error saving problem:', error)
    alert('Произошла ошибка при сохранении проблемы')
  }
}

// Delete problem (admin only)
const deleteProblem = async () => {
  if (!authStore.isAdmin()) return
  
  if (confirm('Вы уверены, что хотите удалить эту проблему?')) {
    try {
      // In a real app, this would call an API
      const index = problemsStore.problems.findIndex(p => p.id === formData.value.id)
      if (index !== -1) {
        problemsStore.problems.splice(index, 1)
        await problemsStore.saveProblemData()
        
        // Refresh map markers
        addProblemsToMap()
        
        // Close form
        closeForm()
      }
    } catch (error) {
      console.error('Error deleting problem:', error)
      alert('Произошла ошибка при удалении проблемы')
    }
  }
}

// Handle file upload for problem images
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Check file type
  if (!file.type.match('image.*')) {
    alert('Пожалуйста, выберите изображение')
    return
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Размер файла не должен превышать 5MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    // Resize image if needed
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Max dimensions
      const MAX_WIDTH = 800
      const MAX_HEIGHT = 600
      
      let width = img.width
      let height = img.height
      
      // Resize if larger than max dimensions
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width > height) {
          height = Math.round(height * (MAX_WIDTH / width))
          width = MAX_WIDTH
        } else {
          width = Math.round(width * (MAX_HEIGHT / height))
          height = MAX_HEIGHT
        }
      }
      
      // Set canvas dimensions and draw resized image
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to data URL with reduced quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      
      // Update form data
      formData.value.imageUrl = dataUrl
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

// Clear uploaded image
const clearImage = () => {
  formData.value.imageUrl = ''
  // Reset file input
  const fileInput = document.getElementById('image')
  if (fileInput) fileInput.value = ''
}

// Close problem form
const closeForm = () => {
  showForm.value = false
  formData.value = {
    id: null,
    coords: [],
    title: '',
    description: '',
    status: 'Новая',
    userName: '',
    userPhone: '',
    imageUrl: ''
  }
}

// Показать детали проблемы в модальном окне
const showProblemDetails = (problem) => {
  selectedProblem.value = problem
  showProblemModal.value = true
}

// Закрыть модальное окно с деталями проблемы
const closeProblemModal = () => {
  showProblemModal.value = false
  selectedProblem.value = null
}

// Редактировать проблему из модального окна
const editProblem = (problem) => {
  // Закрываем модальное окно с деталями
  closeProblemModal()
  
  // Заполняем форму редактирования
  formData.value = { ...problem }
  
  // Открываем модальное окно редактирования
  showForm.value = true
}

// Удалить проблему из модального окна
const deleteProblemFromModal = async (id) => {
  if (confirm('Вы уверены, что хотите удалить эту проблему?')) {
    await problemsStore.deleteProblem(id)
    closeProblemModal()
    
    // Обновляем метки на карте
    if (clusterer) {
      clusterer.removeAll()
      addProblemsToMap()
    }
  }
}

// Экспортируем методы для использования в родительском компоненте
defineExpose({
  updateMarkers
})
</script>

<style lang="scss" scoped>
/* Глобальные стили для полноэкранного режима */
:global(.ymaps-2-1-79-map-copyrights-promo) {
  z-index: 1 !important;
}

:global(.ymaps-2-1-79-float-button) {
  z-index: 9000 !important;
}

:global(.ymaps-2-1-79-events-pane) {
  pointer-events: auto !important;
}

:global(.ymaps-2-1-79-balloon) {
  z-index: 9500 !important;
}

:global(.ymaps-2-1-79-controls__control) {
  z-index: 9000 !important;
}

:global(.ymaps-2-1-79-map) {
  z-index: 1 !important;
}

:global(.ymaps-2-1-79-map.ymaps-2-1-79-i-ua_js_yes .ymaps-2-1-79-map-copyrights-promo) {
  z-index: 1 !important;
}

/* Стили для полноэкранного режима */
:global(.ymaps-2-1-79-placemark) {
  z-index: 9999 !important;
}

:global(.ymaps-2-1-79-placemark-overlay) {
  z-index: 9999 !important;
}

:global(.ymaps-2-1-79-islets_icon-with-caption) {
  z-index: 9999 !important;
}

/* Стили для панели в полноэкранном режиме */
:global(.ymaps-2-1-79-panel-pane) {
  z-index: 9990 !important;
}

:global(.ymaps-2-1-79-gototech) {
  z-index: 1 !important;
}

.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.problem-form-modal, .problem-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999; /* Очень высокий z-index как в Umap */
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    
    h3 {
      margin: 0;
      color: var(--primary-color);
      font-size: 1.5rem;
    }
    
    .close-modal-btn {
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
  
  .modal-body {
    padding: 20px;
  }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.coordinates-info {
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #666;
  
  i {
    color: var(--primary-color);
    font-size: 1.2rem;
  }
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
    
    .required {
      color: var(--danger-color);
      margin-left: 3px;
    }
  }
  
  input, textarea, select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }
  }
  
  textarea {
    min-height: 120px;
    resize: vertical;
  }
  
  select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 8.825L1.175 4 2.238 2.938 6 6.7 9.763 2.938 10.825 4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 30px;
  }
}

.optional-fields-info {
  margin: 20px 0 10px;
  padding: 10px 15px;
  background-color: #e3f2fd;
  border-radius: 6px;
  border-left: 4px solid var(--primary-color);
  
  p {
    margin: 0;
    color: #0d47a1;
    font-size: 0.9rem;
  }
}

.file-upload-container {
  margin-top: 5px;
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #f5f5f5;
  color: #333;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px dashed #ccc;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  i {
    color: var(--primary-color);
    font-size: 1.2rem;
  }
}

.file-upload-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.file-info {
  display: block;
  margin-top: 5px;
  color: #757575;
  font-size: 0.8rem;
}

.problem-info {
  h4 {
    color: var(--primary-color);
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.4rem;
  }
  
  p {
    margin: 8px 0;
    line-height: 1.5;
    
    strong {
      font-weight: 600;
      color: #333;
    }
  }
  
  .problem-image-container {
    margin-top: 20px;
    margin-bottom: 20px;
    
    img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
    
    &.status-новая {
      background-color: #ffebee;
      color: #f44336;
    }
    
    &.status-в-работе {
      background-color: #fff8e1;
      color: #ff9800;
    }
    
    &.status-исправлено {
      background-color: #e8f5e9;
      color: #4caf50;
    }
  }
  
  .problem-actions {
    margin-top: 25px;
    display: flex;
    gap: 10px;
    
    button {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s, transform 0.1s;
      
      i {
        font-size: 16px;
      }
      
      &:hover {
        transform: translateY(-2px);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
    
    .edit-btn {
      background-color: var(--primary-color);
      color: white;
      
      &:hover {
        background-color: darken(#2196f3, 10%);
      }
    }
    
    .delete-btn {
      background-color: var(--danger-color);
      color: white;
      
      &:hover {
        background-color: darken(#f44336, 10%);
      }
    }
  }
}

.image-preview {
  margin: 15px 0;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #eee;
  
  img {
    max-width: 100%;
    max-height: 250px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: block;
    margin: 0 auto 10px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
  
  button {
    padding: 10px 18px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    
    i {
      font-size: 0.9rem;
    }
  }
  
  .cancel-btn {
    background-color: #f5f5f5;
    color: #666;
    
    &:hover {
      background-color: #e0e0e0;
    }
  }
  
  .save-btn {
    background-color: var(--secondary-color);
    color: white;
    
    &:hover {
      background-color: darken(#4CAF50, 5%);
      transform: translateY(-1px);
    }
  }
  
  .delete-btn {
    background-color: var(--danger-color);
    color: white;
    
    &:hover {
      background-color: darken(#f44336, 5%);
    }
  }
}

.clear-image-btn {
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
    color: var(--danger-color);
  }
  
  i {
    font-size: 0.8rem;
  }
}

:global(.edit-problem-btn) {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 14px;
  display: block;
  width: 100%;
}

/* Custom Placemark Styles */
:deep(.custom-placemark) {
  position: relative;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -100%);
  z-index: 9999 !important; /* Очень высокий z-index для отображения в полноэкранном режиме */
  pointer-events: auto !important; /* Важно для работы в полноэкранном режиме */
  cursor: pointer;
}

:deep(.custom-placemark__image) {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
  position: relative;
  z-index: 9999 !important; /* Очень высокий z-index для отображения в полноэкранном режиме */
}

:deep(.custom-placemark__title) {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  color: #333;
  font-size: 11px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 10000 !important; /* Еще более высокий z-index для заголовка */
  pointer-events: none; /* Чтобы не мешало клику на метку */
}

:deep(.custom-placemark__status) {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background-color: white;
  padding: 2px 5px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10000 !important; /* Еще более высокий z-index для статуса */
  pointer-events: none; /* Чтобы не мешало клику на метку */
}

:deep(.custom-placemark--новая .custom-placemark__status) {
  background-color: #ffebee;
  color: #f44336;
}

:deep(.custom-placemark--в-работе .custom-placemark__status) {
  background-color: #fff8e1;
  color: #ff9800;
}

:deep(.custom-placemark--исправлено .custom-placemark__status) {
  background-color: #e8f5e9;
  color: #4caf50;
}

:deep(.custom-placemark:hover .custom-placemark__image) {
  transform: scale(1.1);
}

/* Стили для баллунов */
:global(.balloon-content) {
  padding: 15px;
  max-width: 300px;
}

:global(.balloon-title) {
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color);
}

:global(.balloon-status) {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 10px;
}

:global(.status-новая) {
  background-color: #ffebee;
  color: #f44336;
}

:global(.status-в-работе) {
  background-color: #fff8e1;
  color: #ff9800;
}

:global(.status-исправлено) {
  background-color: #e8f5e9;
  color: #4caf50;
}

:global(.balloon-image) {
  margin: 10px 0;
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 150px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

:global(.balloon-description) {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 15px;
  color: #333;
}

:global(.balloon-details-btn) {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  
  &:hover {
    background-color: darken(#2196F3, 10%);
  }
}

:deep(.custom-placemark:hover .custom-placemark__status) {
  opacity: 1;
  transform: translateY(0);
}

:deep(.custom-placemark:hover .custom-placemark__title) {
  opacity: 1;
}

:deep(.custom-placemark:hover .custom-placemark__image) {
  transform: scale(1.1);
}

/* Status-specific styles */
:deep(.custom-placemark--новая .custom-placemark__image) {
  border-color: #f44336;
  color: #fff;
}

:deep(.custom-placemark--новая .custom-placemark__status) {
  background-color: #f44336;
  color: #fff;
}

:deep(.custom-placemark--в-работе .custom-placemark__image) {
  border-color: #ff9800;
  color: #fff;
}

:deep(.custom-placemark--в-работе .custom-placemark__status) {
  background-color: #ff9800;
  color: #fff;
}

:deep(.custom-placemark--исправлено .custom-placemark__image) {
  border-color: #4CAF50;
  color: #fff;
}

:deep(.custom-placemark--исправлено .custom-placemark__status) {
  background-color: #4CAF50;
  color: #fff;
}
</style>

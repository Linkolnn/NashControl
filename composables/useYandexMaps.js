import { ref, onMounted } from 'vue'

export function useYandexMaps() {
  const isYmapsLoaded = ref(false)
  const map = ref(null)
  const clusterer = ref(null)
  
  // Load Yandex Maps API
  const loadYandexMaps = async () => {
    if (typeof window === 'undefined') return
    
    const config = useRuntimeConfig()
    const apiKey = config.public.yandexMapsApiKey
    
    if (!apiKey) {
      console.error('Yandex Maps API key is not defined in .env file')
      return
    }
    
    if (window.ymaps) {
      isYmapsLoaded.value = true
      return
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
      script.async = true
      
      script.onload = () => {
        isYmapsLoaded.value = true
        resolve()
      }
      
      script.onerror = (error) => {
        console.error('Failed to load Yandex Maps API:', error)
        reject(error)
      }
      
      document.head.appendChild(script)
    })
  }
  
  // Initialize map
  const initMap = (containerId, options = {}) => {
    if (!window.ymaps || !isYmapsLoaded.value) {
      console.error('Yandex Maps API is not loaded yet')
      return
    }
    
    return new Promise((resolve) => {
      ymaps.ready(() => {
        // Default options
        const defaultOptions = {
          center: [55.753215, 37.622504], // Moscow by default
          zoom: 12,
          controls: ['zoomControl', 'searchControl', 'typeSelector', 'fullscreenControl']
        }
        
        // Create map
        map.value = new ymaps.Map(containerId, { ...defaultOptions, ...options })
        
        // Create clusterer
        clusterer.value = new ymaps.Clusterer({
          preset: 'islands#blueClusterIcons',
          groupByCoordinates: false,
          clusterDisableClickZoom: false
        })
        
        map.value.geoObjects.add(clusterer.value)
        
        resolve({ map: map.value, clusterer: clusterer.value })
      })
    })
  }
  
  // Create placemark
  const createPlacemark = (coords, options = {}, properties = {}) => {
    if (!window.ymaps || !isYmapsLoaded.value) {
      console.error('Yandex Maps API is not loaded yet')
      return null
    }
    
    // Default options
    const defaultOptions = {
      preset: 'islands#blueIcon'
    }
    
    return new ymaps.Placemark(coords, properties, { ...defaultOptions, ...options })
  }
  
  // Add placemark to map
  const addPlacemark = (placemark) => {
    if (!map.value || !clusterer.value) {
      console.error('Map or clusterer is not initialized')
      return
    }
    
    clusterer.value.add(placemark)
  }
  
  // Remove all placemarks
  const clearPlacemarks = () => {
    if (!clusterer.value) {
      console.error('Clusterer is not initialized')
      return
    }
    
    clusterer.value.removeAll()
  }
  
  // Get map instance
  const getMap = () => map.value
  
  // Get clusterer instance
  const getClusterer = () => clusterer.value
  
  // Set map center
  const setCenter = (coords, zoom) => {
    if (!map.value) {
      console.error('Map is not initialized')
      return
    }
    
    map.value.setCenter(coords, zoom, { duration: 300 })
  }
  
  // Generate color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Новая':
        return 'red'
      case 'В работе':
        return 'orange'
      case 'Исправлено':
        return 'green'
      default:
        return 'blue'
    }
  }
  
  return {
    isYmapsLoaded,
    loadYandexMaps,
    initMap,
    createPlacemark,
    addPlacemark,
    clearPlacemarks,
    getMap,
    getClusterer,
    setCenter,
    getStatusColor
  }
}

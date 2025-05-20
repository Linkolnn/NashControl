import { ref } from 'vue'
import { getImages, saveImages } from '@/utils/storage'

export function useImageStorage() {
  const images = ref({})
  
  // Initialize from localStorage if available
  const init = () => {
    if (typeof window === 'undefined') return
    
    try {
      const storedImages = getImages()
      if (storedImages) {
        images.value = storedImages
      }
    } catch (error) {
      console.error('Error loading images from localStorage:', error)
    }
  }
  
  // Save image data
  const saveImage = (id, imageData) => {
    if (!id) return false
    
    images.value[id] = imageData
    
    // Save to localStorage
    try {
      return saveImages(images.value)
    } catch (error) {
      console.error('Error saving images to localStorage:', error)
      return false
    }
  }
  
  // Get image data by id
  const getImage = (id) => {
    if (!id) return null
    return images.value[id] || null
  }
  
  // Get all images
  const getAllImages = () => {
    return images.value
  }
  
  // Delete image data
  const deleteImage = (id) => {
    if (!id || !images.value[id]) return false
    
    delete images.value[id]
    
    // Update localStorage
    try {
      return saveImages(images.value)
    } catch (error) {
      console.error('Error updating localStorage after image deletion:', error)
      return false
    }
  }
  
  // Convert file to base64 with compression
  const fileToBase64 = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'))
        return
      }
      
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Calculate new dimensions
          let width = img.width
          let height = img.height
          
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round(height * (maxWidth / width))
              width = maxWidth
            } else {
              width = Math.round(width * (maxHeight / height))
              height = maxHeight
            }
          }
          
          // Set canvas dimensions and draw
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to data URL with compression
          const dataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(dataUrl)
        }
        
        img.onerror = () => {
          reject(new Error('Error loading image'))
        }
        
        img.src = e.target.result
      }
      
      reader.onerror = (error) => {
        reject(error)
      }
      
      reader.readAsDataURL(file)
    })
  }
  
  // Initialize on creation
  init()
  
  return {
    saveImage,
    getImage,
    getAllImages,
    deleteImage,
    fileToBase64
  }
}

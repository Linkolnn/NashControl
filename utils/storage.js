/**
 * Утилиты для работы с localStorage
 */

// Ключи для хранения данных
const STORAGE_KEYS = {
  PROBLEMS: 'nashcontrol_problems',
  IMAGES: 'nashcontrol_images'
};

/**
 * Сохранить данные в localStorage
 * @param {string} key - Ключ для хранения
 * @param {any} data - Данные для сохранения
 */
export const saveToLocalStorage = (key, data) => {
  if (typeof window === 'undefined') return;
  
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Ошибка при сохранении в localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Получить данные из localStorage
 * @param {string} key - Ключ для получения данных
 * @param {any} defaultValue - Значение по умолчанию, если данные не найдены
 * @returns {any} - Полученные данные или значение по умолчанию
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) return defaultValue;
    return JSON.parse(serializedData);
  } catch (error) {
    console.error(`Ошибка при получении из localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Удалить данные из localStorage
 * @param {string} key - Ключ для удаления
 */
export const removeFromLocalStorage = (key) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении из localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Сохранить проблемы в localStorage
 * @param {Array} problems - Массив проблем для сохранения
 */
export const saveProblems = (problems) => {
  return saveToLocalStorage(STORAGE_KEYS.PROBLEMS, problems);
};

/**
 * Получить проблемы из localStorage
 * @returns {Array} - Массив проблем или пустой массив, если данные не найдены
 */
export const getProblems = () => {
  return getFromLocalStorage(STORAGE_KEYS.PROBLEMS, []);
};

/**
 * Сохранить изображения в localStorage
 * @param {Object} images - Объект с изображениями
 */
export const saveImages = (images) => {
  return saveToLocalStorage(STORAGE_KEYS.IMAGES, images);
};

/**
 * Получить изображения из localStorage
 * @returns {Object} - Объект с изображениями или пустой объект, если данные не найдены
 */
export const getImages = () => {
  return getFromLocalStorage(STORAGE_KEYS.IMAGES, {});
};

export default {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  saveProblems,
  getProblems,
  saveImages,
  getImages,
  STORAGE_KEYS
};

/**
 * Утилиты для работы с зашифрованными cookie
 */

// Секретный ключ для шифрования (в реальном приложении должен быть более сложным и храниться в .env)
const SECRET_KEY = 'nashcontrol_secret_key';

/**
 * Простое шифрование строки
 * @param {string} text - Строка для шифрования
 * @returns {string} - Зашифрованная строка
 */
const encrypt = (text) => {
  if (!text) return '';
  
  try {
    const result = [];
    
    // Простое XOR-шифрование с использованием SECRET_KEY
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result.push(String.fromCharCode(charCode));
    }
    
    // Преобразуем результат в строку
    const encryptedString = result.join('');
    
    // Кодируем в base64 для безопасного хранения в cookie
    // Используем encodeURIComponent для поддержки Unicode
    return btoa(encodeURIComponent(encryptedString));
  } catch (error) {
    console.error('Ошибка при шифровании:', error);
    return '';
  }
};

/**
 * Расшифровка строки с поддержкой Unicode-символов
 * @param {string} encryptedText - Зашифрованная строка
 * @returns {string} - Расшифрованная строка
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    // Декодируем из base64
    const text = atob(encryptedText);
    
    // Декодируем из URI-компонента для поддержки Unicode
    const decodedText = decodeURIComponent(text);
    
    // Расшифровываем XOR с тем же ключом
    const result = [];
    for (let i = 0; i < decodedText.length; i++) {
      const charCode = decodedText.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result.push(String.fromCharCode(charCode));
    }
    
    return result.join('');
  } catch (error) {
    console.error('Ошибка при расшифровке:', error);
    return '';
  }
};

/**
 * Установка зашифрованной cookie
 * @param {string} name - Имя cookie
 * @param {string} value - Значение для сохранения
 * @param {number} days - Срок действия в днях
 */
export const setCookie = (name, value, days = 30) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Шифруем значение
    const encryptedValue = encrypt(value);
    
    // Устанавливаем срок действия
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    
    // Устанавливаем cookie с флагами безопасности
    document.cookie = `${name}=${encryptedValue};${expires};path=/;SameSite=Strict`;
    return true;
  } catch (error) {
    console.error(`Ошибка при установке cookie (${name}):`, error);
    return false;
  }
};

/**
 * Получение и расшифровка cookie
 * @param {string} name - Имя cookie
 * @returns {string} - Расшифрованное значение или пустая строка
 */
export const getCookie = (name) => {
  if (typeof window === 'undefined') return '';
  
  try {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      
      if (cookie.indexOf(nameEQ) === 0) {
        const encryptedValue = cookie.substring(nameEQ.length, cookie.length);
        return decrypt(encryptedValue);
      }
    }
    
    return '';
  } catch (error) {
    console.error(`Ошибка при получении cookie (${name}):`, error);
    return '';
  }
};

/**
 * Удаление cookie
 * @param {string} name - Имя cookie для удаления
 */
export const deleteCookie = (name) => {
  if (typeof window === 'undefined') return;
  
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении cookie (${name}):`, error);
    return false;
  }
};

/**
 * Сохранение объекта пользователя в зашифрованных cookie
 * @param {Object} user - Объект пользователя для сохранения
 * @param {number} days - Срок действия в днях
 */
export const saveUserToCookie = (user, days = 30) => {
  if (!user) return false;
  
  try {
    // Удаляем пароль из объекта перед сохранением
    const userToSave = { ...user };
    delete userToSave.password;
    
    // Сериализуем и сохраняем
    const serializedUser = JSON.stringify(userToSave);
    return setCookie('nashcontrol_user', serializedUser, days);
  } catch (error) {
    console.error('Ошибка при сохранении пользователя в cookie:', error);
    return false;
  }
};

/**
 * Получение объекта пользователя из зашифрованных cookie
 * @returns {Object|null} - Объект пользователя или null
 */
export const getUserFromCookie = () => {
  try {
    const serializedUser = getCookie('nashcontrol_user');
    if (!serializedUser) return null;
    
    return JSON.parse(serializedUser);
  } catch (error) {
    console.error('Ошибка при получении пользователя из cookie:', error);
    return null;
  }
};

/**
 * Удаление пользователя из cookie (выход)
 */
export const removeUserFromCookie = () => {
  return deleteCookie('nashcontrol_user');
};

export default {
  setCookie,
  getCookie,
  deleteCookie,
  saveUserToCookie,
  getUserFromCookie,
  removeUserFromCookie
};

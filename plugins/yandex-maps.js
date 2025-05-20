// Плагин для работы с Яндекс Картами
export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig();
  
  return {
    provide: {
      initYandexMap: (elementId, options = {}) => {
        return new Promise((resolve, reject) => {
          // Проверяем, загружен ли API
          if (!window.ymaps) {
            const script = document.createElement('script');
            script.src = `https://api-maps.yandex.ru/2.1/?apikey=${config.public.yandexMapsApiKey}&lang=ru_RU`;
            script.async = true;
            document.head.appendChild(script);
            
            script.onload = () => {
              ymaps.ready(() => {
                const map = new ymaps.Map(elementId, {
                  center: options.center || [55.753215, 37.622504], // Москва по умолчанию
                  zoom: options.zoom || 10,
                  controls: options.controls || ['zoomControl', 'geolocationControl', 'fullscreenControl']
                });
                resolve(map);
              });
            };
            
            script.onerror = (error) => {
              reject(error);
            };
          } else {
            ymaps.ready(() => {
              const map = new ymaps.Map(elementId, {
                center: options.center || [55.753215, 37.622504], // Москва по умолчанию
                zoom: options.zoom || 10,
                controls: options.controls || ['zoomControl', 'geolocationControl', 'fullscreenControl']
              });
              resolve(map);
            });
          }
        });
      }
    }
  };
});

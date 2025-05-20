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

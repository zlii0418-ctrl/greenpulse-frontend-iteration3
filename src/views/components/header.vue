<template>
  <header class="header">
    <div class="header__container">
      <!-- Brand -->
      <div class="header__brand">
        <RouterLink to="/" class="header__title">GreenPulse</RouterLink>
      </div>

      <!-- Navigation Menu -->
      <nav class="header__nav">
        <RouterLink to="/" class="header__nav-link">HOME</RouterLink>
        <RouterLink to="/guide" class="header__nav-link">Guide</RouterLink>
        <RouterLink to="/calculator/travel" class="header__nav-link">Calculator</RouterLink>
        <a href="#" class="header__nav-link">Language</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>

/* Header Container */
.header {
  width: 100%;
  background: rgba(0, 0, 0, 0.7); /* 添加半透明背景 */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999; /* 增加z-index确保在最上层 */
  animation: fadeInDown 0.6s ease-out;
  backdrop-filter: blur(5px); /* 添加模糊效果 */
  -webkit-backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.header__container {
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  height: 80px;
}

/* Brand Section */
.header__brand {
  display: flex;
  align-items: center;
}

.header__title {
  color: rgba(255, 255, 255, 1);
  font-size: 1.8rem;
  font-family: 'EB Garamond', serif;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.header__title::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
}

.header__title:hover::before {
  left: 100%;
}

.header__title:hover {
  transform: scale(1.05);
}

/* Navigation */
.header__nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header__nav-link {
  color: rgba(255, 255, 255, 1);
  font-size: 1rem;
  font-family: 'EB Garamond', serif;
  font-weight: 500;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header__nav-link:hover {
  color: rgba(255, 255, 255, 1);
}

.header__nav-link.router-link-active {
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}



/* Responsive Design */
@media (max-width: 768px) {
  .header__container {
    padding: 1rem;
    height: 70px;
  }

  .header__title {
    font-size: 1.5rem;
  }

  .header__nav {
    gap: 1rem;
  }

  .header__nav-link {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .header__container {
    flex-direction: column;
    height: auto;
    padding: 0.8rem;
    gap: 1rem;
  }

  .header__brand {
    justify-content: center;
  }

  .header__title {
    font-size: 1.4rem;
  }

  .header__nav {
    gap: 0.8rem;
  }

  .header__nav-link {
    font-size: 0.9rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>

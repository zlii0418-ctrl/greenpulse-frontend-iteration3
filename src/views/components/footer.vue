<template>
  <!-- footer.html -->
  <div class="footer_block flex-col">
    <div class="footer_box">
      <!-- Left Box - Logo and Brand -->
      <div class="footer-left-box">
        <div class="footer-brand">
          <img src="@/assets/img/greenpulse_logo.png" alt="GreenPulse Logo" class="footer-logo" />
          <span class="footer-brand-text">GreenPulseMY</span>
        </div>
        <p class="footer-tagline">{{ t('footer.tagline') }}</p>
      </div>

      <!-- Right Box - Quick Links -->
      <div class="footer-right-box">
        <span class="footer-text_3">{{ t('footer.quickLinks') }}</span>
        <RouterLink to="/" class="footer-text_4">{{ t('footer.home') }}</RouterLink>
        <RouterLink to="/calculator" class="footer-text_4">{{ t('footer.calculator') }}</RouterLink>
        <RouterLink to="/chatbot" class="footer-text_4">{{ t('footer.chatbot') }}</RouterLink>
        <RouterLink to="/green-places" class="footer-text_4">{{ t('footer.map') }}</RouterLink>
      </div>

      <!-- Language Switch Button (Hidden) -->
      <div class="language-switch-container" style="display: none;">
        <button
          class="language-switch-btn"
          @click="toggleLanguage"
          :title="t('footer.switchLanguage')"
        >
          <span class="current-lang">{{ locale.toUpperCase() }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'

// Use vue-i18n
const { t, locale } = useI18n()

// Language toggle function
const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'ms' : 'en'
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', locale.value)
  }
}


// Initialize language from localStorage
onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ms' | null
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ms')) {
      locale.value = savedLanguage
    }
  }
})
</script>

<style scoped>
.footer_block {
  background-color: rgba(51, 74, 51, 1);
  height: 280px;
  width: 100%;
  position: relative;
  bottom: auto;
  left: auto;
  z-index: 1;
}

.footer_box {
  width: 90%;
  max-width: 1200px;
  min-height: 114px;
  margin: 30px auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
}

/* Left Box Styles */
.footer-left-box {
  flex: 1;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.footer-brand-text {
  color: rgba(255, 255, 255, 1);
  font-size: 1.5rem;
  font-family: 'EB Garamond', serif;
  font-weight: 700;
  text-decoration: none;
}

.footer-tagline {
  color: rgba(255, 255, 255, 1);
  font-size: 1rem;
  font-family: 'EB Garamond', serif;
  line-height: 1.5;
  margin: 0;
  max-width: 400px;
}

/* Right Box Styles */
.footer-right-box {
  flex: 0 0 auto;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.footer-text-group_1 {
  width: 341px;
  height: 99px;
}

.footer-text_1 {
  width: 228px;
  height: 36px;
  overflow-wrap: break-word;
  color: rgba(229, 171, 109, 1);
  font-size: 24px;
  font-family: var(--font-display);
  font-weight: var(--font-weight-extrabold);
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 24px;
}

.footer-text_2 {
  width: 400px;
  height: 48px;
  overflow-wrap: break-word;
  color: rgba(255, 255, 255, 1);
  font-size: 20px;
  font-family: 'EB Garamond', serif;
  font-weight: normal;
  text-align: center;
  margin-top: 15px;
}

.footer-text-group_2 {
  width: 400px;
  height: 114px;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.footer-text_3 {
  height: 36px;
  overflow-wrap: break-word;
  color: rgba(229, 171, 109, 1);
  font-size: 24px;
  font-family: var(--font-display);
  font-weight: var(--font-weight-extrabold);
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 24px;
  width: 100%;
}

.footer-text_4 {
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(255, 255, 255, 1);
  font-size: 20px;
  font-family: 'EB Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 20px;
  margin: 0;
}

.footer-text_5 {
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(255, 255, 255, 1);
  font-size: 20px;
  font-family: 'EB Garamond', serif;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 20px;
  margin: 0;
}

/* Utility Classes */
.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.justify-between {
  justify-content: space-between;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .footer_block {
    height: auto;
    padding: 2rem 0;
  }

  .footer_box {
    width: 90%;
    max-width: 900px;
    margin: 2rem auto;
    height: auto;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
    align-items: flex-start;
  }

  .footer-left-box {
    flex: 1;
    max-width: 400px;
  }

  .footer-right-box {
    min-width: 180px;
  }
}

@media (max-width: 768px) {
  .footer_block {
    padding: 1.5rem 0;
  }

  .footer_box {
    width: 95%;
    margin: 1.5rem auto;
    gap: 1.5rem;
    flex-direction: column;
    align-items: center;
  }

  .footer-left-box {
    max-width: 100%;
    text-align: center;
  }

  .footer-brand {
    justify-content: center;
  }

  .footer-tagline {
    font-size: 0.9rem;
    max-width: 100%;
  }

  .footer-right-box {
    min-width: unset;
    width: 100%;
    text-align: left;
  }

  .footer-text_3 {
    font-size: 1.5rem;
  }

  .footer-text_4,
  .footer-text_5 {
    font-size: 1rem;
    width: 100%;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .footer_block {
    padding: 1rem 0;
  }

  .footer_box {
    width: 98%;
    margin: 1rem auto;
    gap: 1rem;
    padding: 0 1rem;
  }

  .footer-left-box {
    gap: 0.75rem;
  }

  .footer-logo {
    width: 40px;
    height: 40px;
  }

  .footer-brand-text {
    font-size: 1.2rem;
  }

  .footer-tagline {
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .footer-right-box {
    gap: 0.5rem;
  }

  .footer-text_3 {
    font-size: 1.2rem;
  }

  .footer-text_4,
  .footer-text_5 {
    font-size: 0.9rem;
  }

  .language-switch-container {
    bottom: 15px;
    right: 15px;
  }

  .language-switch-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}

/* Link hover effects */
.footer-text_4,
.footer-text_5 {
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.footer-text_4:hover,
.footer-text_5:hover {
  color: rgba(229, 171, 109, 1);
  transform: translateX(5px);
}

/* Language Switch Button Styles */
.language-switch-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.language-switch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-switch-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.language-switch-btn:active {
  transform: translateY(0);
}

.current-lang {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.language-switch-btn svg {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.language-switch-btn:hover svg {
  opacity: 1;
}
</style>

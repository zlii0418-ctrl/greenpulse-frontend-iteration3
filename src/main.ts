import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import { initializeAllDropdownData } from './services/dropdownData.js'

// Import i18n messages from locales files
import en from './locales/en.json'
import ms from './locales/ms.json'

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'en', // Default language
  fallbackLocale: 'en',
  messages: {
    en,
    ms
  }
})

// Function to clear all localStorage data (only on client side, except dropdown data)
function clearAllLocalStorage() {
  if (typeof window === 'undefined') return

  try {
    // Clear all calculator-related localStorage items except dropdown data
    const keysToRemove = []
    const keysToPreserve = ['greenpulse_food_options', 'greenpulse_shopping_options', 'greenpulse_food_detail_items', 'greenpulse_shopping_detail_items']

    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !keysToPreserve.includes(key)) {
        keysToRemove.push(key)
      }
    }

    // Remove all keys except dropdown data
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    console.log('LocalStorage cleared on page unload (preserving dropdown data)')
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

// Add event listeners to clear localStorage when user closes tab/browser (only on client side)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', clearAllLocalStorage)
  window.addEventListener('pagehide', clearAllLocalStorage)

  // Also clear localStorage when the page is being unloaded (for mobile browsers)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Small delay to ensure the page is actually being closed
      setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          clearAllLocalStorage()
        }
      }, 100)
    }
  })
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// Initialize dropdown data on app startup
initializeAllDropdownData().then(() => {
  console.log('All dropdown data initialized on app startup')
}).catch((error: unknown) => {
  console.error('Failed to initialize dropdown data on app startup:', error)
})

app.mount('#app')

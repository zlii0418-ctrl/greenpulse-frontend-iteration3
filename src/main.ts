import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import { initializeAllDropdownData } from './services/dropdownData.js'

// Import i18n messages
const messages = {
  en: {
    common: {
      next: "Next",
      previous: "Previous",
      calculate: "Calculate",
      result: "Result",
      back: "Back",
      close: "Close",
      ok: "OK",
      cancel: "Cancel",
      reset: "Reset",
      loading: "Loading..."
    },
    navigation: {
      home: "Home",
      travelCalculator: "Travel Calculator",
      householdCalculator: "Household Calculator",
      disclaimer: "Disclaimer"
    },
    footer: {
      quickLinks: "Quick Links",
      travelCalculator: "Travel Calculator",
      householdCalculator: "Household Calculator",
      disclaimer: "Disclaimer",
      switchLanguage: "Switch Language"
    },
    result: {
      travelResult: "Travel Result",
      householdResult: "Household Result",
      shoppingResult: "Shopping Result",
      foodResult: "Food Carbon Footprint",
      weeklyFootprint: "Your total weekly carbon footprint for this category is",
      monthlyFootprint: "Your total monthly carbon footprint for household activities is",
      shoppingFootprint: "Your monthly carbon footprint from shopping is",
      foodFootprint: "Your weekly carbon footprint from food consumption is",
      perWeek: "(per week)",
      perMonth: "(per month)",
      treePlanting: "You would need to plant approximately",
      trees: "tree saplings",
      annually: "annually",
      tenYears: "for 10 years",
      toAbsorb: "to absorb",
      monthlyCO2: "monthly CO2 amount",
      weeklyCO2: "amount of CO2"
    }
  },
  ms: {
    common: {
      next: "Seterusnya",
      previous: "Kembali",
      calculate: "Kira",
      result: "Keputusan",
      back: "Kembali",
      close: "Tutup",
      ok: "OK",
      cancel: "Batal",
      reset: "Tetap Semula",
      loading: "Memuatkan..."
    },
    navigation: {
      home: "Laman Utama",
      travelCalculator: "Kalkulator Perjalanan",
      householdCalculator: "Kalkulator Rumah Tangga",
      disclaimer: "Penafian"
    },
    footer: {
      quickLinks: "Pautan Cepat",
      travelCalculator: "Kalkulator Perjalanan",
      householdCalculator: "Kalkulator Rumah Tangga",
      disclaimer: "Penafian",
      switchLanguage: "Tukar Bahasa"
    },
    result: {
      travelResult: "Keputusan Perjalanan",
      householdResult: "Keputusan Rumah Tangga",
      shoppingResult: "Keputusan Membeli-belah",
      foodResult: "Jejak Karbon Makanan",
      weeklyFootprint: "Jumlah jejak karbon mingguan anda untuk kategori ini adalah",
      monthlyFootprint: "Jumlah jejak karbon bulanan anda untuk aktiviti rumah tangga adalah",
      shoppingFootprint: "Jumlah jejak karbon bulanan anda dari membeli-belah adalah",
      foodFootprint: "Jumlah jejak karbon mingguan anda dari pengambilan makanan adalah",
      perWeek: "(seminggu)",
      perMonth: "(sebulan)",
      treePlanting: "Anda perlu menanam kira-kira",
      trees: "pokok anak benih",
      annually: "setiap tahun",
      tenYears: "untuk 10 tahun",
      toAbsorb: "untuk menyerap",
      monthlyCO2: "jumlah CO2 bulanan",
      weeklyCO2: "jumlah CO2"
    }
  }
}

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'en', // Default language
  fallbackLocale: 'en',
  messages
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

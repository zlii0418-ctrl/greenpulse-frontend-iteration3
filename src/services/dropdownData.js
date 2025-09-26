import { fetchAllFoodDropdownOptions, fetchAllShoppingDropdownOptions } from './api.js'

// LocalStorage keys
const FOOD_OPTIONS_KEY = 'greenpulse_food_options'
const SHOPPING_OPTIONS_KEY = 'greenpulse_shopping_options'

// Global dropdown data storage
let foodOptions = null
let shoppingOptions = null
let foodOptionsLoading = false
let shoppingOptionsLoading = false
let foodOptionsError = null
let shoppingOptionsError = null

// Load food options from localStorage
const loadFoodOptionsFromStorage = () => {
  try {
    const stored = localStorage.getItem(FOOD_OPTIONS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('Loaded food options from localStorage:', parsed)
      return parsed
    }
  } catch (error) {
    console.error('Error loading food options from localStorage:', error)
  }
  return null
}

// Save food options to localStorage
const saveFoodOptionsToStorage = (options) => {
  try {
    localStorage.setItem(FOOD_OPTIONS_KEY, JSON.stringify(options))
    console.log('Saved food options to localStorage')
  } catch (error) {
    console.error('Error saving food options to localStorage:', error)
  }
}

// Initialize food dropdown data
export const initializeFoodDropdownData = async () => {
  if (foodOptions !== null || foodOptionsLoading) {
    return { foodOptions, error: foodOptionsError }
  }

  // First try to load from localStorage
  const storedOptions = loadFoodOptionsFromStorage()
  if (storedOptions) {
    foodOptions = storedOptions
    console.log('Using cached food options from localStorage')
    return { foodOptions, error: null }
  }

  // If not in localStorage, fetch from API
  foodOptionsLoading = true
  foodOptionsError = null

  try {
    console.log('Fetching food options from API...')
    const result = await fetchAllFoodDropdownOptions()
    foodOptions = result.foodOptions
    
    // Save to localStorage for future use
    saveFoodOptionsToStorage(foodOptions)
    
    if (result.errors) {
      foodOptionsError = result.errors
    }
    
    console.log('Global food dropdown data initialized from API:', foodOptions)
    return { foodOptions, error: foodOptionsError }
  } catch (error) {
    console.error('Failed to initialize global food dropdown data:', error)
    foodOptions = { 0: [], 1: [], 2: [], 3: [] }
    foodOptionsError = 'Failed to load food options'
    return { foodOptions, error: foodOptionsError }
  } finally {
    foodOptionsLoading = false
  }
}

// Load shopping options from localStorage
const loadShoppingOptionsFromStorage = () => {
  try {
    const stored = localStorage.getItem(SHOPPING_OPTIONS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('Loaded shopping options from localStorage:', parsed)
      return parsed
    }
  } catch (error) {
    console.error('Error loading shopping options from localStorage:', error)
  }
  return null
}

// Save shopping options to localStorage
const saveShoppingOptionsToStorage = (options) => {
  try {
    localStorage.setItem(SHOPPING_OPTIONS_KEY, JSON.stringify(options))
    console.log('Saved shopping options to localStorage')
  } catch (error) {
    console.error('Error saving shopping options to localStorage:', error)
  }
}

// Initialize shopping dropdown data
export const initializeShoppingDropdownData = async () => {
  if (shoppingOptions !== null || shoppingOptionsLoading) {
    return { shoppingOptions, error: shoppingOptionsError }
  }

  // First try to load from localStorage
  const storedOptions = loadShoppingOptionsFromStorage()
  if (storedOptions) {
    shoppingOptions = storedOptions
    console.log('Using cached shopping options from localStorage')
    return { shoppingOptions, error: null }
  }

  // If not in localStorage, fetch from API
  shoppingOptionsLoading = true
  shoppingOptionsError = null

  try {
    console.log('Fetching shopping options from API...')
    const result = await fetchAllShoppingDropdownOptions()
    shoppingOptions = result.shoppingOptions
    
    // Save to localStorage for future use
    saveShoppingOptionsToStorage(shoppingOptions)
    
    if (result.errors) {
      shoppingOptionsError = result.errors
    }
    
    console.log('Global shopping dropdown data initialized from API:', shoppingOptions)
    return { shoppingOptions, error: shoppingOptionsError }
  } catch (error) {
    console.error('Failed to initialize global shopping dropdown data:', error)
    shoppingOptions = { 0: [], 1: [], 2: [] }
    shoppingOptionsError = 'Failed to load shopping options'
    return { shoppingOptions, error: shoppingOptionsError }
  } finally {
    shoppingOptionsLoading = false
  }
}

// Get food dropdown data (returns cached data if available)
export const getFoodDropdownData = () => {
  return { foodOptions, error: foodOptionsError, isLoading: foodOptionsLoading }
}

// Get shopping dropdown data (returns cached data if available)
export const getShoppingDropdownData = () => {
  return { shoppingOptions, error: shoppingOptionsError, isLoading: shoppingOptionsLoading }
}

// Initialize all dropdown data on app startup
export const initializeAllDropdownData = async () => {
  console.log('Initializing all dropdown data on app startup...')
  
  // Initialize both food and shopping data in parallel
  const [foodResult, shoppingResult] = await Promise.allSettled([
    initializeFoodDropdownData(),
    initializeShoppingDropdownData()
  ])
  
  console.log('All dropdown data initialization completed')
  return {
    food: foodResult.status === 'fulfilled' ? foodResult.value : { foodOptions: null, error: 'Failed to load' },
    shopping: shoppingResult.status === 'fulfilled' ? shoppingResult.value : { shoppingOptions: null, error: 'Failed to load' }
  }
}

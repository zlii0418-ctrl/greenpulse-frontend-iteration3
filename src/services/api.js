import axios from 'axios'

// Environment-based API configuration
const getApiBaseUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV
  
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Default URLs based on environment
  if (isDevelopment) {
    // For local development, use the proxy (no baseURL needed)
    return ''
  } else {
    // For production, use the production API URL
    return 'https://gp-backend-iter3.vercel.app'
  }
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Food dropdown API endpoints
const FOOD_DROPDOWN_ENDPOINTS = {
  0: '/api/food-dropdown/fruits-vegetables',
  1: '/api/food-dropdown/poultry-redmeats-seafood',
  2: '/api/food-dropdown/staples-grain',
  3: '/api/food-dropdown/processed-dairy'
}

// Shopping dropdown API endpoints
const SHOPPING_DROPDOWN_ENDPOINTS = {
  0: '/api/shopping-dropdown/groceries-beverages',
  1: '/api/shopping-dropdown/home-garden-appliances-entertainment-general',
  2: '/api/shopping-dropdown/clothing-accessories-health-pharmacy'
}

// Function to fetch food dropdown options for a single category
export const fetchFoodDropdownOptions = async (categoryIndex) => {
  try {
    const endpoint = FOOD_DROPDOWN_ENDPOINTS[categoryIndex]
    if (!endpoint) {
      throw new Error(`Invalid category index: ${categoryIndex}`)
    }
    
    const response = await api.get(endpoint)
    const data = response.data
    
    // Extract names from the API response structure
    if (data && data.data && Array.isArray(data.data)) {
      // API returns { success: true, data: [{ id, name, subcategory }, ...] }
      return data.data.map(item => item.name)
    } else if (Array.isArray(data)) {
      // Fallback for direct array response
      return data.map(item => typeof item === 'string' ? item : item.name || item)
    } else if (data && data.options) {
      // Fallback for { options: [...] } format
      return data.options
    }
    
    return []
  } catch (error) {
    console.error(`Error fetching food dropdown for category ${categoryIndex}:`, error)
    throw error
  }
}

// Function to fetch all food dropdown options at once
export const fetchAllFoodDropdownOptions = async () => {
  try {
    const promises = Object.keys(FOOD_DROPDOWN_ENDPOINTS).map(async (categoryIndex) => {
      const endpoint = FOOD_DROPDOWN_ENDPOINTS[categoryIndex]
      try {
        const response = await api.get(endpoint)
        return {
          categoryIndex: parseInt(categoryIndex),
          data: response.data,
          success: true
        }
      } catch (error) {
        console.error(`Error fetching food dropdown for category ${categoryIndex}:`, error)
        return {
          categoryIndex: parseInt(categoryIndex),
          data: [],
          success: false,
          error: error.message
        }
      }
    })
    
    const results = await Promise.all(promises)
    
    // Convert results to a more usable format
    const foodOptions = {}
    const errors = {}
    
    results.forEach(result => {
      if (result.success) {
        // Extract names from the API response structure
        let options = []
        if (result.data && result.data.data && Array.isArray(result.data.data)) {
          // API returns { success: true, data: [{ id, name, subcategory }, ...] }
          options = result.data.data.map(item => item.name)
        } else if (Array.isArray(result.data)) {
          // Fallback for direct array response
          options = result.data.map(item => typeof item === 'string' ? item : item.name || item)
        } else if (result.data && result.data.options) {
          // Fallback for { options: [...] } format
          options = result.data.options
        }
        foodOptions[result.categoryIndex] = options
      } else {
        foodOptions[result.categoryIndex] = []
        errors[result.categoryIndex] = result.error
      }
    })
    
    return {
      foodOptions,
      errors: Object.keys(errors).length > 0 ? errors : null
    }
  } catch (error) {
    console.error('Error fetching all food dropdown options:', error)
    throw error
  }
}

// Function to fetch shopping dropdown options for a single category
export const fetchShoppingDropdownOptions = async (categoryIndex) => {
  try {
    const endpoint = SHOPPING_DROPDOWN_ENDPOINTS[categoryIndex]
    if (!endpoint) {
      throw new Error(`Invalid category index: ${categoryIndex}`)
    }
    
    const response = await api.get(endpoint)
    const data = response.data
    
    // Extract names from the API response structure
    if (data && data.data && Array.isArray(data.data)) {
      // API returns { success: true, data: [{ id, name, subcategory }, ...] }
      return data.data.map(item => item.name)
    } else if (Array.isArray(data)) {
      // Fallback for direct array response
      return data.map(item => typeof item === 'string' ? item : item.name || item)
    } else if (data && data.options) {
      // Fallback for { options: [...] } format
      return data.options
    }
    
    return []
  } catch (error) {
    console.error(`Error fetching shopping dropdown for category ${categoryIndex}:`, error)
    throw error
  }
}

// Function to fetch all shopping dropdown options at once
export const fetchAllShoppingDropdownOptions = async () => {
  try {
    const promises = Object.keys(SHOPPING_DROPDOWN_ENDPOINTS).map(async (categoryIndex) => {
      const endpoint = SHOPPING_DROPDOWN_ENDPOINTS[categoryIndex]
      try {
        const response = await api.get(endpoint)
        return {
          categoryIndex: parseInt(categoryIndex),
          data: response.data,
          success: true
        }
      } catch (error) {
        console.error(`Error fetching shopping dropdown for category ${categoryIndex}:`, error)
        return {
          categoryIndex: parseInt(categoryIndex),
          data: [],
          success: false,
          error: error.message
        }
      }
    })
    
    const results = await Promise.all(promises)
    
    // Convert results to a more usable format
    const shoppingOptions = {}
    const errors = {}
    
    results.forEach(result => {
      if (result.success) {
        // Extract names from the API response structure
        let options = []
        if (result.data && result.data.data && Array.isArray(result.data.data)) {
          // API returns { success: true, data: [{ id, name, subcategory }, ...] }
          options = result.data.data.map(item => item.name)
        } else if (Array.isArray(result.data)) {
          // Fallback for direct array response
          options = result.data.map(item => typeof item === 'string' ? item : item.name || item)
        } else if (result.data && result.data.options) {
          // Fallback for { options: [...] } format
          options = result.data.options
        }
        shoppingOptions[result.categoryIndex] = options
      } else {
        shoppingOptions[result.categoryIndex] = []
        errors[result.categoryIndex] = result.error
      }
    })
    
    return {
      shoppingOptions,
      errors: Object.keys(errors).length > 0 ? errors : null
    }
  } catch (error) {
    console.error('Error fetching all shopping dropdown options:', error)
    throw error
  }
}

// Calculator API functions
export const calculateTravel = async (travelData) => {
  try {
    const response = await api.post('/api/calculate/travel', travelData)
    return response.data
  } catch (error) {
    console.error('Error calculating travel emissions:', error)
    throw error
  }
}

export const calculateHousehold = async (householdData) => {
  try {
    const response = await api.post('/api/calculate/household', householdData)
    return response.data
  } catch (error) {
    console.error('Error calculating household emissions:', error)
    throw error
  }
}

export const calculateFood = async (foodData) => {
  try {
    console.log('Making API request to /api/calculate/food with data:', JSON.stringify(foodData, null, 2))
    const response = await api.post('/api/calculate/food', foodData)
    console.log('Food API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error calculating food emissions:', error)
    throw error
  }
}

export const calculateShopping = async (shoppingData) => {
  try {
    const response = await api.post('/api/calculate/shopping', shoppingData)
    return response.data
  } catch (error) {
    console.error('Error calculating shopping emissions:', error)
    throw error
  }
}

// Recommendations API function
export const generateRecommendations = async (recommendationData) => {
  try {
    console.log('Making API request to /api/recommendations/generate with data:', JSON.stringify(recommendationData, null, 2))
    const response = await api.post('/api/recommendations/generate', recommendationData)
    console.log('Recommendations API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error generating recommendations:', error)
    throw error
  }
}

export default api

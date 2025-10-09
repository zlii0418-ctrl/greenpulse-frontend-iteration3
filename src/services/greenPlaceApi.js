import axios from 'axios'

// Create axios instance
const api = axios.create({
  // Prefer environment variable (Vercel sets VITE_API_URL). Fallback to relative '/api' so it works via proxy/rewrites.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // Increased to 30 seconds, giving more time for large data requests
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API request error:', error)
    return Promise.reject(error)
  }
)

/**
 * Green Places API
 */
export const greenPlaceApiService = {
  /**
   * Search green places
   * @param {Object} params - Search parameters
   * @param {string} params.keyword - Search keyword
   * @param {string} params.category - Category filter
   * @param {number} params.page - Page number (starting from 0)
   * @param {number} params.size - Page size
   * @returns {Promise} Paginated results
   */
  searchPlaces({ keyword = '', category = '', page = 0, size = 10 } = {}) {
    const params = {
      keyword,
      page,
      size
    }
    
    // Only add category parameter if it's not empty
    if (category && category.trim() !== '') {
      params.category = category
    }
    
    return api.get('/api/green-places', { params })
  },

  /**
   * Get green place details by ID
   * @param {number} id - Place ID
   * @returns {Promise} Place details
   */
  getPlaceById(id) {
    return api.get(`/api/green-places/${id}`)
  },

  /**
   * Get all available categories
   * @returns {Promise} Array of category strings
   */
  getCategories() {
    return api.get('/api/green-places/categories')
  }
}

export default api
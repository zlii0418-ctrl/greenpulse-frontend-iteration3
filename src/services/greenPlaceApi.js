import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
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
   * @param {number} params.page - Page number (starting from 0)
   * @param {number} params.size - Page size
   * @returns {Promise} Paginated results
   */
  searchPlaces({ keyword = '', page = 0, size = 10 } = {}) {
    return api.get('/api/green-places', {
      params: {
        keyword,
        page,
        size
      }
    })
  },

  /**
   * Get green place details by ID
   * @param {number} id - Place ID
   * @returns {Promise} Place details
   */
  getPlaceById(id) {
    return api.get(`/api/green-places/${id}`)
  }
}

export default api
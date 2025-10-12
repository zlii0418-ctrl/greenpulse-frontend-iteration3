<template>
  <div>
    <!-- Overlay -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
      style="top: 80px;"
      @click="closeDrawer"
    ></div>
    
    <!-- Drawer -->
    <div 
      class="fixed right-0 w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
      style="top: 80px; height: calc(100vh - 80px);"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Drawer header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h2 class="text-lg font-semibold text-gray-900">Place Details</h2>
        <button
          @click="closeDrawer"
          class="p-2 hover:bg-red-100 rounded-full transition-colors text-gray-600 hover:text-red-600"
          title="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Drawer content -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span class="ml-2 text-gray-600">Loading...</span>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="text-center py-8">
          <div class="text-red-500 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-gray-600">{{ error }}</p>
          <button
            @click="retryLoad"
            class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
        
        <!-- Place details -->
        <div v-else-if="place" class="space-y-6">
          <!-- Basic information -->
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ place.name }}</h3>
            
            <!-- Rating -->
            <div class="flex items-center mb-3">
              <div class="flex items-center">
                <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= getRatingStars(place.rating) ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <span class="ml-2 text-sm text-gray-600">
                {{ place.rating ? place.rating.toFixed(1) : 'No rating' }}
                <span v-if="place.reviewCount" class="text-gray-500">({{ place.reviewCount }} reviews)</span>
              </span>
            </div>
          </div>
          
          <!-- Address information -->
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Address Information</h4>
            <div class="space-y-2 text-sm text-gray-600">
              <p v-if="place.fullAddress" class="flex items-start">
                <svg class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {{ place.fullAddress }}
              </p>
              <p v-if="place.streetAddress" class="flex items-start">
                <svg class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {{ place.streetAddress }}
              </p>
              <p v-if="place.city || place.state" class="flex items-start">
                <svg class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {{ [place.city, place.state].filter(Boolean).join(', ') }}
                <span v-if="place.postalCode"> {{ place.postalCode }}</span>
              </p>
            </div>
          </div>
          
          <!-- Contact information -->
          <div v-if="place.phone || place.website">
            <h4 class="font-semibold text-gray-900 mb-2">Contact Information</h4>
            <div class="space-y-2 text-sm">
              <p v-if="place.phone" class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <a :href="`tel:${place.phone}`" class="text-green-600 hover:text-green-700">{{ place.phone }}</a>
              </p>
              <p v-if="place.website" class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                <a :href="place.website" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-700 break-all">{{ place.website }}</a>
              </p>
            </div>
          </div>
          
          <!-- Operating hours -->
          <div v-if="place.operatingHours">
            <h4 class="font-semibold text-gray-900 mb-2">Operating Hours</h4>
            <div class="text-sm text-gray-600 whitespace-pre-line">{{ formatOperatingHours(place.operatingHours) }}</div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  place: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'retry'])

// Computed properties
const isOpen = computed(() => props.isOpen)

// Methods
const closeDrawer = () => {
  emit('close')
}

const retryLoad = () => {
  emit('retry')
}

const getRatingStars = (rating) => {
  if (!rating) return 0
  return Math.round(rating)
}

const formatOperatingHours = (hours) => {
  if (!hours) return ''
  // Handle operating hours format, support \n and || separation
  return hours.replace(/\|\|/g, '\n').trim()
}

</script>

<style scoped>
/* Drawer animation */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
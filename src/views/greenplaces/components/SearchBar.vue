<template>
  <div class="search-bar bg-white shadow-md p-4">
    <div class="flex items-center space-x-4">
      <!-- Search input box -->
      <div class="flex-1">
        <input
          v-model="keyword"
          type="text"
          placeholder="Search green places..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          @keyup.enter="handleSearch"
        />
      </div>
      
      <!-- Category filter dropdown -->
      <div class="w-48">
        <select
          v-model="selectedCategory"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
          @change="handleSearch"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <!-- Search button -->
      <button
        @click="handleSearch"
        :disabled="isSearching"
        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="!isSearching">Search</span>
        <span v-else class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Searching...
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  selectedCategory: {
    type: String,
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  },
  isSearching: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'update:selectedCategory', 'search'])

// Reactive data
const keyword = ref(props.modelValue)
const selectedCategory = ref(props.selectedCategory)

// Watch props changes
watch(() => props.modelValue, (newValue) => {
  keyword.value = newValue
})

watch(() => props.selectedCategory, (newValue) => {
  selectedCategory.value = newValue
})

// Watch keyword changes, sync to parent component
watch(keyword, (newValue) => {
  emit('update:modelValue', newValue)
})

// Watch category changes, sync to parent component
watch(selectedCategory, (newValue) => {
  emit('update:selectedCategory', newValue)
})

// Handle search
const handleSearch = () => {
  emit('search', {
    keyword: keyword.value.trim(),
    category: selectedCategory.value
  })
}
</script>

<style scoped>
.search-bar {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
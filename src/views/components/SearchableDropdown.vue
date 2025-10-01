<template>
  <div class="searchable-dropdown" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <div class="dropdown-trigger" @click="openDropdown">
      <input
        ref="searchInput"
        v-model="searchTerm"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="search-input"
        @focus="openDropdown"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @click="openDropdown"
      />
      <div class="dropdown-controls">
        <button 
          v-if="searchTerm && !disabled" 
          class="clear-button" 
          @click.stop="clearSelection"
          type="button"
          title="Clear selection"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="dropdown-arrow" :class="{ 'is-open': isOpen }" @click.stop="toggleDropdown">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
    
    <div v-if="isOpen" ref="dropdownMenu" class="dropdown-menu">
      <div v-if="filteredOptions.length === 0" class="no-results">
        No results found
      </div>
      <div
        v-for="(option, index) in filteredOptions"
        :key="option"
        class="dropdown-option"
        :class="{ 'is-selected': selectedIndex === index, 'is-highlighted': highlightedIndex === index }"
        @click="selectOption(option)"
        @mouseenter="highlightedIndex = index"
      >
        {{ option }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue?: string
  options: string[]
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  placeholder: 'Select an option',
  disabled: false
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const searchTerm = ref(props.modelValue || '')
const highlightedIndex = ref(-1)
const searchInput = ref<HTMLInputElement>()
const dropdownMenu = ref<HTMLDivElement>()
const dropdownPosition = ref<'below'>('below')

const selectedIndex = computed(() => {
  return props.options.findIndex(option => option === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!searchTerm.value) {
    return props.options
  }
  return props.options.filter(option =>
    option.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value ? closeDropdown() : openDropdown()
}

const openDropdown = () => {
  if (props.disabled) return
  if (!isOpen.value) {
    isOpen.value = true
    nextTick(() => {
      checkDropdownPosition()
      searchInput.value?.focus()
      // Add class to parent row to ensure proper stacking
      const parentRow = searchInput.value?.closest('.detail-row')
      if (parentRow) {
        parentRow.classList.add('dropdown-open')
      }
    })
  }
}

const checkDropdownPosition = () => {
  // With position: absolute, the dropdown will automatically position relative to its parent
  // No need for complex positioning calculations
  dropdownPosition.value = 'below'
}

const closeDropdown = () => {
  isOpen.value = false
  highlightedIndex.value = -1
  // Remove class from parent row
  const parentRow = searchInput.value?.closest('.detail-row')
  if (parentRow) {
    parentRow.classList.remove('dropdown-open')
  }
}

const selectOption = (option: string) => {
  searchTerm.value = option
  emit('update:modelValue', option)
  closeDropdown()
}

const clearSelection = () => {
  searchTerm.value = ''
  emit('update:modelValue', '')
  closeDropdown()
}

const handleBlur = (event: FocusEvent) => {
  // Delay closing to allow click events on options
  setTimeout(() => {
    if (!event.relatedTarget || !(event.relatedTarget as Element).closest('.searchable-dropdown')) {
      closeDropdown()
    }
  }, 100)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    if (event.key === 'Enter' || event.key === 'ArrowDown') {
      event.preventDefault()
      openDropdown()
    }
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
  }
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  searchTerm.value = newValue || ''
})

// Watch for changes in search term
watch(searchTerm, (newValue) => {
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue)
  }
})

// Handle window resize to recalculate dropdown position
const handleResize = () => {
  if (isOpen.value) {
    nextTick(() => {
      checkDropdownPosition()
    })
  }
}

// Handle scroll to recalculate dropdown position
const handleScroll = () => {
  if (isOpen.value) {
    nextTick(() => {
      checkDropdownPosition()
    })
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style scoped>
.searchable-dropdown {
  position: relative;
  width: 100%;
  z-index: 1;
}

.searchable-dropdown.is-open {
  z-index: 100000;
}

.dropdown-trigger {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-trigger:hover {
  border-color: rgba(61, 124, 74, 0.5);
  box-shadow: 
    0 4px 12px rgba(61, 124, 74, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
}

.dropdown-trigger:focus-within {
  border-color: rgba(61, 124, 74, 0.8);
  box-shadow: 
    0 4px 16px rgba(61, 124, 74, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  font-family: var(--font-display);
}

.search-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.dropdown-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.clear-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #a0aec0;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

.clear-button:focus {
  outline: none;
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

.dropdown-arrow {
  color: #61a5c2;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.dropdown-arrow:hover {
  color: #4a90a4;
  background: rgba(97, 165, 194, 0.1);
}

.dropdown-arrow.is-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 99999;
}



.dropdown-option {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(61, 124, 74, 0.1);
  font-family: var(--font-display);
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover,
.dropdown-option.is-highlighted {
  background: rgba(61, 124, 74, 0.1);
  color: #2d3748;
}

.dropdown-option.is-selected {
  background: rgba(61, 124, 74, 0.15);
  color: #1a365d;
  font-weight: 600;
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #a0aec0;
  font-size: 14px;
  font-style: italic;
  font-family: var(--font-display);
}

.is-disabled .dropdown-trigger {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(61, 124, 74, 0.2);
  cursor: not-allowed;
  opacity: 0.6;
}

.is-disabled .search-input {
  color: #a0aec0;
  cursor: not-allowed;
}

/* Custom scrollbar for dropdown menu */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: rgba(61, 124, 74, 0.1);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(61, 124, 74, 0.3);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(61, 124, 74, 0.5);
}
</style>

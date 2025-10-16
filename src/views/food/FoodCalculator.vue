<template>
  <div class="page flex-col">
    <div class="combined-vehicle-container">
        <div class="title-container">
          <span class="text_5">
            {{ currentQuestion.question }}
          </span>
        </div>

        <!-- Mobile Navigation Buttons -->
        <div class="mobile-nav-container">
          <div class="mobile-nav-buttons">
            <RouterLink to="/calculator/travel" class="mobile-nav-btn">
              <span>Travel</span>
            </RouterLink>
            <RouterLink to="/calculator/household" class="mobile-nav-btn">
              <span>House</span>
            </RouterLink>
            <RouterLink to="/calculator/food" class="mobile-nav-btn active">
              <span>Food</span>
            </RouterLink>
            <RouterLink to="/calculator/shopping" class="mobile-nav-btn">
              <span>Shopping</span>
            </RouterLink>
          </div>
        </div>

        <div v-if="currentQuestion.subtext" class="subtext-container">
          <div class="question-subtext">
            {{ currentQuestion.subtext }}
          </div>
        </div>

        <div class="question-content">
          <!-- Single Choice -->
          <div v-if="currentQuestion.type === 'single_choice'" class="options-container">
            <div 
              v-for="option in currentQuestion.options" 
              :key="option.id"
              class="option-item"
              :class="{ active: answers[currentQuestion.id] === option.value }"
              @click="selectOption(currentQuestion.id, option.value)"
            >
              <div class="radio-circle">
                <div class="radio-dot"></div>
              </div>
              <img v-if="option.iconPath" :src="option.iconPath" :alt="option.label" class="option-icon" />
              <span class="option-label">{{ option.label }}</span>
            </div>
          </div>

          <!-- Slider -->
          <div v-if="currentQuestion.type === 'slider'" class="sliders-container">
            <div v-for="slider in currentQuestion.sliders" :key="slider.id" class="slider-group">
              <div class="slider-container">
                <div class="slider-content">
                  <div class="slider-row">
                    <div class="slider-label">{{ slider.label }}</div>
                    <div class="box_6 flex-col" :style="{ '--slider-progress': getSliderProgress(slider) }">
                      <div class="slider-labels">
                        <span class="min-label">{{ getFrequencyLabel(slider.min) }}</span>
                        <span class="max-label">{{ getFrequencyLabel(slider.max) }}</span>
                      </div>
                      <input
                        type="range"
                        class="gradient-slider"
                        :min="slider.min"
                        :max="slider.max"
                        :value="answers[slider.id] || slider.defaultValue"
                        :step="slider.step"
                        :id="`slider-${slider.id}`"
                        @input="updateSliderValue(slider.id, $event)"
                        :style="{ '--thumb-icon': `url(${iconMap[slider.iconPath] || slider.iconPath})` }"
                      >
                      <div class="current-value" :style="{ '--slider-progress': getSliderProgress(slider) }">
                        {{ getFrequencyLabel(Number(answers[slider.id] !== undefined ? answers[slider.id] : slider.defaultValue)) }}
                      </div>
                    </div>
                    <span class="unit-box" style="white-space: nowrap;">{{ slider.unit ? '' + slider.unit : '' }}</span>
                  </div>
                  <!-- Frequency description -->
                  <div class="frequency-description">
                    {{ getFrequencyDescription(Number(answers[slider.id] !== undefined ? answers[slider.id] : slider.defaultValue)) }}
                  </div>
                </div>
              </div>
            </div>
            <!-- Details button - also add for slider type questions -->
            <div v-if="[0, 1, 2].includes(currentQuestionIndex)" class="details-section">
              <button class="text_10" @click="showDetailModal">
                ADD DETAILS TO IMPROVE ACCURACY
              </button>
            </div>
          </div>

          <!-- Text Input -->
          <div v-if="currentQuestion.type === 'text_input'" class="text-input-container">
            <!-- Multiple text inputs -->
            <div v-if="currentQuestion.textInputs" class="multiple-inputs">
              <div v-for="input in currentQuestion.textInputs" :key="input.id" class="input-group">
                <label class="input-label">{{ input.label }}</label>
                <div class="input-wrapper">
                  <input
                    type="number"
                    :placeholder="input.placeholder"
                    :value="answers[input.id] || ''"
                    @input="updateTextInput(input.id, ($event.target as HTMLInputElement).value)"
                    class="text-input"
                    :min="input.min || 0"
                    :max="input.max || 100"
                  />
                  <span v-if="input.unit" class="input-unit">{{ getDisplayUnit(input.unit) }}</span>
                </div>
              </div>
              <!-- Details button - only show for questions 1,2,3 -->
              <div v-if="[0, 1, 2].includes(currentQuestionIndex)" class="details-section">
                <button class="text_10" @click="showDetailModal">
                  ADD DETAILS TO IMPROVE ACCURACY
                </button>
              </div>
            </div>
            <!-- Single text input (backward compatibility) -->
            <div v-else class="single-input">
              <div class="input-group">
                <input
                  type="number"
                  :placeholder="currentQuestion.placeholder"
                  :value="answers[currentQuestion.id] || ''"
                  @input="updateTextInput(currentQuestion.id, ($event.target as HTMLInputElement).value)"
                  class="text-input"
                  :min="0"
                  :max="100"
                />
                <span v-if="currentQuestion.unit" class="input-unit">{{ getDisplayUnit(currentQuestion.unit) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="progress-container">
          <div class="progress-dots">
            <span v-for="n in foodQuestions.length" :key="n" class="dot" :class="{ active: n <= currentQuestionIndex + 1 }"></span>
          </div>
          <div class="progress-text">
            {{ currentQuestionIndex + 1 }} / {{ foodQuestions.length }}
          </div>
        </div>

        <div class="navigation-container" :class="{ 'only-next': currentQuestionIndex === 0 }">
          <div v-if="currentQuestionIndex > 0" class="nav-button-left">
            <button class="nav-button prev-button" @click="previousQuestion">
              <img class="nav-icon prev-icon" referrerpolicy="no-referrer"
                src="https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG6ba226656a30c6810fd48a78752accc9.png"
                alt="Previous" />
            </button>
          </div>
          
          <div class="nav-button-right">
            <button 
              class="nav-button next-button" 
              @click="nextQuestion"
              :disabled="isCalculating"
            >
              <img 
                v-if="!isCalculating"
                class="nav-icon next-icon" 
                referrerpolicy="no-referrer"
                src="https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG6ba226656a30c6810fd48a78752accc9.png"
                alt="Next" 
              />
              <span v-else class="loading-text">Calculating...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Error message display -->
      <div v-if="calculationError" class="error-message">
        {{ calculationError }}
      </div>

      <!-- Detail Modal -->
      <div v-if="isDetailModalVisible" class="detail-modal" @click="closeDetailModal">
        <div class="modal-content" @click.stop>
          <h3>{{ getDetailModalTitle() }}</h3>
          <div class="modal-section">
            <!-- Animal products details - using slider -->
            <div v-if="currentQuestionIndex === 0" class="animal-products-details">
              <!-- Desktop Layout -->
              <div v-if="!isMobile" class="desktop-layout">
                <div class="detail-header">
                  <div class="header-icon-container">
                    <img :src="getHeaderIcon()" :alt="getItemType()" class="header-icon" />
                  </div>
                  <div class="header-labels">
                    <span class="label-text">Animal Product Type</span>
                    <span class="label-text">Times per week</span>
                  </div>
                </div>
                
                <div v-for="(product, index) in animalProducts" :key="product.id" class="animal-product-row">
                  <div class="row-number">{{ index + 1 }}</div>
                  
                  <div class="product-name">
                    <span class="product-label">{{ product.name }}</span>
                  </div>
                  
                  <div class="product-slider">
                    <div class="slider-container">
                      <div class="slider-content">
                        <div class="slider-row">
                          <div class="box_6 flex-col" :style="{ '--slider-progress': getAnimalProductSliderProgress(product.id) }">
                            <div class="slider-labels">
                              <span class="min-label">{{ getFrequencyLabel(0) }}</span>
                              <span class="max-label">{{ getFrequencyLabel(4) }}</span>
                            </div>
                            <input
                              type="range"
                              class="gradient-slider"
                              :min="0"
                              :max="4"
                              :value="animalProductValues[product.id] || 0"
                              :step="1"
                              :id="`animal-product-${product.id}`"
                              @input="updateAnimalProductValue(product.id, $event)"
                              :style="{ '--thumb-icon': `url(${product.iconPath})` }"
                            >
                            <div class="current-value" :style="{ '--slider-progress': getAnimalProductSliderProgress(product.id) }">
                              {{ getFrequencyLabel(animalProductValues[product.id] !== undefined ? animalProductValues[product.id] : 0) }}
                            </div>
                          </div>
                          <span class="unit-box"></span>
                        </div>
                        <!-- Frequency description -->
                        <div class="frequency-description">
                          {{ getFrequencyDescription(animalProductValues[product.id] !== undefined ? animalProductValues[product.id] : 0) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Mobile Layout -->
              <div v-else class="mobile-layout">
                <div class="detail-header">
                  <div class="header-icon-container">
                    <img :src="getHeaderIcon()" :alt="getItemType()" class="header-icon" />
                  </div>
                </div>
                
                <div v-for="(product, index) in animalProducts" :key="product.id" class="mobile-animal-product-row">
                  <div class="mobile-row-number">{{ index + 1 }}</div>
                  
                  <div class="mobile-form-group">
                    <label class="mobile-field-label">{{ product.name }}</label>
                    <div class="mobile-slider-container">
                      <div class="mobile-slider-content">
                        <div class="mobile-slider-row">
                          <div class="mobile-box-6" :style="{ '--slider-progress': getAnimalProductSliderProgress(product.id) }">
                            <div class="mobile-slider-labels">
                              <span class="mobile-min-label">{{ getFrequencyLabel(0) }}</span>
                              <span class="mobile-max-label">{{ getFrequencyLabel(4) }}</span>
                            </div>
                            <input
                              type="range"
                              class="mobile-gradient-slider"
                              :min="0"
                              :max="4"
                              :value="animalProductValues[product.id] || 0"
                              :step="1"
                              :id="`mobile-animal-product-${product.id}`"
                              @input="updateAnimalProductValue(product.id, $event)"
                              :style="{ '--thumb-icon': `url(${product.iconPath})` }"
                            >
                            <div class="mobile-current-value" :style="{ '--slider-progress': getAnimalProductSliderProgress(product.id) }">
                              {{ getFrequencyLabel(animalProductValues[product.id] !== undefined ? animalProductValues[product.id] : 0) }}
                            </div>
                          </div>
                        </div>
                        <!-- Mobile Frequency description -->
                        <div class="mobile-frequency-description">
                          {{ getFrequencyDescription(animalProductValues[product.id] !== undefined ? animalProductValues[product.id] : 0) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="currentQuestionIndex === 1" class="fruit-vegetable-details">
              <!-- Desktop Layout -->
              <div v-if="!isMobile" class="desktop-layout">
                <div class="detail-header">
                  <div class="header-icon-container">
                    <img :src="getHeaderIcon()" :alt="getItemType()" class="header-icon" />
                  </div>
                  <div class="header-labels">
                    <span class="label-text">Fruit/Vegetable Type</span>
                    <span class="label-text">Times per week</span>
                  </div>
                </div>
                
                <div v-for="(item, index) in fruitVegetableItems" :key="item.id" class="fruit-veg-row">
                  <div class="row-number">{{ index + 1 }}</div>
                  
                  <div class="item-name">
                    <span class="item-label">{{ item.name }}</span>
                  </div>
                  
                  <div class="item-slider">
                    <div class="slider-container">
                      <div class="slider-content">
                        <div class="slider-row">
                          <div class="box_6 flex-col" :style="{ '--slider-progress': getFruitVegSliderProgress(item.id) }">
                            <div class="slider-labels">
                              <span class="min-label">{{ getFrequencyLabel(0) }}</span>
                              <span class="max-label">{{ getFrequencyLabel(4) }}</span>
                            </div>
                            <input
                              type="range"
                              class="gradient-slider"
                              :min="0"
                              :max="4"
                              :value="fruitVegValues[item.id] || 0"
                              :step="1"
                              :id="`fruit-veg-${item.id}`"
                              @input="updateFruitVegValue(item.id, $event)"
                              :style="{ '--thumb-icon': `url(${item.iconPath})` }"
                            >
                            <div class="current-value" :style="{ '--slider-progress': getFruitVegSliderProgress(item.id) }">
                              {{ getFrequencyLabel(fruitVegValues[item.id] !== undefined ? fruitVegValues[item.id] : 0) }}
                            </div>
                          </div>
                          <span class="unit-box"></span>
                        </div>
                        <!-- Frequency description -->
                        <div class="frequency-description">
                          {{ getFrequencyDescription(fruitVegValues[item.id] !== undefined ? fruitVegValues[item.id] : 0) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Mobile Layout -->
              <div v-else class="mobile-layout">
                <div class="detail-header">
                  <div class="header-icon-container">
                    <img :src="getHeaderIcon()" :alt="getItemType()" class="header-icon" />
                  </div>
                </div>
                
                <div v-for="(item, index) in fruitVegetableItems" :key="item.id" class="mobile-fruit-veg-row">
                  <div class="mobile-row-number">{{ index + 1 }}</div>
                  
                  <div class="mobile-form-group">
                    <label class="mobile-field-label">{{ item.name }}</label>
                    <div class="mobile-slider-container">
                      <div class="mobile-slider-content">
                        <div class="mobile-slider-row">
                          <div class="mobile-box-6" :style="{ '--slider-progress': getFruitVegSliderProgress(item.id) }">
                            <div class="mobile-slider-labels">
                              <span class="mobile-min-label">{{ getFrequencyLabel(0) }}</span>
                              <span class="mobile-max-label">{{ getFrequencyLabel(4) }}</span>
                            </div>
                            <input
                              type="range"
                              class="mobile-gradient-slider"
                              :min="0"
                              :max="4"
                              :value="fruitVegValues[item.id] || 0"
                              :step="1"
                              :id="`mobile-fruit-veg-${item.id}`"
                              @input="updateFruitVegValue(item.id, $event)"
                              :style="{ '--thumb-icon': `url(${item.iconPath})` }"
                            >
                            <div class="mobile-current-value" :style="{ '--slider-progress': getFruitVegSliderProgress(item.id) }">
                              {{ getFrequencyLabel(fruitVegValues[item.id] !== undefined ? fruitVegValues[item.id] : 0) }}
                            </div>
                          </div>
                        </div>
                        <!-- Mobile Frequency description -->
                        <div class="mobile-frequency-description">
                          {{ getFrequencyDescription(fruitVegValues[item.id] !== undefined ? fruitVegValues[item.id] : 0) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="currentQuestionIndex === 2" class="grain-staple-details">
              <!-- Desktop Layout -->
              <div v-if="!isMobile" class="desktop-layout">
                <div class="detail-header">
                  <div class="header-icon-container">
                    <img :src="getHeaderIcon()" :alt="getItemType()" class="header-icon" />
                  </div>
                  <div class="header-labels">
                    <span class="label-text">Grain/Staple Type</span>
                    <span class="label-text">Times per week</span>
                  </div>
                </div>
                
                <div v-for="(item, index) in grainStapleItems" :key="item.id" class="grain-staple-row">
                  <div class="row-number">{{ index + 1 }}</div>
                  
                  <div class="item-name">
                    <span class="item-label">{{ item.name }}</span>
                  </div>
                  
                  <div class="item-slider">
                    <div class="slider-container">
                      <div class="slider-content">
                        <div class="slider-row">
                          <div class="box_6 flex-col" :style="{ '--slider-progress': getGrainStapleSliderProgress(item.id) }">
                            <div class="slider-labels">
                              <span class="min-label">{{ getFrequencyLabel(0) }}</span>
                              <span class="max-label">{{ getFrequencyLabel(4) }}</span>
                            </div>
                            <input
                              type="range"
                              class="gradient-slider"
                              :min="0"
                              :max="4"
                              :value="grainStapleValues[item.id] || 0"
                              :step="1"
                              :id="`grain-staple-${item.id}`"
                              @input="updateGrainStapleValue(item.id, $event)"
                              :style="{ '--thumb-icon': `url(${item.iconPath})` }"
                            >
                            <div class="current-value" :style="{ '--slider-progress': getGrainStapleSliderProgress(item.id) }">
                              {{ getFrequencyLabel(grainStapleValues[item.id] !== undefined ? grainStapleValues[item.id] : 0) }}
                            </div>
                          </div>
                          <span class="unit-box"></span>
                        </div>
                        <!-- Frequency description -->
                        <div class="frequency-description">
                          {{ getFrequencyDescription(grainStapleValues[item.id] !== undefined ? grainStapleValues[item.id] : 0) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Mobile Layout -->
              <div v-else class="mobile-layout">
                <div class="detail-header">
                  <div class="header-icon-container">
                    <img :src="getHeaderIcon()" :alt="getItemType()" class="header-icon" />
                  </div>
                </div>
                
                <div v-for="(item, index) in grainStapleItems" :key="item.id" class="mobile-grain-staple-row">
                  <div class="mobile-row-number">{{ index + 1 }}</div>
                  
                  <div class="mobile-form-group">
                    <label class="mobile-field-label">{{ item.name }}</label>
                    <div class="mobile-slider-container">
                      <div class="mobile-slider-content">
                        <div class="mobile-slider-row">
                          <div class="mobile-box-6" :style="{ '--slider-progress': getGrainStapleSliderProgress(item.id) }">
                            <div class="mobile-slider-labels">
                              <span class="mobile-min-label">{{ getFrequencyLabel(0) }}</span>
                              <span class="mobile-max-label">{{ getFrequencyLabel(4) }}</span>
                            </div>
                            <input
                              type="range"
                              class="mobile-gradient-slider"
                              :min="0"
                              :max="4"
                              :value="grainStapleValues[item.id] || 0"
                              :step="1"
                              :id="`mobile-grain-staple-${item.id}`"
                              @input="updateGrainStapleValue(item.id, $event)"
                              :style="{ '--thumb-icon': `url(${item.iconPath})` }"
                            >
                            <div class="mobile-current-value" :style="{ '--slider-progress': getGrainStapleSliderProgress(item.id) }">
                              {{ getFrequencyLabel(grainStapleValues[item.id] !== undefined ? grainStapleValues[item.id] : 0) }}
                            </div>
                          </div>
                        </div>
                        <!-- Mobile Frequency description -->
                        <div class="mobile-frequency-description">
                          {{ getFrequencyDescription(grainStapleValues[item.id] !== undefined ? grainStapleValues[item.id] : 0) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          <div class="modal-footer">
            <button @click="closeDetailModal" class="btn btn-secondary">Cancel</button>
            <button @click="saveDetailData(); nextQuestion();" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Chatbot component -->
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { foodQuestions, UNIT_MAPPING, type FoodAnswers } from '@/data/foodQuestions'
import { getFoodDropdownData, initializeFoodDropdownData } from '@/services/dropdownData'

const router = useRouter()
const currentQuestionIndex = ref(0)
const answers = ref<FoodAnswers>({})

// API data management
const foodOptions = ref<Record<number, string[]>>({})
const isLoading = ref(false)
const errorStates = ref<Record<number, string | null>>({})

// Animal products data
const animalProducts = ref([
  { id: 'beef', name: 'Beef', iconPath: beefImg },
  { id: 'lamb', name: 'Lamb', iconPath: lambImg },
  { id: 'pork', name: 'Pork', iconPath: porkImg },
  { id: 'poultry', name: 'Poultry', iconPath: foodImg },
  { id: 'fish', name: 'Fish or shellfish', iconPath: fishImg },
  { id: 'eggs_dairy', name: 'Eggs, cheese or dairy', iconPath: cheeseImg }
])

// Animal products consumption frequency values
const animalProductValues = ref<Record<string, number>>({})

// Fruits and vegetables data
const fruitVegetableItems = ref([
  { id: 'fruits', name: 'Fruit', iconPath: appleImg },
  { id: 'vegetables', name: 'Vegetable', iconPath: broccoliImg }
])

// Fruits and vegetables consumption frequency values
const fruitVegValues = ref<Record<string, number>>({})

// Grains and staples data
const grainStapleItems = ref([
  { id: 'rice', name: 'Rice', iconPath: riceImg },
  { id: 'noodles', name: 'Noodles', iconPath: noodlesImg },
  { id: 'bread', name: 'Bread', iconPath: baguetteImg }
])

// Grains and staples consumption frequency values
const grainStapleValues = ref<Record<string, number>>({})

// Mobile detection
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// Define events
const emit = defineEmits<{
  'question-change': [index: number]
}>()

// Initialize food options from global service
const initializeFoodOptions = async () => {
  if (isLoading.value) {
    return // Already loading
  }

  isLoading.value = true
  errorStates.value = {}

  try {
    // First try to get cached data
    const cachedData = getFoodDropdownData()
    if (cachedData.foodOptions) {
      foodOptions.value = cachedData.foodOptions
      if (cachedData.error) {
        errorStates.value = cachedData.error
      }
      console.log('Using cached food options:', foodOptions.value)
    } else {
      // If no cached data, initialize from global service
      const result = await initializeFoodDropdownData()
      foodOptions.value = result.foodOptions || {}
      if (result.error) {
        errorStates.value = result.error
      }
      console.log('Initialized food options from global service:', foodOptions.value)
    }
  } catch (error) {
    console.error('Failed to load food options:', error)
    // Initialize with empty arrays for all categories
    foodOptions.value = { 0: [], 1: [], 2: [] }
    errorStates.value = { 
      0: 'Failed to load options', 
      1: 'Failed to load options', 
      2: 'Failed to load options'
    }
  } finally {
    isLoading.value = false
  }
}

// Watch question index changes and emit events
watch(currentQuestionIndex, (newIndex) => {
  emit('question-change', newIndex)
}, { immediate: true })

// Load all food options on component mount
onMounted(() => {
  initializeFoodOptions()
})
const isDetailModalVisible = ref(false)
const detailData = ref<Record<string, Array<{id: string, name: string, weight: number}>>>({})

// API calculation states
const isCalculating = ref(false)
const calculationError = ref<string | null>(null)

// Initialize detailItems with default values
const getDefaultDetailItems = () => ({
  0: [ // Animal products - 6 items
    { id: '1', name: '', weight: 0 }, // Beef
    { id: '2', name: '', weight: 0 }, // Lamb
    { id: '3', name: '', weight: 0 }, // Pork
    { id: '4', name: '', weight: 0 }, // Poultry
    { id: '5', name: '', weight: 0 }, // Fish or shellfish
    { id: '6', name: '', weight: 0 }  // Eggs, cheese or dairy
  ],
  1: [ // Fruits and vegetables - 2 items
    { id: '1', name: '', weight: 0 }, // Fruits
    { id: '2', name: '', weight: 0 }  // Vegetables
  ],
  2: [ // Grains and staples - 3 items
    { id: '1', name: '', weight: 0 }, // Rice
    { id: '2', name: '', weight: 0 }, // Noodles
    { id: '3', name: '', weight: 0 }  // Bread
  ]
})

// Load detailItems from localStorage or use defaults
const loadDetailItemsFromStorage = () => {
  try {
    const stored = localStorage.getItem('greenpulse_food_detail_items')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate structure - check if animal products has 6 items
      if (parsed && typeof parsed === 'object' && parsed[0] && parsed[0].length >= 6) {
        // Merge with defaults to ensure all categories exist
        const defaults = getDefaultDetailItems()
        return { ...defaults, ...parsed }
      } else {
        // Clear old structure and use new defaults
        localStorage.removeItem('greenpulse_food_detail_items')
      }
    }
  } catch (error) {
    console.error('Error loading detail items from localStorage:', error)
  }
  return getDefaultDetailItems()
}

// Save detailItems to localStorage
const saveDetailItemsToStorage = (items: Record<string, Array<{id: string, name: string, weight: number}>>) => {
  try {
    localStorage.setItem('greenpulse_food_detail_items', JSON.stringify(items))
  } catch (error) {
    console.error('Error saving detail items to localStorage:', error)
  }
}

const detailItems = ref<Record<string, Array<{id: string, name: string, weight: number}>>>(loadDetailItemsFromStorage())

// Watch for changes in detailItems and save to localStorage
watch(detailItems, (newItems) => {
  saveDetailItemsToStorage(newItems)
}, { deep: true })

const currentQuestion = computed(() => foodQuestions[currentQuestionIndex.value])

const getDisplayUnit = (unit?: string) => {
  if (!unit) return ''
  return UNIT_MAPPING[unit] || unit
}

// Frequency labels mapping
const frequencyLabels = [
  { value: 0, label: 'Never', description: 'Never' },
  { value: 1, label: 'Infrequently', description: 'Once or twice a week' },
  { value: 2, label: 'Occasionally', description: 'Multiple times a week' },
  { value: 3, label: 'Often', description: 'Most days in a week' },
  { value: 4, label: 'Very Often', description: 'Every day' }
]

const getFrequencyLabel = (value: number) => {
  const frequency = frequencyLabels.find(f => f.value === value)
  return frequency ? frequency.label : 'Never'
}

const getFrequencyDescription = (value: number) => {
  const frequency = frequencyLabels.find(f => f.value === value)
  return frequency ? frequency.description : 'Never'
}

const selectOption = (questionId: string, value: string | number) => {
  answers.value[questionId] = value
}

const updateSliderValue = (sliderId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  answers.value[sliderId] = value
}

// Animal products slider handling methods
const updateAnimalProductValue = (productId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  animalProductValues.value[productId] = value
  console.log(`Updated ${productId} to ${value}`)
}

const getAnimalProductSliderProgress = (productId: string) => {
  const value = animalProductValues.value[productId] !== undefined ? animalProductValues.value[productId] : 0
  const progress = (value / 4) * 100
  return `${progress}%`
}

// Fruits and vegetables slider handling methods
const updateFruitVegValue = (itemId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  fruitVegValues.value[itemId] = value
  console.log(`Updated ${itemId} to ${value}`)
}

const getFruitVegSliderProgress = (itemId: string) => {
  const value = fruitVegValues.value[itemId] !== undefined ? fruitVegValues.value[itemId] : 0
  const progress = (value / 4) * 100
  return `${progress}%`
}

// Grains and staples slider handling methods
const updateGrainStapleValue = (itemId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  grainStapleValues.value[itemId] = value
  console.log(`Updated ${itemId} to ${value}`)
}

const getGrainStapleSliderProgress = (itemId: string) => {
  const value = grainStapleValues.value[itemId] !== undefined ? grainStapleValues.value[itemId] : 0
  const progress = (value / 4) * 100
  return `${progress}%`
}

const updateTextInput = (questionId: string, value: string) => {
  const numValue = parseFloat(value)
  if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
    answers.value[questionId] = numValue
    console.log(`Updated ${questionId} to ${numValue}`)
  } else if (value === '') {
    answers.value[questionId] = 0
    console.log(`Cleared ${questionId}`)
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}


const nextQuestion = async () => {
  if (currentQuestionIndex.value < foodQuestions.length - 1) {
    currentQuestionIndex.value++
  } else {
    // Last question - navigate to result page with raw input data
    try {
      isCalculating.value = true
      calculationError.value = null
      
      // Prepare raw input data and detailed data for Result.vue to process
      console.log('Current answers before navigating to result:', answers.value)
      console.log('Detail data before navigating to result:', detailData.value)
      
      // Navigate to result page with raw input data and detailed data
      router.push({
        path: '/result',
        query: {
          type: 'food',
          data: JSON.stringify(answers.value),
          details: JSON.stringify(detailData.value)
        }
      })
    } catch (error) {
      console.error('Navigation error:', error)
      calculationError.value = 'Failed to navigate to results. Please try again.'
    } finally {
      isCalculating.value = false
    }
  }
}
const getSliderProgress = (slider: {id: string, min: number, max: number, defaultValue: number}) => {
  const value = Number(answers.value[slider.id] !== undefined ? answers.value[slider.id] : slider.defaultValue)
  const progress = ((value - slider.min) / (slider.max - slider.min)) * 100
  return `${progress}%`
}

const showDetailModal = () => {
  isDetailModalVisible.value = true
}

const closeDetailModal = () => {
  isDetailModalVisible.value = false
}

const getDetailModalTitle = () => {
  const titles = {
    0: 'Animal Products Consumption Details',
    1: 'Fruit and Vegetable Details',
    2: 'Grain and Staple Details'
  }
  return titles[currentQuestionIndex.value as keyof typeof titles] || 'Details'
}


// Get item type name
const getItemType = () => {
  const types = {
    0: 'Animal Product',
    1: 'Fruit/Vegetable',
    2: 'Grain/Staple'
  }
  return types[currentQuestionIndex.value as keyof typeof types] || 'Item'
}

// Import images
import vegetableImg from '@/assets/img/vegetable.png'
import proteinsImg from '@/assets/img/proteins.png'
import ramenImg from '@/assets/img/ramen.png'
import cheeseImg from '@/assets/img/cheese.png'

// Animal products icons
import beefImg from '@/assets/img/beef.png'
import lambImg from '@/assets/img/lamb.png'
import porkImg from '@/assets/img/pork.png'
import foodImg from '@/assets/img/food.png'
import fishImg from '@/assets/img/fish.png'

// Fruits and vegetables icons
import appleImg from '@/assets/img/apple.png'
import broccoliImg from '@/assets/img/broccoli.png'

// Grains and staples icons
import riceImg from '@/assets/img/rice.png'
import noodlesImg from '@/assets/img/noodles.png'
import baguetteImg from '@/assets/img/baguette.png'

// Icon mapping
const iconMap: Record<string, string> = {
  'proteins': proteinsImg,
  'vegetable': vegetableImg,
  'ramen': ramenImg,
  'cheese': cheeseImg
}

// Get header icon
const getHeaderIcon = () => {
  const icons = {
    0: proteinsImg,   // Question 1 - Animal products
    1: vegetableImg,  // Question 2 - Fruits and vegetables
    2: ramenImg       // Question 3 - Grains and staples
  }
  return icons[currentQuestionIndex.value as keyof typeof icons] || proteinsImg
}





const saveDetailData = () => {
  // Save current question's detail data
  const currentItems = detailItems.value[currentQuestionIndex.value]
  
  // Transfer slider values and names to the detail items
  const updatedItems = currentItems.map(item => {
    let sliderValue = 0
    let foodName = ''
    
    // Get the slider value and name based on current question and item ID
    if (currentQuestionIndex.value === 0) {
      // Animal products
      const animalProductMap = {
        '1': { key: 'beef', name: 'Beef' },
        '2': { key: 'lamb', name: 'Lamb' }, 
        '3': { key: 'pork', name: 'Pork' },
        '4': { key: 'poultry', name: 'Poultry' },
        '5': { key: 'fish', name: 'Fish or shellfish' },
        '6': { key: 'eggs_dairy', name: 'Eggs, cheese or dairy' }
      }
      const productData = animalProductMap[item.id as keyof typeof animalProductMap]
      if (productData) {
        sliderValue = animalProductValues.value[productData.key] || 0
        foodName = productData.name
      }
    } else if (currentQuestionIndex.value === 1) {
      // Fruits and vegetables
      const plantMap = {
        '1': { key: 'fruits', name: 'Fruits' },
        '2': { key: 'vegetables', name: 'Vegetables' }
      }
      const plantData = plantMap[item.id as keyof typeof plantMap]
      if (plantData) {
        sliderValue = fruitVegValues.value[plantData.key] || 0
        foodName = plantData.name
      }
    } else if (currentQuestionIndex.value === 2) {
      // Grains and staples
      const grainMap = {
        '1': { key: 'rice', name: 'Rice' },
        '2': { key: 'noodles', name: 'Noodles' },
        '3': { key: 'bread', name: 'Bread' }
      }
      const grainData = grainMap[item.id as keyof typeof grainMap]
      if (grainData) {
        sliderValue = grainStapleValues.value[grainData.key] || 0
        foodName = grainData.name
      }
    }
    
    return {
      ...item,
      name: foodName,
      weight: sliderValue
    }
  })
  
  detailData.value[currentQuestionIndex.value] = updatedItems
  
  // Close modal
  closeDetailModal()
  
  console.log('Saved detail data:', updatedItems)
}



// Initialize default values
foodQuestions.forEach(question => {
  if (question.sliders) {
    question.sliders.forEach(slider => {
      if (!(slider.id in answers.value)) {
        answers.value[slider.id] = slider.defaultValue
      }
    })
  }
})
</script>

<style scoped>
.page {
  background-color: rgba(255, 255, 255, 0.2);
  position: relative;
  width: 100%;
  min-height: 500px;
  overflow-x: hidden;
}

.combined-vehicle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 15px;
  padding: 15px 80px 15px 80px;
  margin: 0 auto;
  box-sizing: border-box;
  flex: 1;
  justify-content: center;
  padding-top: 30px;
  border-radius: 20px;
  overflow: hidden;
}

.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.text_5 {
  width: 100%;
  color: #000;
  font-size: 32px;
  font-family: var(--font-display);
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  margin: 0 auto;
  padding: 5px 20px;
}

.subtext-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 15px 0;
}

.question-subtext {
  width: 100%;
  color: #666;
  font-size: 16px;
  font-family: var(--font-display);
  font-weight: 400;
  text-align: center;
  line-height: 1.4;
  margin: 0;
  padding: 0 20px;
  max-width: 600px;
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 10px auto;
  width: 100%;
  padding: 0 20px;
  margin-left: 60px;
  margin-right: 60px;
}

/* Single choice styles */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border: none;
  cursor: pointer;
  transition: none;
  background: transparent;
  gap: 15px;
}

.option-item:hover {
  transform: none;
  box-shadow: none;
}

.option-item.active {
  border: none;
  background: transparent;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #000;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.option-item.active .radio-circle {
  background: #000;
}

.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.option-item.active .radio-dot {
  opacity: 1;
}

.option-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}

.option-label {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  flex: 1;
  font-family: var(--font-display);
}

/* Slider styles */
.sliders-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 10px auto;
  width: 100%;
  padding: 0 20px;
  margin-left: 60px;
  margin-right: 60px;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.slider-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
  flex: 1;
  min-width: 0;
}

.slider-label {
  width: 80px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  font-family: var(--font-display);
  color: black;
}

.slider-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
}

.box_6 {
  border: 6px solid rgba(255,255,255,1);
  border-radius: 80px;
  flex: 1;
  height: 24px;
  transition: all 0.3s;
  position: relative;
  overflow: visible;
  z-index: 1;
  top: -10px;
}
.box_6::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgb(128, 194, 99);
  border-radius: 80px;
  transition: width 0.3s;
  width: var(--slider-progress, 0%);
  z-index: 1;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 2px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
  position: relative;
  top: 20px;
  font-family: var(--font-display);
}

.min-label {
  color: white;
}

.max-label {
  color: white;
}

.current-value {
  position: absolute;
  top: 50%;
  left: var(--slider-progress, 0%);
  transform: translateX(-50%) translateY(35px);
  background: #3d7c4a;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: var(--font-display);
}

.current-value::before {
  content: '';
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background-image: var(--thumb-icon);
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
}

.frequency-description {
  text-align: center;
  margin-top: 40px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  font-family: var(--font-display);
}

.gradient-slider {
  width: calc(100% + 60px);
  position: relative;
  z-index: 1;
  margin: 0 -30px;
  padding: 0;
  -webkit-appearance: none !important;
  appearance: none !important;
  background: transparent !important;
  outline: none !important;
  height: 5px !important;
}
.gradient-slider::-webkit-slider-runnable-track,
.gradient-slider::-moz-range-track {
  width: 100% !important;
  height: 20px !important;
  background: transparent !important;
  border-radius: 4px !important;
  border: none !important;
}
.gradient-slider::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 60px !important;
  height: 60px !important;
  cursor: pointer;
  background-image: var(--thumb-icon) !important;
  background-size: 60px 60px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  position: relative;
  z-index: 2;
  transform: translateY(-70%) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  transition: none !important;
}

/* Text input styles */
.text-input-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.multiple-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 600px;
  align-items: center;
}

.single-input {
  display: flex;
  justify-content: center;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: center;
}

.input-label {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  min-width: 200px;
  text-align: left;
  font-family: var(--font-display);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 200px;
}

.text-input {
  width: 120px;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
  font-family: var(--font-display);
}

.text-input:focus {
  border-color: #3d7c4a;
}

.input-unit {
  font-weight: 500;
  color: #666;
  font-size: 1.1rem;
  white-space: nowrap;
  font-family: var(--font-display);
}

.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 60px;
  padding: 0 2rem;
  width: 100%;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 0.5rem;
}
.dot {
  width: 10px;
  height: 10px;
  background-color: rgba(61, 124, 74, 0.3);
  border-radius: 50%;
  transition: background-color 0.3s;
}
.dot.active {
  background-color: rgba(61, 124, 74, 0.8);
}
.progress-text {
  font-size: 0.9rem;
  color: rgba(61, 124, 74, 0.8);
  font-weight: 600;
  text-align: center;
  font-family: var(--font-display);
}

.navigation-container {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  z-index: 10;
  pointer-events: none;
}
.navigation-container.only-next {
  justify-content: flex-end;
}
.nav-button-left,
.nav-button-right {
  pointer-events: auto;
}
.nav-button {
  background: none;
  border: 2px solid #466093;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.nav-button:hover {
  background: rgba(70, 96, 147, 0.1);
  border-color: #5a7bb8;
}
.nav-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(2000%) hue-rotate(120deg) brightness(0.8) contrast(1.2);
}
.prev-icon {
  transform: scaleX(-1);
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.unit-box {
  font-size: 24px;
  font-family: var(--font-display);
  color: black;
}


/* Mobile Navigation Buttons */
.mobile-nav-container {
  display: none;
  margin: 20px 0;
  padding: 0 15px;
}

.mobile-nav-buttons {
  display: flex;
  gap: 10px;
  justify-content: space-around;
}

.mobile-nav-btn {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #2d5a37;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.mobile-nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.mobile-nav-btn.active {
  background: linear-gradient(135deg, #4a7c59, #2d5a37);
  color: white;
  border-color: #2d5a37;
}

/* Mobile layout fixes and slider enhancements */
@media (max-width: 768px) {
  .page {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 10px !important;
  }
  
  .combined-vehicle-container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 15px 10px !important;
  }
  
  .sliders-container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .slider-content {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }
  
  .mobile-nav-container {
    display: block;
  }
  
  /* Fix text visibility on mobile */
  .text_5, .slider-label, .unit-box, .vehicle-section {
    color: #333 !important;
    font-weight: 600 !important;
  }
  
  .text_5 {
    font-size: 18px !important;
    color: #000 !important;
    font-weight: 700 !important;
  }
  
  .slider-label {
    font-size: 16px !important;
    color: #2d5a37 !important;
    font-weight: 600 !important;
  }
  
  .unit-box {
    color: #2d5a37 !important;
    font-weight: 600 !important;
  }

  /* Mobile slider enhancements - thicker tracks with gradient */
  .gradient-slider {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }
  
  .gradient-slider::-webkit-slider-runnable-track,
  .gradient-slider::-moz-range-track {
    height: 40px !important;
    background: linear-gradient(to right, #e0e0e0, #81c263) !important;
    border-radius: 20px !important;
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2) !important;
  }
  
  .gradient-slider::-webkit-slider-thumb,
  .gradient-slider::-moz-range-thumb {
    width: 50px !important;
    height: 50px !important;
    background-size: 40px 40px !important;
    transform: translateY(-50%) !important;
  }
  
  .text_5 {
    font-size: 24px;
  }
  
  .options-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .text_10 {
    font-size: 12px !important;
    padding: 8px 16px !important;
    letter-spacing: 0.3px !important;
    min-width: 350px !important;
  }
}

@media (max-width: 480px) {
  .text_10 {
    font-size: 11px !important;
    padding: 6px 12px !important;
    letter-spacing: 0.2px !important;
    min-width: 300px !important;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 13px;
  }
}

/* Mobile styles for detail modal */
@media (max-width: 768px) {
  .detail-modal {
    padding: 10px !important;
    align-items: flex-start !important;
    padding-top: 10px !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
  }
  
  .modal-content {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 15px !important;
    border-radius: 15px !important;
    max-height: calc(100vh - 20px) !important;
    min-height: auto !important;
    margin-top: 10px !important;
  }
  
  .modal-content h3 {
    font-size: 18px !important;
    margin-bottom: 10px !important;
    padding-bottom: 8px !important;
  }
  
  .modal-section {
    max-height: calc(100vh - 200px) !important;
    margin-bottom: 10px !important;
  }
  
  .modal-footer {
    padding: 10px 0 !important;
    gap: 10px !important;
  }
  
  .btn {
    padding: 8px 16px !important;
    font-size: 12px !important;
  }
  
  /* Mobile styles for food detail sections */
  .animal-products-details,
  .fruit-vegetable-details,
  .grain-staple-details {
    padding: 15px !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }
  
  .detail-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
    margin-bottom: 15px !important;
  }
  
  .header-icon-container {
    flex-direction: row !important;
    align-items: center !important;
    gap: 10px !important;
  }
  
  .add-button {
    align-self: flex-end !important;
  }
  
  .animal-product-row,
  .fruit-vegetable-row,
  .grain-staple-row {
    flex-direction: column !important;
    gap: 15px !important;
    padding: 15px !important;
    width: 100% !important;
    margin-bottom: 20px !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    border-radius: 12px !important;
    background: rgba(255, 255, 255, 0.8) !important;
    display: flex !important;
    align-items: stretch !important;
  }
  
  .item-name {
    font-size: 14px !important;
    margin-bottom: 5px !important;
  }
  
  .custom-select,
  .custom-input {
    width: 100% !important;
    font-size: 16px !important;
    padding: 12px 16px !important;
    border: 2px solid #e0e0e0 !important;
    border-radius: 8px !important;
    background: white !important;
    margin-bottom: 10px !important;
  }
  
  .custom-select:focus,
  .custom-input:focus {
    border-color: #4a7c59 !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1) !important;
  }
  
  .delete-button {
    align-self: flex-end !important;
    margin-top: 10px !important;
    padding: 8px 16px !important;
    background: #ff4757 !important;
    color: white !important;
    border: none !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
  }
  
  .delete-button:hover {
    background: #ff3742 !important;
    transform: translateY(-1px) !important;
  }
  
  /* Hide header labels on mobile */
  .animal-products-details .header-labels,
  .fruit-vegetable-details .header-labels,
  .grain-staple-details .header-labels {
    display: none !important;
  }
  
  /* Adjust slider-row width in detail modal to prevent overflow */
  .animal-products-details .slider-row,
  .fruit-vegetable-details .slider-row,
  .grain-staple-details .slider-row {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    padding: 0 20px !important;
    overflow: hidden !important;
    justify-content: center !important;
    align-items: center !important;
    height: 17vh;
  }
  
  /* Make slider width bigger and centered */
  .animal-products-details .box_6,
  .fruit-vegetable-details .box_6,
  .grain-staple-details .box_6 {
    flex: 1 !important;
    min-width: 200px !important;
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }
  
  /* Center the slider content within box_6 */
  .animal-products-details .slider-content,
  .fruit-vegetable-details .slider-content,
  .grain-staple-details .slider-content {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }
  
  /* Ensure icons stay visible and centered */
  .animal-products-details .slider-row .slider-label,
  .fruit-vegetable-details .slider-row .slider-label,
  .grain-staple-details .slider-row .slider-label {
    min-width: 80px !important;
    text-align: center !important;
    flex-shrink: 0 !important;
    margin: 0 10px !important;
  }
  
  /* Center sliders properly */
  .animal-products-details .slider-row,
  .fruit-vegetable-details .slider-row,
  .grain-staple-details .slider-row {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 15px !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  
  /* Adjust slider width in detail modal */
  .animal-products-details .gradient-slider,
  .fruit-vegetable-details .gradient-slider,
  .grain-staple-details .gradient-slider {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }
}

/* Details section */
.details-section {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 20px auto;
  width: 100%;
  max-width: 600px;
  padding-left: 40px;
}

.text_10 {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #3d7c4a, #2d5a37);
  box-shadow: 0 4px 15px rgba(61, 124, 74, 0.3);
  cursor: pointer;
  font-family: var(--font-display);
  min-width: 400px;
  width: 100%;
  max-width: 500px;
}

.text_10:hover {
  background: linear-gradient(135deg, #4a8c5a, #3d6a47);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(61, 124, 74, 0.4);
}

.text_10:active {
  transform: translateY(0);
  background: linear-gradient(135deg, #2d5a37, #1e3d26);
  box-shadow: 0 2px 10px rgba(61, 124, 74, 0.3);
}

/* Detail modal styles */
.detail-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 10001;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  padding-top: 5px;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 20px;
  max-width: 1000px;
  width: 95%;
  height: auto;
  max-height: calc(100vh - 100px);
  min-height: 400px;
  overflow: hidden;
  font-family: var(--font-display);
  box-shadow: 0 12px 48px rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  flex-direction: column;
}

.modal-content h3 {
  color: rgba(61, 124, 74, 1);
  font-size: 22px;
  margin-bottom: 15px;
  text-align: center;
  border-bottom: 2px solid rgba(61, 124, 74, 0.2);
  padding-bottom: 10px;
}

.modal-section {
  margin-bottom: 15px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  max-height: 500px;
}

/* Allow dropdown to overflow in detail sections */
.food-details .modal-section {
  overflow: visible;
}

/* Show scrollbar for modal section */
.modal-section::-webkit-scrollbar {
  width: 8px;
}

.modal-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-section::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modal-section::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.modal-section {
  scrollbar-width: thin;  /* Firefox */
  scrollbar-color: #c1c1c1 #f1f1f1;  /* Firefox */
}

/* Food details styles */
.food-details {
  width: 100%;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-icon-container {
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.header-labels {
  display: flex;
  gap: 200px;
  flex: 1;
  margin-right: 20px;
}

.label-text {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  font-family: var(--font-display);
}

.add-button {
  cursor: pointer;
}

.add-button img {
  width: 30px;
  height: 30px;
  transition: transform 0.3s ease;
}

.add-button:hover img {
  transform: scale(1.1);
}

.add-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-button.disabled:hover img {
  transform: none;
}

.limit-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 10px 0;
  border: 1px solid #fecaca;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.row-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3d7c4a;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  margin-right: 20px;
  font-size: 14px;
  font-family: var(--font-display);
}

.name-select {
  flex: 1;
  margin-right: 20px;
}

.custom-select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  min-width: 200px;
  width: 100%;
  font-family: var(--font-display);
  color: black;
}

.weight-input {
  flex: 1;
  margin-right: 20px;
}

.custom-input {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  color: black;
  width: 100%;
  font-family: var(--font-display);
}

.custom-input:focus,
.custom-select:focus {
  outline: none;
  border-color: #3d7c4a;
  box-shadow: 0 0 0 2px rgba(61, 124, 74, 0.2);
}

.delete-button {
  color: #999;
  font-size: 12px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-family: var(--font-display);
}

.delete-button:hover {
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 25px 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(255, 255, 255, 0.8));
  border-radius: 0 0 20px 20px;
  flex-shrink: 0;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-display);
  min-width: 100px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #718096;
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.1),
    -4px -4px 8px rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.15),
    -6px -6px 12px rgba(255, 255, 255, 1);
}

.btn-primary {
  background: linear-gradient(135deg, #3d7c4a, #2d5a37);
  color: white;
  box-shadow: 
    4px 4px 8px rgba(61, 124, 74, 0.3),
    -4px -4px 8px rgba(255, 255, 255, 0.8);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #4a8c5a, #3d6a47);
  transform: translateY(-2px);
  box-shadow: 
    6px 6px 12px rgba(61, 124, 74, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 1);
}

.error-message {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
  font-family: var(--font-display);
}

.loading-text {
  color: #666;
  font-size: 12px;
  font-family: var(--font-display);
}

/* Animal products details styles */
.animal-products-details {
  width: 100%;
}

.animal-product-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.product-name {
  flex: 1;
  margin-right: 20px;
  min-width: 150px;
}

.product-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  font-family: var(--font-display);
}

.product-slider {
  flex: 2;
  margin-right: 20px;
}

.product-slider .slider-container {
  margin-bottom: 0;
  margin-top: 0;
}

.product-slider .slider-content {
  width: 100%;
}

.product-slider .slider-row {
  gap: 10px;
}

.product-slider .box_6 {
  margin: 0;
  height: 20px;
}

.product-slider .unit-box {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  min-width: 80px;
}

/* Animal products slider thumb styles - smaller size */
.animal-products-details .gradient-slider::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 40px !important;
  height: 40px !important;
  cursor: pointer;
  background-image: var(--thumb-icon) !important;
  background-size: 40px 40px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  position: relative;
  z-index: 2;
  transform: translateY(-50%) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  transition: none !important;
}

.animal-products-details .gradient-slider::-moz-range-thumb {
  width: 40px !important;
  height: 40px !important;
  cursor: pointer;
  background-image: var(--thumb-icon) !important;
  background-size: 40px 40px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* Fruits and vegetables details styles */
.fruit-vegetable-details {
  width: 100%;
}

.fruit-veg-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.item-name {
  flex: 1;
  margin-right: 20px;
  min-width: 150px;
}

.item-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  font-family: var(--font-display);
}

.item-slider {
  flex: 2;
  margin-right: 20px;
}

.item-slider .slider-container {
  margin-bottom: 0;
  margin-top: 0;
}

.item-slider .slider-content {
  width: 100%;
}

.item-slider .slider-row {
  gap: 10px;
}

.item-slider .box_6 {
  margin: 0;
  height: 20px;
}

.item-slider .unit-box {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  min-width: 80px;
}

/* Fruits and vegetables slider thumb styles - smaller size */
.fruit-vegetable-details .gradient-slider::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 40px !important;
  height: 40px !important;
  cursor: pointer;
  background-image: var(--thumb-icon) !important;
  background-size: 40px 40px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  position: relative;
  z-index: 2;
  transform: translateY(-50%) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  transition: none !important;
}

.fruit-vegetable-details .gradient-slider::-moz-range-thumb {
  width: 40px !important;
  height: 40px !important;
  cursor: pointer;
  background-image: var(--thumb-icon) !important;
  background-size: 40px 40px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* Mobile Layout Styles for Fruit and Vegetable Details */
.mobile-layout {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/* Mobile modal content adjustments */
@media (max-width: 768px) {
  .detail-modal {
    padding: 5px !important;
    align-items: flex-start !important;
    padding-top: 5px !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
  }
  
  .modal-content {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 10px !important;
    border-radius: 15px !important;
    max-height: calc(100dvh - 100px) !important;
    min-height: auto !important;
    margin-top: 5px !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }
  
  .modal-section {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    max-height: calc(100dvh - 220px) !important;
    box-sizing: border-box !important;
  }
}

.mobile-animal-product-row,
.mobile-fruit-veg-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  padding: 15px 15px 0 15px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.8);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  gap: 15px;
}

.mobile-row-number {
  width: 30px;
  height: 30px;
  background: #3d7c4a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  align-self: flex-start;
}

.mobile-form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 15px;
}

.mobile-field-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  font-family: var(--font-display);
  margin-bottom: 8px;
  text-align: left;
}

.mobile-slider-container {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
}

.mobile-slider-content {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mobile-slider-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.mobile-box-6 {
  width: 100%;
  max-width: 100%;
  height: 60px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
}

.mobile-slider-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  margin-bottom: 10px;
  padding: 0 10px;
  box-sizing: border-box;
}

.mobile-min-label,
.mobile-max-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.mobile-gradient-slider {
  width: 100%;
  max-width: calc(100% - 20px);
  height: 8px;
  background: linear-gradient(to right, #e0e0e0, #4a7c59);
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  position: relative;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 0;
}

.mobile-gradient-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-image: var(--thumb-icon);
  background-size: 40px 40px;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  z-index: 2;
  transform: translateY(-50%);
  border-radius: 0;
  box-shadow: none;
  transition: none;
}

.mobile-gradient-slider::-moz-range-thumb {
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-image: var(--thumb-icon);
  background-size: 40px 40px;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.mobile-current-value {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(74, 124, 89, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: var(--font-display);
}

.mobile-frequency-description {
  text-align: center;
  margin-top: 15px;
  font-size: 12px;
  color: #666;
  font-style: italic;
  line-height: 1.4;
}

/* Mobile Layout Styles for Grain and Staple Details */
.mobile-grain-staple-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  padding: 15px 15px 0 15px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.05),
    inset -2px -2px 4px rgba(255, 255, 255, 0.8);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  gap: 15px;
}

/* 谷物主食详情样式 */
.grain-staple-details {
  width: 100%;
}

.grain-staple-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.grain-staple-row .item-name {
  flex: 1;
  margin-right: 20px;
  min-width: 150px;
}

.grain-staple-row .item-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  font-family: var(--font-display);
}

.grain-staple-row .item-slider {
  flex: 2;
  margin-right: 20px;
}

.grain-staple-row .item-slider .slider-container {
  margin-bottom: 0;
  margin-top: 0;
}

.grain-staple-row .item-slider .slider-content {
  width: 100%;
}

.grain-staple-row .item-slider .slider-row {
  gap: 10px;
}

.grain-staple-row .item-slider .box_6 {
  margin: 0;
  height: 20px;
}

.grain-staple-row .item-slider .unit-box {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  min-width: 80px;
}

/* 谷物主食slider的拖动手柄样式 - 更小的尺寸 */
.grain-staple-details .gradient-slider::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 40px !important;
  height: 40px !important;
  cursor: pointer;
  background-image: var(--thumb-icon) !important;
  background-size: 40px 40px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  position: relative;
  z-index: 2;
  transform: translateY(-50%) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  transition: none !important;
}

.grain-staple-details .gradient-slider::-moz-range-thumb {
  width: 40px !important;
  height: 40px !important;
  cursor: pointer;
  background-image: var(--thumb-icon) !important;
  background-size: 40px 40px !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
</style>




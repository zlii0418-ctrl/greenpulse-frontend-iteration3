<template>
  <div class="page flex-col">
    <div class="combined-vehicle-container">
        <div class="title-container">
          <span class="text_5">
            {{ currentQuestion.question }}
          </span>
        </div>

        <div v-if="currentQuestion.subtext" class="subtext-container">
          <div class="question-subtext">
            {{ currentQuestion.subtext }}
          </div>
        </div>

        <div class="question-content">
          <!-- 单选题 -->
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

          <!-- 滑块 -->
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
            <!-- 详情按钮 - 为slider类型问题也添加 -->
            <div v-if="[0, 1, 2].includes(currentQuestionIndex)" class="details-section">
              <button class="text_10" @click="showDetailModal">
                ADD DETAILS TO IMPROVE ACCURACY
              </button>
            </div>
          </div>

          <!-- 文本输入 -->
          <div v-if="currentQuestion.type === 'text_input'" class="text-input-container">
            <!-- 多个文本输入 -->
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
              <!-- 详情按钮 - 只在问题1,2,3显示 -->
              <div v-if="[0, 1, 2].includes(currentQuestionIndex)" class="details-section">
                <button class="text_10" @click="showDetailModal">
                  ADD DETAILS TO IMPROVE ACCURACY
                </button>
              </div>
            </div>
            <!-- 单个文本输入（向后兼容） -->
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

      <!-- 详情弹框 -->
      <div v-if="isDetailModalVisible" class="detail-modal" @click="closeDetailModal">
        <div class="modal-content" @click.stop>
          <h3>{{ getDetailModalTitle() }}</h3>
          <div class="modal-section">
            <!-- 动物产品详情 - 使用slider -->
            <div v-if="currentQuestionIndex === 0" class="animal-products-details">
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
            
            <!-- 水果蔬菜详情 - 使用slider -->
            <div v-else-if="currentQuestionIndex === 1" class="fruit-vegetable-details">
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
            
            <!-- 谷物主食详情 - 使用slider -->
            <div v-else-if="currentQuestionIndex === 2" class="grain-staple-details">
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
            
          </div>
          <div class="modal-footer">
            <button @click="closeDetailModal" class="btn btn-secondary">Cancel</button>
            <button @click="saveDetailData(); nextQuestion();" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </div>

    <!-- 聊天机器人组件 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { foodQuestions, UNIT_MAPPING, type FoodAnswers } from '@/data/foodQuestions'
import { getFoodDropdownData, initializeFoodDropdownData } from '@/services/dropdownData'
import SearchableDropdown from '@/views/components/SearchableDropdown.vue'

const router = useRouter()
const currentQuestionIndex = ref(0)
const answers = ref<FoodAnswers>({})

// API data management
const foodOptions = ref<Record<number, string[]>>({})
const isLoading = ref(false)
const errorStates = ref<Record<number, string | null>>({})

// 动物产品数据
const animalProducts = ref([
  { id: 'beef', name: 'Beef', iconPath: beefImg },
  { id: 'lamb', name: 'Lamb', iconPath: lambImg },
  { id: 'pork', name: 'Pork', iconPath: porkImg },
  { id: 'poultry', name: 'Poultry', iconPath: foodImg },
  { id: 'fish', name: 'Fish or shellfish', iconPath: fishImg },
  { id: 'eggs_dairy', name: 'Eggs, cheese or dairy', iconPath: cheeseImg }
])

// 动物产品消费频率值
const animalProductValues = ref<Record<string, number>>({})

// 水果蔬菜数据
const fruitVegetableItems = ref([
  { id: 'fruits', name: 'Fruit', iconPath: appleImg },
  { id: 'vegetables', name: 'Vegetable', iconPath: broccoliImg }
])

// 水果蔬菜消费频率值
const fruitVegValues = ref<Record<string, number>>({})

// 谷物主食数据
const grainStapleItems = ref([
  { id: 'rice', name: 'Rice', iconPath: riceImg },
  { id: 'noodles', name: 'Noodles', iconPath: noodlesImg },
  { id: 'bread', name: 'Bread', iconPath: baguetteImg }
])

// 谷物主食消费频率值
const grainStapleValues = ref<Record<string, number>>({})

// 定义事件
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

// 监听问题索引变化并发射事件
watch(currentQuestionIndex, (newIndex) => {
  emit('question-change', newIndex)
}, { immediate: true })

// Load all food options on component mount
onMounted(() => {
  initializeFoodOptions()
})
const isDetailModalVisible = ref(false)
const detailData = ref<Record<string, any>>({})
const showLimitMessage = ref(false)

// API calculation states
const isCalculating = ref(false)
const calculationError = ref<string | null>(null)

// Initialize detailItems with default values
const getDefaultDetailItems = () => ({
  0: [ // 动物产品 - 6 items
    { id: '1', name: '', weight: 0 }, // Beef
    { id: '2', name: '', weight: 0 }, // Lamb
    { id: '3', name: '', weight: 0 }, // Pork
    { id: '4', name: '', weight: 0 }, // Poultry
    { id: '5', name: '', weight: 0 }, // Fish or shellfish
    { id: '6', name: '', weight: 0 }  // Eggs, cheese or dairy
  ],
  1: [ // 水果蔬菜 - 2 items
    { id: '1', name: '', weight: 0 }, // Fruits
    { id: '2', name: '', weight: 0 }  // Vegetables
  ],
  2: [ // 谷物主食 - 3 items
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

// 动物产品slider处理方法
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

// 水果蔬菜slider处理方法
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

// 谷物主食slider处理方法
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
const calculateCarbonFootprint = (answers: FoodAnswers) => {
  const dietaryPreference = answers.dietary_preference || 'omnivore'
  const vegFruitKg = answers.veg_fruit_kg || 0
  const meatKg = answers.meat_kg || 0
  const grainsKg = answers.grains_kg || 0
  const otherKg = answers.other_kg || 0
  const dairyConsumption = answers.dairy || 0
  const localFoodPercentage = answers.local_food_percentage || 0
  const organicFoodPercentage = answers.organic_food_percentage || 0
  const foodWaste = answers.waste || 0
  const cookingFrequency = answers.cooking_frequency || 0
  const mockResult = {
    totalFootprint: '15.6',
    breakdown: {
      diet: 2.5,
      meat: 8.2,
      dairy: 3.1,
      local: -0.5,
      organic: -0.3,
      waste: 1.8,
      cooking: 0.8
    },
    details: {
      dietType: dietaryPreference,
      meatConsumption: meatKg,
      dairyConsumption: dairyConsumption,
      localPercentage: localFoodPercentage,
      organicPercentage: organicFoodPercentage,
      foodWaste: foodWaste,
      cookingFrequency: cookingFrequency
    },
    breakdownCards: [
      {
        title: 'Diet & Consumption Breakdown',
        data: {
          diet: 2.5,
          meat: 8.2,
          dairy: 3.1
        }
      },
      {
        title: 'Sustainability & Waste Details',
        data: {
          local: -0.5,
          organic: -0.3,
          waste: 1.8,
          cooking: 0.8
        }
      }
    ]
  }

  return mockResult
}

// Convert food calculator data to API format
const convertFoodDataForAPI = (data: FoodAnswers) => {
  // Transform the food answers into the new API format with foodItems array
  const foodItems = []
  
  // Helper function to convert slider value to frequency string
  const getFrequencyString = (value: number) => {
    const frequency = frequencyLabels.find(f => f.value === value)
    return frequency ? frequency.label : 'Never'
  }
  
  // Check if user has submitted detailed data from popups
  const hasDetailedData = Object.keys(detailData.value).length > 0
  
  if (hasDetailedData) {
    // Use detailed data from popups (user clicked "ADD DETAILS..." and submitted)
    // Map question indices to categories
    const categoryMapping = {
      0: 'animal',    // Animal products
      1: 'plant',     // Fruits and vegetables  
      2: 'grain'      // Grains and staples
    }
    
    Object.keys(detailData.value).forEach(questionIndex => {
      const index = parseInt(questionIndex)
      const category = categoryMapping[index as keyof typeof categoryMapping]
      if (!category) return
      
      const items = detailData.value[questionIndex]
      const detailedItems: Array<{type: string, frequency: string}> = []
      
      items.forEach((item: any) => {
        // Check if this is a slider-based detailed modal (weight > 0 but name might be empty)
        // or a dropdown-based modal (name exists and weight > 0)
        if (item.weight > 0) {
          let mappedType = ''
          let frequency = getFrequencyString(item.weight)
          
          // If name exists, this is dropdown-based detailed modal
          if (item.name && item.name.trim() !== '') {
            // Map specific food types to the new API format
            mappedType = item.name
            
            // Map animal product types
            if (category === 'animal') {
              if (item.name.toLowerCase().includes('beef')) mappedType = 'Beef'
              else if (item.name.toLowerCase().includes('lamb')) mappedType = 'Lamb'
              else if (item.name.toLowerCase().includes('pork')) mappedType = 'Pork'
              else if (item.name.toLowerCase().includes('poultry') || item.name.toLowerCase().includes('chicken')) mappedType = 'Poultry'
              else if (item.name.toLowerCase().includes('fish') || item.name.toLowerCase().includes('seafood')) mappedType = 'Fish or shellfish'
              else if (item.name.toLowerCase().includes('egg') || item.name.toLowerCase().includes('dairy') || item.name.toLowerCase().includes('cheese')) mappedType = 'Eggs, cheese or dairy'
            }
            // Map plant types
            else if (category === 'plant') {
              if (item.name.toLowerCase().includes('fruit')) mappedType = 'Fruits'
              else if (item.name.toLowerCase().includes('vegetable')) mappedType = 'Vegetables'
            }
            // Map grain types
            else if (category === 'grain') {
              if (item.name.toLowerCase().includes('rice')) mappedType = 'Rice'
              else if (item.name.toLowerCase().includes('noodle')) mappedType = 'Noodles'
              else if (item.name.toLowerCase().includes('bread')) mappedType = 'Bread'
            }
          } else {
            // This is slider-based detailed modal - map based on category and item index
            if (category === 'animal') {
              const animalTypes = ['Beef', 'Lamb', 'Pork', 'Poultry', 'Fish or shellfish', 'Eggs, cheese or dairy']
              mappedType = animalTypes[parseInt(item.id) - 1] || 'Beef'
            } else if (category === 'plant') {
              const plantTypes = ['Fruits', 'Vegetables']
              mappedType = plantTypes[parseInt(item.id) - 1] || 'Fruits'
            } else if (category === 'grain') {
              const grainTypes = ['Rice', 'Noodles', 'Bread']
              mappedType = grainTypes[parseInt(item.id) - 1] || 'Rice'
            }
          }
          
          if (mappedType) {
            detailedItems.push({
              type: mappedType,
              frequency: frequency
            })
          }
        }
      })
      
      if (detailedItems.length > 0) {
        // Find the highest frequency in detailed items to set as category frequency
        const frequencyOrder = ['Never', 'Infrequently', 'Occasionally', 'Often', 'Very Often']
        const highestFrequency = detailedItems.reduce((highest, item) => {
          const currentIndex = frequencyOrder.indexOf(item.frequency)
          const highestIndex = frequencyOrder.indexOf(highest)
          return currentIndex > highestIndex ? item.frequency : highest
        }, 'Never')
        
        foodItems.push({
          category: category,
          frequency: highestFrequency, // Use highest frequency from detailed items
          detailed: detailedItems
        })
      }
    })
    
    // Add categories without detailed data using simple frequency
    const categoriesWithDetails = Object.keys(detailData.value).map(q => categoryMapping[parseInt(q) as keyof typeof categoryMapping])
    const allCategories = ['animal', 'plant', 'grain']
    
    allCategories.forEach(category => {
      if (!categoriesWithDetails.includes(category)) {
        // Map category names to actual data field names
        const fieldMapping = {
          'animal': 'animal_products_frequency',
          'plant': 'fruit_veg_frequency',
          'grain': 'grain_frequency'
        }
        const fieldName = fieldMapping[category as keyof typeof fieldMapping]
        const frequency = getFrequencyString(Number(data[fieldName]) || 0)
        if (frequency !== 'Never') {
          foodItems.push({
            category: category,
            frequency: frequency
          })
        }
      }
    })
  } else {
    // Use simple frequency approach (user didn't click "ADD DETAILS...")
    // Get frequency values from slider answers
    const animalFrequency = getFrequencyString(Number(data.animal_products_frequency) || 0)
    const plantFrequency = getFrequencyString(Number(data.fruit_veg_frequency) || 0)
    const grainFrequency = getFrequencyString(Number(data.grain_frequency) || 0)
    
    // Add animal products if frequency is not "Never"
    if (animalFrequency !== 'Never') {
      foodItems.push({
        category: 'animal',
        frequency: animalFrequency
      })
    }
    
    // Add plant products if frequency is not "Never"
    if (plantFrequency !== 'Never') {
      foodItems.push({
        category: 'plant',
        frequency: plantFrequency
      })
    }
    
    // Add grain products if frequency is not "Never"
    if (grainFrequency !== 'Never') {
      foodItems.push({
        category: 'grain',
        frequency: grainFrequency
      })
    }
  }
  
  const apiData = {
    foodItems: foodItems
  }
  
  console.log('Converting food data for API:', apiData)
  console.log('Raw answers data:', data)
  console.log('Has detailed data:', hasDetailedData)
  console.log('Detail data:', detailData.value)
  return apiData
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
const getSliderProgress = (slider: any) => {
  const value = answers.value[slider.id] !== undefined ? answers.value[slider.id] : slider.defaultValue
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

// 获取当前问题的详情项目
const getCurrentDetailItems = () => {
  return detailItems.value[currentQuestionIndex.value] || []
}

// 获取项目类型名称
const getItemType = () => {
  const types = {
    0: 'Animal Product',
    1: 'Fruit/Vegetable',
    2: 'Grain/Staple'
  }
  return types[currentQuestionIndex.value as keyof typeof types] || 'Item'
}

// 导入图片
import vegetableImg from '@/assets/img/vegetable.png'
import proteinsImg from '@/assets/img/proteins.png'
import ramenImg from '@/assets/img/ramen.png'
import cheeseImg from '@/assets/img/cheese.png'
import addIcon from '@/assets/img/add.png'

// 动物产品图标
import beefImg from '@/assets/img/beef.png'
import lambImg from '@/assets/img/lamb.png'
import porkImg from '@/assets/img/pork.png'
import foodImg from '@/assets/img/food.png'
import fishImg from '@/assets/img/fish.png'

// 水果蔬菜图标
import appleImg from '@/assets/img/apple.png'
import broccoliImg from '@/assets/img/broccoli.png'

// 谷物主食图标
import riceImg from '@/assets/img/rice.png'
import noodlesImg from '@/assets/img/noodles.png'
import baguetteImg from '@/assets/img/baguette.png'

// 图标映射
const iconMap: Record<string, string> = {
  'proteins': proteinsImg,
  'vegetable': vegetableImg,
  'ramen': ramenImg,
  'cheese': cheeseImg
}

// 获取标题图标
const getHeaderIcon = () => {
  const icons = {
    0: proteinsImg,   // 问题1 - 动物产品
    1: vegetableImg,  // 问题2 - 水果蔬菜
    2: ramenImg       // 问题3 - 谷物主食
  }
  return icons[currentQuestionIndex.value as keyof typeof icons] || proteinsImg
}


// 获取选项列表
const getItemOptions = () => {
  const categoryIndex = currentQuestionIndex.value
  return foodOptions.value[categoryIndex] || []
}

// 添加详情行
const addDetailRow = () => {
  const currentItems = detailItems.value[currentQuestionIndex.value]
  if (currentItems.length >= 20) {
    showLimitMessage.value = true
    setTimeout(() => {
      showLimitMessage.value = false
    }, 3000)
    return
  }
  const newId = (currentItems.length + 1).toString()
  currentItems.push({ id: newId, name: '', weight: 0 })
}

// 删除详情行
const removeDetailRow = (index: number) => {
  const currentItems = detailItems.value[currentQuestionIndex.value]
  if (currentItems.length > 1) {
    currentItems.splice(index, 1)
  }
}

const saveDetailData = () => {
  // 保存当前问题的详情数据
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
  
  // 关闭弹框
  closeDetailModal()
  
  console.log('保存的详情数据:', updatedItems)
}



// 初始化默认值
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

/* 单选题样式 */
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

/* 滑块样式 */
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
  margin: 0 30px;
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
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #3d7c4a;
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

/* 文本输入样式 */
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


/* 响应式设计 */
@media (max-width: 768px) {
  .combined-vehicle-container {
    padding: 15px 20px;
  }
  
  .text_5 {
    font-size: 24px;
  }
  
  .options-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .text_10 {
    font-size: 12px;
    padding: 8px 16px;
    letter-spacing: 0.3px;
    min-width: 350px;
  }
}

@media (max-width: 480px) {
  .text_10 {
    font-size: 11px;
    padding: 6px 12px;
    letter-spacing: 0.2px;
    min-width: 300px;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 13px;
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

/* 详情弹框样式 */
.detail-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 10000;
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

/* 食物详情样式 */
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

/* 动物产品详情样式 */
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
  margin: 0 10px;
  height: 20px;
}

.product-slider .unit-box {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  min-width: 80px;
}

/* 动物产品slider的拖动手柄样式 - 更小的尺寸 */
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

/* 水果蔬菜详情样式 */
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
  margin: 0 10px;
  height: 20px;
}

.item-slider .unit-box {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  min-width: 80px;
}

/* 水果蔬菜slider的拖动手柄样式 - 更小的尺寸 */
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
  margin: 0 10px;
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




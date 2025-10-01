<template>
    <div class="page flex-col">
      <TopTravel>
        <div class="combined-vehicle-container">
          <div class="title-container">
            <span class="text_5">
              {{ currentQuestion.question }}
            </span>
          </div>
  
          <div class="sliders-container">
            <div v-for="slider in currentQuestion.sliders" :key="slider.id" class="slider-group">
              <div class="slider-container">
                <div class="slider-content">
                  <div class="slider-row">
                    <div class="slider-label">{{ slider.label }}</div>
                    <div class="box_6 flex-col" :style="{ '--slider-progress': getSliderProgress(slider) }">
                      <div class="slider-labels">
                        <span class="min-label">{{ slider.min }}</span>
                        <span class="max-label">{{ slider.max }}</span>
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
                        :style="{ '--thumb-icon': `url(${slider.iconPath})` }"
                      >
                      <div class="current-value" :style="{ '--slider-progress': getSliderProgress(slider) }">
                        {{ answers[slider.id] || slider.defaultValue }}
                      </div>
                    </div>
                    <span class="unit-box" style="white-space: nowrap;">{{ slider.unit ? '' + slider.unit : '' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 详情按钮 -->
            <div class="details-section">
              <button class="text_10" @click="showDetailModal">
                ADD DETAILS TO IMPROVE ACCURACY
              </button>
            </div>
          </div>
  
          <div class="progress-container">
            <div class="progress-dots">
              <span v-for="n in shoppingQuestions.length" :key="n" class="dot" :class="{ active: n <= currentQuestionIndex + 1 }"></span>
            </div>
            <div class="progress-text">
              {{ currentQuestionIndex + 1 }} / {{ shoppingQuestions.length }}
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
      </TopTravel>
  
      <!-- 详情弹框 -->
      <div v-if="isDetailModalVisible" class="detail-modal" @click="closeDetailModal">
        <div class="modal-content" @click.stop>
          <h3>{{ getDetailModalTitle() }}</h3>
          <div class="modal-section">
            <div class="shopping-details">
              <div class="detail-header">
                <div class="header-icon-container">
                  <img :src="getHeaderIcon()" :alt="getItemType()" class="header-icon" />
                </div>
                <div class="header-labels">
                  <span class="label-text">Name</span>
                  <span class="label-text">Spend (RM)</span>
                </div>
                <div class="add-button" :class="{ 'disabled': getCurrentDetailItems().length >= 20 }">
                  <img :src="addIcon" alt="Add" @click="addDetailRow" />
                </div>
              </div>
              
              <!-- Limit message -->
              <div v-if="showLimitMessage" class="limit-message">
                Maximum 20 items allowed per category
              </div>
              
              <div v-for="(item, index) in getCurrentDetailItems()" :key="item.id" class="detail-row">
                <div class="row-number">{{ index + 1 }}</div>
                
                <div class="name-select">
                  <SearchableDropdown
                    v-model="item.name"
                    :options="getItemOptions()"
                    :placeholder="isLoading ? 'Loading all options...' : 
                                 errorStates[currentQuestionIndex] ? 'Error loading options' : 
                                 `Select ${getItemType()}`"
                    :disabled="isLoading"
                  />
                  <div v-if="errorStates[currentQuestionIndex]" class="error-message">
                    {{ errorStates[currentQuestionIndex] }}
                  </div>
                </div>
                
                <div class="weight-input">
                  <input 
                    type="number" 
                    v-model.number="item.weight" 
                    class="custom-input"
                    min="0" 
                    max="10000" 
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                <div class="delete-button" @click="removeDetailRow(index)">Delete</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDetailModal" class="btn btn-secondary">Cancel</button>
            <button @click="saveDetailData(); nextQuestion();" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </div>

      <!-- Error message display -->
      <div v-if="calculationError" class="error-message">
        {{ calculationError }}
      </div>
      
      <!-- 聊天机器人组件 -->
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import TopTravel from '../travel/travel_components/top_travel.vue'
  import { shoppingQuestions, type ShoppingAnswers, calculateShoppingCarbonFootprint } from '@/data/shoppingQuestions'
import { getShoppingDropdownData, initializeShoppingDropdownData } from '@/services/dropdownData'
import SearchableDropdown from '@/views/components/SearchableDropdown.vue'
  
  const router = useRouter()
  const currentQuestionIndex = ref(0)
  const answers = ref<ShoppingAnswers>({})
  
  // API data management
  const shoppingOptions = ref<Record<number, string[]>>({})
  const isLoading = ref(false)
  const errorStates = ref<Record<number, string | null>>({})
  
  // 定义事件
  const emit = defineEmits<{
    'question-change': [index: number]
  }>()
  
  // Initialize shopping options from global service
  const initializeShoppingOptions = async () => {
    if (isLoading.value) {
      return // Already loading
    }
  
    isLoading.value = true
    errorStates.value = {}
  
    try {
      // First try to get cached data
      const cachedData = getShoppingDropdownData()
      if (cachedData.shoppingOptions) {
        shoppingOptions.value = cachedData.shoppingOptions
        if (cachedData.error) {
          errorStates.value = cachedData.error
        }
        console.log('Using cached shopping options:', shoppingOptions.value)
      } else {
        // If no cached data, initialize from global service
        const result = await initializeShoppingDropdownData()
        shoppingOptions.value = result.shoppingOptions || {}
        if (result.error) {
          errorStates.value = result.error
        }
        console.log('Initialized shopping options from global service:', shoppingOptions.value)
      }
    } catch (error) {
      console.error('Failed to load shopping options:', error)
      // Initialize with empty arrays for all categories
      shoppingOptions.value = { 0: [], 1: [], 2: [] }
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

  // Load all shopping options on component mount
  onMounted(() => {
    initializeShoppingOptions()
  })
  const isDetailModalVisible = ref(false)
  const detailData = ref<Record<string, any>>({})
  const showLimitMessage = ref(false)
  
  // Initialize detailItems with default values
  const getDefaultDetailItems = () => ({
    0: [{ id: '1', name: '', weight: 0 }, { id: '2', name: '', weight: 0 }], // 问题1 - 杂货和饮料
    1: [{ id: '1', name: '', weight: 0 }, { id: '2', name: '', weight: 0 }], // 问题2 - 家居和生活用品
    2: [{ id: '1', name: '', weight: 0 }, { id: '2', name: '', weight: 0 }]  // 问题3 - 服装和配饰
  })

  // Load detailItems from localStorage or use defaults
  const loadDetailItemsFromStorage = () => {
    try {
      const stored = localStorage.getItem('greenpulse_shopping_detail_items')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure all categories exist
        const defaults = getDefaultDetailItems()
        return { ...defaults, ...parsed }
      }
    } catch (error) {
      console.error('Error loading detail items from localStorage:', error)
    }
    return getDefaultDetailItems()
  }

  // Save detailItems to localStorage
  const saveDetailItemsToStorage = (items: Record<string, Array<{id: string, name: string, weight: number}>>) => {
    try {
      localStorage.setItem('greenpulse_shopping_detail_items', JSON.stringify(items))
    } catch (error) {
      console.error('Error saving detail items to localStorage:', error)
    }
  }

  const detailItems = ref<Record<string, Array<{id: string, name: string, weight: number}>>>(loadDetailItemsFromStorage())
  
  // Watch for changes in detailItems and save to localStorage
  watch(detailItems, (newItems) => {
    saveDetailItemsToStorage(newItems)
  }, { deep: true })
  
  const currentQuestion = computed(() => shoppingQuestions[currentQuestionIndex.value])

// Loading state for calculations
const isCalculating = ref(false)
const calculationError = ref<string | null>(null)
  
  const updateSliderValue = (sliderId: string, event: Event) => {
    const target = event.target as HTMLInputElement
    const value = Number(target.value)
    answers.value[sliderId] = value
  }
  
  const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--
    }
  }
  
  const nextQuestion = async () => {
    if (currentQuestionIndex.value < shoppingQuestions.length - 1) {
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
            type: 'shopping',
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
  
  // 初始化默认值
  shoppingQuestions.forEach(question => {
    question.sliders.forEach(slider => {
      if (!(slider.id in answers.value)) {
        answers.value[slider.id] = slider.defaultValue
      }
    })
  })
  
  const getSliderProgress = (slider: any) => {
    const value = answers.value[slider.id] || slider.defaultValue
    const progress = ((value - slider.min) / (slider.max - slider.min)) * 100
    return `${progress}%`
  }
  
  // 导入图片
  import fastFoodImg from '@/assets/img/fast-food.png'
  import furnitureImg from '@/assets/img/furniture.png'
  import maleClothesImg from '@/assets/img/male-clothes.png'
  import addIcon from '@/assets/img/add.png'
  
  const showDetailModal = () => {
    isDetailModalVisible.value = true
  }
  
  const closeDetailModal = () => {
    isDetailModalVisible.value = false
  }
  
  const getDetailModalTitle = () => {
    const titles = {
      0: 'Groceries and Beverages Details',
      1: 'Home and Lifestyle Details',
      2: 'Clothing and Accessories Details'
    }
    return titles[currentQuestionIndex.value as keyof typeof titles] || 'Details'
  }
  
  const getCurrentDetailItems = () => {
    return detailItems.value[currentQuestionIndex.value] || []
  }
  
  const getItemType = () => {
    const types = {
      0: 'Grocery Item',
      1: 'Home Item',
      2: 'Clothing Item'
    }
    return types[currentQuestionIndex.value as keyof typeof types] || 'Item'
  }
  
  const getHeaderIcon = () => {
    const icons = {
      0: fastFoodImg,  // 问题1 - 杂货和饮料
      1: furnitureImg, // 问题2 - 家居和生活用品
      2: maleClothesImg // 问题3 - 服装和配饰
    }
    return icons[currentQuestionIndex.value as keyof typeof icons] || fastFoodImg
  }
  
  const getItemOptions = () => {
    const categoryIndex = currentQuestionIndex.value
    return shoppingOptions.value[categoryIndex] || []
  }
  
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
  
  const removeDetailRow = (index: number) => {
    const currentItems = detailItems.value[currentQuestionIndex.value]
    if (currentItems.length > 1) {
      currentItems.splice(index, 1)
    }
  }
  
  const saveDetailData = () => {
    const currentItems = detailItems.value[currentQuestionIndex.value]
    detailData.value[currentQuestionIndex.value] = [...currentItems]
    closeDetailModal()
    console.log('保存的详情数据:', currentItems)
  }
  </script>
  
  <style scoped>
  .page {
    background-color: rgba(255, 255, 255, 0.2);
    position: relative;
    width: 100%;
    min-height: 500px;
    overflow-x: hidden;
    font-family: var(--font-display);
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
    flex-shrink: 0;
    margin-right: 120px;
    color: black;
  }
  
  .slider-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 60px;
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
  
  /* Details section */
  .details-section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
    width: 100%;
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
    min-width: 500px;
    width: auto;
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
    padding: 10px;
    border-radius: 20px;
    max-width: 700px;
    width: 90%;
    height: auto;
    max-height: calc(100vh - 150px);
    overflow: hidden;
    min-height: 250px;
    font-family: var(--font-display);
    box-shadow: 0 12px 48px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.2);
    display: flex;
    flex-direction: column;
  }
  
  .modal-content h3 {
    color: rgba(61, 124, 74, 1);
    font-size: 18px;
    margin-bottom: 10px;
    text-align: center;
    border-bottom: 2px solid rgba(61, 124, 74, 0.2);
    padding-bottom: 6px;
  }
  
  .modal-section {
    margin-bottom: 12px;
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    min-height: 0;
    max-height: 200px;
  }

  /* Show scrollbar for modal section */
  .modal-section::-webkit-scrollbar {
    width: 12px;
  }

  .modal-section::-webkit-scrollbar-track {
    background: #e0e0e0;
    border-radius: 6px;
  }

  .modal-section::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 6px;
    border: 2px solid #e0e0e0;
  }

  .modal-section::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .modal-section {
    scrollbar-width: auto;  /* Firefox */
    scrollbar-color: #888 #e0e0e0;  /* Firefox */
  }

  /* Allow dropdown to overflow in detail sections */
  .shopping-details .modal-section {
    overflow: visible;
  }

  /* Ensure dropdown containers allow overflow */
  .name-select {
    position: relative;
    z-index: 1;
    overflow: visible;
  }

  /* Allow dropdown to overflow in all modal sections */
  .modal-section .searchable-dropdown {
    position: relative;
    z-index: 1;
    overflow: visible;
  }

  /* Ensure detail rows allow dropdown overflow and don't interfere with stacking */
  .detail-row {
    overflow: visible;
    position: relative;
    z-index: 1;
  }

  /* Ensure the shopping details container allows overflow */
  .shopping-details {
    overflow: visible;
  }

  /* When a dropdown is open, ensure it's above other rows */
  .detail-row.dropdown-open {
    z-index: 100000;
  }

  
  /* 购物详情样式 */
  .shopping-details {
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
  </style>
  
<template>
  <div class="page flex-col">
    <TopTravel>
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
            <RouterLink to="/calculator/household" class="mobile-nav-btn active">
              <span>House</span>
            </RouterLink>
            <RouterLink to="/calculator/food" class="mobile-nav-btn">
              <span>Food</span>
            </RouterLink>
            <RouterLink to="/calculator/shopping" class="mobile-nav-btn">
              <span>Shopping</span>
            </RouterLink>
          </div>
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
        </div>

        <div class="progress-container">
          <div class="progress-dots">
            <span v-for="n in householdQuestions.length" :key="n" class="dot" :class="{ active: n <= currentQuestionIndex + 1 }"></span>
          </div>
          <div class="progress-text">
            {{ currentQuestionIndex + 1 }} / {{ householdQuestions.length }}
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

    <!-- Error message display -->
    <div v-if="calculationError" class="error-message">
      {{ calculationError }}
    </div>
    
    <!-- 聊天机器人组件 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TopTravel from './travel/travel_components/top_travel.vue'
import { householdQuestions, type HouseholdAnswers, calculateHouseholdCarbonFootprint } from '@/data/householdQuestions'

const router = useRouter()
const currentQuestionIndex = ref(0)
const answers = ref<HouseholdAnswers>({})

// 定义事件
const emit = defineEmits<{
  'question-change': [index: number]
}>()

// 监听问题索引变化并发射事件
watch(currentQuestionIndex, (newIndex) => {
  emit('question-change', newIndex)
}, { immediate: true })

const currentQuestion = computed(() => householdQuestions[currentQuestionIndex.value])

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
  if (currentQuestionIndex.value < householdQuestions.length - 1) {
    currentQuestionIndex.value++
  } else {
    // Last question - navigate to result page with raw input data
    try {
      isCalculating.value = true
      calculationError.value = null
      
      // Prepare raw input data for Result.vue to process
      console.log('Current answers before navigating to result:', answers.value)
      
      // Navigate to result page with raw input data
      router.push({
        path: '/result',
        query: {
          type: 'household',
          data: JSON.stringify(answers.value)
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
householdQuestions.forEach(question => {
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
</script>

<style scoped>
.page {
  background-color: rgba(255, 255, 255, 0.4);
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
  margin-bottom: 20px;
  flex: 1;
  min-width: 0;
  margin-top: 40px;
}

.slider-label {
  width: 80px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
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
  color: black;
}

.error-message {
  color: #e53e3e;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
  font-family: var(--font-display);
}

.loading-text {
  color: #666;
  font-size: 12px;
  font-family: var(--font-display);
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
}
</style>

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
            <RouterLink to="/calculator/travel" class="mobile-nav-btn active">
              <span>Travel</span>
            </RouterLink>
            <RouterLink to="/calculator/household" class="mobile-nav-btn">
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
          <div v-for="vehicle in currentQuestion.vehicles" :key="vehicle.id" class="slider-group">
            <div class="slider-container">
              <div class="slider-content">
                <div class="slider-row">
                  <div class="slider-label">{{ vehicle.label }}</div>
                  <div class="box_6 flex-col" :style="{ '--slider-progress': getSliderProgress(vehicle) }">
                    <div class="slider-labels">
                      <span class="min-label">{{ vehicle.min }}</span>
                      <span class="max-label">{{ vehicle.max }}</span>
                    </div>
                    <input
                      type="range"
                      class="gradient-slider"
                      :min="vehicle.min"
                      :max="vehicle.max"
                      :value="answers[vehicle.id] || vehicle.defaultValue"
                      :step="vehicle.step"
                      :id="`slider-${vehicle.id}`"
                      @input="updateVehicleValue(vehicle.id, $event)"
                      :style="{ '--thumb-icon': `url(${vehicle.iconPath})` }"
                    >
                    <div class="current-value" :style="{ '--slider-progress': getSliderProgress(vehicle) }">
                      {{ answers[vehicle.id] || vehicle.defaultValue }}
                    </div>
                  </div>
                  <span class="unit-box" style="white-space: nowrap;">{{ vehicle.unit ? '' + vehicle.unit : '' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Details Link -->
        <div class="details-section">
          <button @click="openDetailModal" class="text_10">
            ADD DETAILS TO IMPROVE ACCURACY
          </button>
        </div>

        <div class="progress-container">
          <div class="progress-dots">
            <span v-for="n in travelQuestions.length" :key="n" class="dot" :class="{ active: n <= currentQuestionIndex + 1 }"></span>
          </div>
          <div class="progress-text">
            {{ currentQuestionIndex + 1 }} / {{ travelQuestions.length }}
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
            <button class="nav-button next-button" @click="nextQuestion">
              <img class="nav-icon next-icon" referrerpolicy="no-referrer"
                src="https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG6ba226656a30c6810fd48a78752accc9.png"
                alt="Next" />
            </button>
          </div>
        </div>
      </div>
    </TopTravel>
    
    <!-- Detail Modal -->
    <DetailModal
      :is-visible="isDetailModalVisible"
      :title="getModalTitle()"
      :modal-type="getModalType()"
      :initial-data="currentDetailData"
      @close="closeDetailModal"
      @save="saveDetailData"
      @next="nextQuestion"
    />
    
    <!-- 聊天机器人组件 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TopTravel from './travel_components/top_travel.vue'
import DetailModal from './travel_components/DetailModal.vue'
import { travelQuestions, type TravelAnswers, calculateTravelCarbonFootprint } from '@/data/travelQuestions'

const router = useRouter()

// 当前问题索引
const currentQuestionIndex = ref(0)

// 定义事件
const emit = defineEmits<{
  'question-change': [index: number]
}>()

// 监听问题索引变化并发射事件
watch(currentQuestionIndex, (newIndex) => {
  emit('question-change', newIndex)
}, { immediate: true })

// 获取问题配置
const currentQuestion = computed(() => travelQuestions[currentQuestionIndex.value])
const answers = ref<TravelAnswers>({})

// 详情弹框相关状态
const isDetailModalVisible = ref(false)
const detailData = ref<Record<string, any>>({})

// 初始化答案
const initializeAnswers = () => {
  travelQuestions.forEach(question => {
    question.vehicles.forEach(vehicle => {
      if (!(vehicle.id in answers.value)) {
        answers.value[vehicle.id] = vehicle.defaultValue
      }
    })
  })
}

// 初始化
initializeAnswers()

// 更新车辆值
const updateVehicleValue = (vehicleId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  answers.value[vehicleId] = Number(target.value)
  
  // 保存到localStorage（保持向后兼容）
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)?.calculatorUtils?.saveSliderValues?.(`${vehicleId}_distance_1`, String(target.value))
  } catch {}
}

// 上一题
const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < travelQuestions.length - 1) {
    currentQuestionIndex.value++
  } else {
    // 最后一题，提交结果
    submitResults()
  }
}

// 提交结果
const submitResults = () => {
  // 合并基础答案和详情数据
  const combinedData = {
    ...answers.value,
    details: detailData.value
  }
  
  const result = calculateTravelCarbonFootprint(answers.value)
  
  // 合并原始答案和计算结果，这样Result.vue可以获取原始slider值
  const dataWithOriginalValues = {
    ...result,
    originalValues: answers.value  // 添加原始slider值
  }
  
  // 跳转到结果页面
  router.push({
    path: '/travel-result',
    query: {
      type: 'travel',
      data: JSON.stringify(dataWithOriginalValues),
      details: JSON.stringify(detailData.value)
    }
  })
}

// 获取滑块进度
const getSliderProgress = (vehicle: any) => {
  const value = answers.value[vehicle.id] || vehicle.defaultValue
  const progress = ((value - vehicle.min) / (vehicle.max - vehicle.min)) * 100
  return `${progress}%`
}

// 弹框相关方法
const openDetailModal = () => {
  isDetailModalVisible.value = true
}

const closeDetailModal = () => {
  isDetailModalVisible.value = false
}

const getModalTitle = () => {
  if (currentQuestionIndex.value === 0) {
    return 'Private Vehicle Details'
  } else {
    return 'Public Transport Details'
  }
}

const getModalType = () => {
  if (currentQuestionIndex.value === 0) {
    return 'private'
  } else {
    return 'public'
  }
}

const currentDetailData = computed(() => {
  return detailData.value[currentQuestionIndex.value] || {}
})

const saveDetailData = (data: any) => {
  detailData.value[currentQuestionIndex.value] = data
  console.log('保存的详情数据:', data)
  nextQuestion() // 保存数据后自动跳转到下一个问题
}

onMounted(() => {
  // Load existing values from localStorage
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const utils = (window as any)?.calculatorUtils
    if (utils?.getSliderValue) {
      currentQuestion.value.vehicles.forEach(vehicle => {
        const savedValue = utils.getSliderValue(`${vehicle.id}_distance_1`, vehicle.defaultValue)
        answers.value[vehicle.id] = savedValue
      })
    }
  } catch {}

  // Body load fade
  window.addEventListener('load', function () {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.5s ease-in'
    setTimeout(() => {
      document.body.style.opacity = '1'
    }, 100)
  })
})
</script>

<style>
@import '@/assets/css/style.css';
</style>

<style scoped>
.page {
  background-color: rgba(255, 255, 255, 0.2);
  position: relative;
  width: 100%;
  overflow-x: hidden;
}

.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
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

.car-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  margin-top: -10px;
}

.mtc-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  margin-top: -10px;
}


/* Synchronized hover effects */
.car-img:hover,
.mtc-image:hover {
  transform: scale(1.05) rotateY(5deg);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1) contrast(1.05);
}

.group_6 {
  width: 534px;
  height: 65px;
  margin-top: 14px;
  margin-left: 0px;
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

.text-wrapper_5 {
  width: 534px;
  height: 29px;
  margin-top: 14px;
}

.text_6 {
  width: 16px;
  height: 29px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 24px;
  font-family: var(--font-primary);
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.text_6:hover {
  color: rgba(61, 124, 74, 1);
  transform: scale(1.2);
  text-shadow: 0 2px 8px rgba(61, 124, 74, 0.4);
}

.text_7 {
  width: 96px;
  height: 29px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 24px;
  font-family: var(--font-primary);
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.text_7:hover {
  color: rgba(61, 124, 74, 1);
  transform: translateX(5px);
}

.text_10 {
  width: 446px;
  height: 29px;
  overflow-wrap: break-word;
  color: rgba(185, 174, 117, 1);
  font-size: 24px;
  font-family: var(--font-primary);
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.text_10:hover {
  color: rgba(61, 124, 74, 1);
  transform: translateY(-3px);
  text-shadow: 0 2px 8px rgba(61, 124, 74, 0.4);
}

/* Details section */
.details-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

/* Utility Classes */
.flex-col {
  display: flex;
  flex-direction: column;
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

/* Force mobile styles for testing */
@media (max-width: 1200px) {
  .gradient-slider::-webkit-slider-runnable-track,
  .gradient-slider::-moz-range-track {
    height: 32px !important;
    background: linear-gradient(to right, #e0e0e0, #81c263) !important;
    border-radius: 16px !important;
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2) !important;
  }
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

.unit-box {
  font-size: 24px;
  font-family: var(--font-display);
  color: black;
}

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
  cursor: pointer;
  white-space: nowrap;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: none;
  font-family: var(--font-display);
  min-width: 500px;
  width: auto;
}

.text_10:hover {
  background: linear-gradient(135deg, #4a8c5a, #3d6a47);
  color: white;
  transform: translateY(-2px);
  box-shadow: none;
}

.text_10:active {
  transform: translateY(0);
  background: linear-gradient(135deg, #2d5a37, #1e3d26);
  box-shadow: none;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.justify-between {
  justify-content: space-between;
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

/* Mobile Responsive Design */
@media (max-width: 1024px) {
  .page {
    padding: 0.5rem;
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
    max-width: 500px !important;
    margin: 0 !important;
  }
  
  .gradient-slider::-webkit-slider-runnable-track,
  .gradient-slider::-moz-range-track {
    height: 32px !important;
    background: linear-gradient(to right, #e0e0e0, #81c263) !important;
    border-radius: 16px !important;
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2) !important;
  }
  
  .gradient-slider::-webkit-slider-thumb,
  .gradient-slider::-moz-range-thumb {
    width: 40px !important;
    height: 40px !important;
    background-size: 30px 30px !important;
    transform: translateY(-50%) !important;
  }
  
  .combined-vehicle-container {
    gap: 1rem;
    padding: 5px 0;
  }
  
  .title-container {
    margin-bottom: 15px;
  }
  
  .text_5 {
    font-size: 1.2rem;
    text-align: center;
    padding: 0 1rem;
    width: 100%;
    line-height: 1.3;
  }
  
  .vehicle-section {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }
  
  .car-img,
  .mtc-image {
    width: 60px;
    height: 60px;
  }
  
  .group_6 {
    width: 100%;
    max-width: 300px;
  }
  
  .box_10 {
    width: 100%;
  }
  
  .text-wrapper_5 {
    font-size: 0.9rem;
  }
  
  .text_6,
  .text_7 {
    font-size: 0.9rem;
  }
  
  .text_10 {
    font-size: 12px;
    padding: 8px 16px;
    letter-spacing: 0.3px;
    min-width: 350px;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 0.25rem;
  }
  
  .combined-vehicle-container {
    gap: 0.8rem;
    padding: 5px 0;
  }
  
  .title-container {
    margin-bottom: 10px;
  }
  
  .text_5 {
    font-size: 1rem;
    padding: 0 0.5rem;
    width: 100%;
    line-height: 1.4;
  }
  
  .vehicle-section {
    padding: 0.8rem;
    gap: 0.8rem;
  }
  
  .car-img,
  .mtc-image {
    width: 50px;
    height: 50px;
  }
  
  .group_6 {
    max-width: 250px;
  }
  
  .text-wrapper_5 {
    font-size: 0.8rem;
  }
  
  .text_6,
  .text_7 {
    font-size: 0.8rem;
  }
  
  .text_10 {
    font-size: 11px;
    padding: 6px 12px;
    letter-spacing: 0.2px;
    min-width: 300px;
  }
}



/* Progress Bar Styles */
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5rem 0;
  padding: 0 2rem;
}

.progress-bar {
  width: 100%;
  max-width: 400px;
  height: 8px;
  background-color: rgba(236, 230, 168, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(61, 124, 74, 0.8) 0%, 
    rgba(51, 104, 64, 0.9) 50%,
    rgba(42, 94, 54, 1) 100%);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    transparent 100%);
}


.progress-text {
  font-size: 0.9rem;
  color: rgba(61, 124, 74, 0.8);
  font-weight: 600;
  text-align: center;
  font-family: var(--font-display);
}

/* Mobile responsive for progress bar */
@media (max-width: 768px) {
  .progress-container {
    margin: 1rem 0;
    padding: 0 1rem;
  }
  
  .progress-bar {
    max-width: 300px;
    height: 6px;
  }
  
  .progress-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .progress-container {
    margin: 0.8rem 0;
    padding: 0 0.5rem;
  }
  
  .progress-bar {
    max-width: 250px;
    height: 5px;
  }
  
  .progress-text {
    font-size: 0.75rem;
  }
}

/* Navigation Container */
.navigation-container {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  z-index: 100;
  pointer-events: none;
}




@media (max-width: 1024px) {
  .combined-vehicle-container {
    gap: 1rem;
    padding: 5px 0;
  }
  
  .title-container {
    margin-bottom: 15px;
  }
  
  .text_5 {
    font-size: 26px;
    padding: 0 15px;
  }
  
  .vehicle-section {
    gap: 18px;
    height: 75px;
  }
  
  .car-img,
  .mtc-image {
    width: 65px;
    height: 65px;
  }
  
  .box_10 {
    width: 400px;
    height: 20px;
  }
  
  .navigation-container {
    margin: 1.8rem 0;
    padding: 0 1.5rem;
    gap: 1.8rem;
  }
  

}

@media (max-width: 768px) {
  .combined-vehicle-container {
    gap: 0.8rem;
    padding: 5px 0;
  }
  
  .title-container {
    margin-bottom: 15px;
  }
  
  .text_5 {
    font-size: 24px;
    padding: 0 15px;
  }
  
  .vehicle-section {
    gap: 15px;
    height: 70px;
  }
  
  .car-img,
  .mtc-image {
    width: 60px;
    height: 60px;
  }
  
  .box_10 {
    width: 350px;
    height: 18px;
  }
  
  .navigation-container {
    margin: 1.5rem 0;
    gap: 1.5rem;
  }
  
  
}

@media (max-width: 480px) {
  .navigation-container {
    padding: 0 1rem;
  }

  
}
</style>

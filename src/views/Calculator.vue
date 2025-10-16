<template>
  <div class="calculator-page">
    <!-- Background Image -->
    <img class="background-image" :src="currentBackgroundImage" alt="Background" />

    <!-- Header -->
    <Header />

    <!-- Calculator Type Navigation -->


    <div class="main-box">
      <div class="btn-box">
        <div class="calculator-nav">
          <div class="calc-nav-main flex-column">
            <div class="nav-box" :class="{ active: currentCalculator === 'travel' }">
              <RouterLink to="/calculator/travel" class="calc-link">
                <span class="calc-text">Travel</span>
              </RouterLink>
            </div>

            <div class="nav-box" :class="{ active: currentCalculator === 'household' }">
              <RouterLink to="/calculator/household" class="calc-link">
                <span class="calc-text">House</span>
              </RouterLink>
            </div>

            <div class="nav-box" :class="{ active: currentCalculator === 'food' }">
              <RouterLink to="/calculator/food" class="calc-link">
                <span class="calc-text">Food</span>
              </RouterLink>
            </div>

            <div class="nav-box" :class="{ active: currentCalculator === 'shopping' }">
              <RouterLink to="/calculator/shopping" class="calc-link">
                <span class="calc-text">Shopping</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
      <div class="content-box">
        <div class="main-title">Carbon Calculator</div>
        <div class="main-content-box">
          <!-- Calculator Content -->
          <div class="calculator-content">
            <!-- Travel Calculator -->
            <div v-if="currentCalculator === 'travel'" class="calculator-section">
              <PrivateSimple @question-change="updateQuestionIndex" />
            </div>

            <!-- Household Calculator -->
            <div v-if="currentCalculator === 'household'" class="calculator-section">
              <HouseholdCalculator @question-change="updateQuestionIndex" />
            </div>

            <!-- Food Calculator -->
            <div v-if="currentCalculator === 'food'" class="calculator-section">
              <FoodCalculator @question-change="updateQuestionIndex" />
            </div>

            <!-- Shopping Calculator -->
            <div v-if="currentCalculator === 'shopping'" class="calculator-section">
              <ShoppingCalculator @question-change="updateQuestionIndex" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />

    <!-- 聊天机器人组件 -->
    <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/header.vue'
import PrivateSimple from './travel/PrivateSimple.vue'
import HouseholdCalculator from './HouseholdCalculator.vue'
import FoodCalculator from './food/FoodCalculator.vue'
import ShoppingCalculator from './shopping/ShoppingCalculator.vue'
import Footer from './components/footer.vue'
import ChatBot from './components/ChatBot.vue'

const route = useRoute()

// 当前计算器类型
const currentCalculator = ref<'travel' | 'household' | 'food' | 'shopping'>('travel')

// 当前问题索引（用于背景图片切换）
const currentQuestionIndex = ref(0)

// 导入背景图片
import img1 from '@/assets/img/1.png'
import img2 from '@/assets/img/2.png'
import img3 from '@/assets/img/3.png'
import img4 from '@/assets/img/4.png'
import img5 from '@/assets/img/5.png'
import img6 from '@/assets/img/6.jpg'
import img7 from '@/assets/img/7.png'
import img8 from '@/assets/img/8.png'
import img9 from '@/assets/img/9.png'
import img10 from '@/assets/img/6.jpg'
import img11 from '@/assets/img/7.png'
import img12 from '@/assets/img/12.png'
import img13 from '@/assets/img/13.png'
import img14 from '@/assets/img/14.png'

// 背景图片数组
const backgroundImages = [
  img1, img2, img3, img4, img5, img6, img7, img8, 
  img9, img10, img11, img12, img13, img14
]

// 计算当前背景图片
const currentBackgroundImage = computed(() => {
  // 根据计算器类型和问题索引计算全局问题编号
  let globalQuestionIndex = 0
  
  if (currentCalculator.value === 'travel') {
    globalQuestionIndex = currentQuestionIndex.value // 0-1
  } else if (currentCalculator.value === 'household') {
    globalQuestionIndex = 2 + currentQuestionIndex.value // 2-4
  } else if (currentCalculator.value === 'food') {
    globalQuestionIndex = 5 + currentQuestionIndex.value // 5-10
  } else if (currentCalculator.value === 'shopping') {
    globalQuestionIndex = 11 + currentQuestionIndex.value // 11-13
  }
  
  return backgroundImages[globalQuestionIndex] || img1
})

// 根据路由参数设置当前计算器
const setCurrentCalculator = () => {
  const type = route.params.type as string
  if (['travel', 'household', 'food', 'shopping'].includes(type)) {
    currentCalculator.value = type as 'travel' | 'household' | 'food' | 'shopping'
  } else {
    currentCalculator.value = 'travel'
  }
  // 切换计算器时重置问题索引
  currentQuestionIndex.value = 0
}

// 更新问题索引的方法
const updateQuestionIndex = (index: number) => {
  currentQuestionIndex.value = index
}

// 监听路由变化
watch(() => route.params.type, setCurrentCalculator)

// 初始化
onMounted(() => {
  setCurrentCalculator()
  // 确保页面滚动到顶部
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.calculator-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.calculator-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70px;
  margin-top: 0;
  background-color: transparent;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.calc-nav-main {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.nav-box {
  border: 2px solid transparent;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.5);
  height: 50px;
  width: 150px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  background-clip: padding-box;
  background-origin: border-box;
}

.nav-box::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #3d7c4a, #ffffff, #3d7c4a, #ffffff);
  background-size: 400% 400%;
  border-radius: 40px;
  z-index: -1;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.nav-box:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.nav-box.active {
  background: #f5dbc6;
  position: relative;
}

.nav-box.active::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #3d7c4a, #ffffff, #3d7c4a, #ffffff);
  background-size: 400% 400%;
  border-radius: 40px;
  z-index: 1;
  animation: gradientShift 2s ease infinite;
}

.nav-box.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5dbc6;
  border-radius: 38px;
  z-index: 2;
}

.calc-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-decoration: none;
  color: inherit;
  position: relative;
  z-index: 3;
}

.calc-text {
  font-size: 16px;
  font-weight: 600;
  color: #3d7c4a;
  text-transform: uppercase;
  transition: all 0.3s ease;
  font-family: "DengXian", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
}


.calculator-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.calculator-section {
  animation: fadeIn 0.5s ease-in-out;
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-box {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    flex-direction: column !important;
  }

  .btn-box {
    display: none !important;
  }

  .calculator-nav {
    margin-top: 0;
    padding: 15px;
    width: 100% !important;
  }

  .calc-nav-main {
    flex-direction: row !important;
    gap: 10px !important;
    height: auto;
    margin-top: 15px;
    justify-content: space-around !important;
  }

  .nav-box {
    width: auto !important;
    height: 50px !important;
    flex: 1 !important;
    margin: 0 5px !important;
    margin-bottom: 0 !important;
  }

  .calc-text {
    font-size: 14px !important;
  }

  .content-box {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 20px 10px !important;
  }

  .main-content-box {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .calculator-content {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .main-title {
    color: #000 !important;
    font-weight: 700 !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
  }
}

@media (max-width: 480px) {
  .calculator-nav {
    margin-top: 80px;
    padding: 0 10px;
  }

  .calc-nav-main {
    gap: 20px;
    margin-top: 10px;
  }

  .nav-box {
    width: 120px;
    height: 50px;
    margin-bottom: 10px;
  }

  .calc-text {
    font-size: 12px;
  }

}

/* Utilities */
.flex-row {
  display: flex;
  gap: 40px;
}

.flex-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Main container */
.main-box {
  width: 90%;
  flex: 1;
  min-height: calc(100vh - 200px);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin: 140px auto 200px auto;
  padding: 20px 40px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  gap: 40px;
}

.main-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
}

/* Main title */
.main-title {
  font-size: 4rem;
  font-weight: 700;
  color: #000;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 20px;
}

/* Content box - 第二个容器 */
.content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.btn-box {
  flex: 0 0 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  height: 100%;
}

.main-content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  opacity: 1;
  border-radius: 20px;
  overflow: visible;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Additional Mobile Fixes */
@media (max-width: 480px) {
  .content-box {
    padding: 15px 5px !important;
    margin-top: 100px !important;
  }

  .calc-nav-main {
    gap: 5px !important;
    margin-top: 10px;
  }

  .nav-box {
    width: auto !important;
    height: 45px !important;
    flex: 1 !important;
    margin: 0 2px !important;
    margin-bottom: 0 !important;
  }

  .calc-text {
    font-size: 12px !important;
  }
}

/* Additional Mobile Fixes for 480px */
@media (max-width: 480px) {
  .content-box {
    padding: 15px 5px !important;
  }

  .calc-nav-main {
    gap: 5px !important;
    margin-top: 10px;
  }

  .nav-box {
    width: auto !important;
    height: 45px !important;
    flex: 1 !important;
    margin: 0 2px !important;
    margin-bottom: 0 !important;
  }
}

</style>

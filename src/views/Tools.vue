<template>
  <div class="tools-page">
      <Header />

    <!-- 卡片容器 -->
    <div class="cards-container" ref="cardsContainer">
      <div
        v-for="(card, index) in toolsCards"
        :key="card.id"
        class="tool-card"
        :ref="`card${index + 1}`"
      >
        <div class="card-content">
          <!-- 标题 -->
          <h1 class="welcome-title">{{ card.title }}</h1>

          <!-- 副标题 -->
          <p v-if="card.subtitle" class="welcome-subtitle">{{ card.subtitle }}</p>

          <!-- 数据内容 -->
          <div v-if="card.content && card.content.length > 0" class="data-content">
            <div v-if="card.subtitle" class="data-title">{{ card.subtitle }}</div>
            <p v-for="(paragraph, pIndex) in card.content" :key="pIndex">{{ paragraph }}</p>
        </div>

          <!-- 第一个卡片的按钮组 -->
          <div v-if="card.hasScrollButton && index === 0" class="button-group">
            <button class="see-more-btn" @click="scrollToNextCard">
              See More
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="go-calculate-btn" @click="goToCalculate">
              Go to Calculate
            </button>
          </div>
              </div>

        <!-- 其他卡片的按钮组 -->
        <div v-if="card.hasScrollButton && index > 0" class="button-group">
          <!-- 非最后一个卡片显示See More和Go to Calculate -->
          <template v-if="index < toolsCards.length - 1">
            <button class="see-more-btn" @click="scrollToNextCard">
              See More
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="go-calculate-btn" @click="goToCalculate">
              Go to Calculate
            </button>
          </template>
          <!-- 最后一个卡片只显示Go to Calculate -->
          <template v-else>
            <button class="single-calculate-btn" @click="goToCalculate">
              Go to Calculate
            </button>
          </template>
        </div>
            </div>
            </div>

    <!-- 回到顶部按钮 -->
    <button
      class="scroll-to-top-btn"
      @click="scrollToTop"
      v-show="showScrollToTopButton"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 14L12 9L7 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

      <Footer />
  </div>
</template>

<script setup lang="ts">
  import Header from './components/header.vue'
  import Footer from './components/footer.vue'
  import { toolsCards } from '@/data/toolsCards'
  import { useRouter } from 'vue-router'

  import { ref, onMounted, onUnmounted } from 'vue'

  const router = useRouter()

  // 卡片滚动相关
  const cardsContainer = ref<HTMLElement>()
  const currentCardIndex = ref(0)
  const showScrollToTopButton = ref(false)

  // 滚动到下一个卡片
  function scrollToNextCard() {
    if (!cardsContainer.value) return

    const cards = cardsContainer.value.querySelectorAll('.tool-card')
    if (currentCardIndex.value < cards.length - 1) {
      currentCardIndex.value++
      const nextCard = cards[currentCardIndex.value] as HTMLElement
      nextCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // 滚动到顶部
  function scrollToTop() {
    if (!cardsContainer.value) return

    const firstCard = cardsContainer.value.querySelector('.tool-card') as HTMLElement
    if (firstCard) {
      currentCardIndex.value = 0
      firstCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // 跳转到Calculate页面
  function goToCalculate() {
    router.push('/household-calculator')
  }

  // 监听滚动事件
  function handleScroll() {
    if (!cardsContainer.value) return

    const cards = cardsContainer.value.querySelectorAll('.tool-card')
    // const scrollTop = window.pageYOffset || document.documentElement.scrollTop // Not used

    // 更新当前卡片索引
    cards.forEach((card, index) => {
      const rect = (card as HTMLElement).getBoundingClientRect()
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        currentCardIndex.value = index
      }
    })

    // 隐藏所有卡片的按钮组，然后只显示当前卡片的
    cards.forEach((card, index) => {
      const buttonGroup = card.querySelector('.button-group') as HTMLElement
      if (buttonGroup) {
        // 显示当前卡片的按钮组（最后一个卡片也需要显示，但只有Go to Calculate按钮）
        buttonGroup.style.display = index === currentCardIndex.value ? 'flex' : 'none'
      }

      // 为当前卡片的文字添加动画类
      const cardContent = card.querySelector('.card-content') as HTMLElement
      if (cardContent) {
        if (index === currentCardIndex.value) {
          cardContent.classList.add('animate')
        } else {
          cardContent.classList.remove('animate')
        }
      }
    })

    // 显示/隐藏回到顶部按钮（只有在最后一个卡片时显示）
    showScrollToTopButton.value = currentCardIndex.value === cards.length - 1
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)

    // 初始化滚动按钮状态和动画
    setTimeout(() => {
      handleScroll()
      // 为第一个卡片添加动画类
      const firstCard = cardsContainer.value?.querySelector('.tool-card:first-child .card-content') as HTMLElement
      if (firstCard) {
        firstCard.classList.add('animate')
      }
    }, 100)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
</script>

<style scoped>
.tools-page {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* 背景图片容器 */
.tools-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url(@/assets/img2/bg2.png) center/cover no-repeat;
  z-index: -1;
}

/* 固定Header样式 */
:deep(.header) {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 为固定Header预留空间 */
.tools-page .cards-container {
  padding-top: 80px; /* 根据Header高度调整 */
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
}

.tool-card {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  position: relative;
  padding-bottom: 120px; /* 为向上移动的按钮留出空间 */
  border: none;
  box-shadow: none;
  margin: 0;
}

.card-content {
  max-width: 800px;
  text-align: center;
  padding: 2rem;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.welcome-title {
  color: #2d3436;
  font-size: 3.5rem;
  margin-bottom: 2rem;
  font-weight: 700;
}

.welcome-subtitle {
  color: #636e72;
  font-size: 1.2rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 第一个卡片的特殊布局 */
.tool-card:first-child .card-content {
  display: flex;
    flex-direction: column;
  justify-content: center;
    align-items: center;
  min-height: 70vh;
  padding-bottom: 6rem;
    position: relative;
}

.card-content h1 {
  color: #2d3436;
  font-size: 3.5rem;
  margin-bottom: 2rem;
  font-weight: 700;
}

.card-content p {
  color: #636e72;
  font-size: 1.2rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.data-content {
  margin-top: 2rem;
  text-align: left;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.data-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #00b894;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #00b894;
  display: inline-block;
}

.data-content p {
  color: #636e72;
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.2rem;
  text-align: left;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }

  .card-content h1 {
    font-size: 2.5rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .card-content h1 {
    font-size: 2.5rem;
  }


  .card-content p {
    font-size: 1rem;
  }

  .data-title {
    font-size: 1.2rem;
  }

  .data-content p {
    font-size: 1rem;
  }

  .data-content {
    max-width: 600px;
  }

  .button-group {
    gap: 0.75rem;
    bottom: 4rem;
  }

  .see-more-btn,
  .go-calculate-btn,
  .single-calculate-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .see-more-btn svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 2rem;
  }

  .card-content h1 {
    font-size: 2rem;
  }

  .welcome-subtitle {
    font-size: 0.95rem;
  }

  .card-content h1 {
    font-size: 2rem;
  }


  .card-content p {
    font-size: 0.95rem;
  }

  .data-title {
    font-size: 1.1rem;
  }

  .data-content p {
    font-size: 0.95rem;
  }

  .data-content {
    max-width: 500px;
  }

  .button-group {
    gap: 0.5rem;
    bottom: 3rem;
  }

  .see-more-btn,
  .go-calculate-btn,
  .single-calculate-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .see-more-btn svg {
    width: 12px;
    height: 12px;
  }
}

/* 按钮组样式 */
.button-group {
  position: absolute;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 100;
}

/* See More按钮样式 */
.see-more-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00b894, #00cec9);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.4);
  transition: all 0.3s ease;
  opacity: 0.9;
}

.see-more-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 184, 148, 0.6);
  opacity: 1;
}

/* Go to Calculate按钮样式 */
.go-calculate-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #0984e3, #74b9ff);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(9, 132, 227, 0.4);
  transition: all 0.3s ease;
  opacity: 0.9;
}

.go-calculate-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(9, 132, 227, 0.6);
  opacity: 1;
}

/* 最后一个卡片的单个Go to Calculate按钮样式 */
.single-calculate-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #0984e3, #74b9ff);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(9, 132, 227, 0.4);
  transition: all 0.3s ease;
  opacity: 0.9;
}

.single-calculate-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(9, 132, 227, 0.6);
  opacity: 1;
}

/* 回到顶部按钮样式 */
.scroll-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #00b894, #00cec9);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.scroll-to-top-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 184, 148, 0.6);
  opacity: 1;
}

.scroll-to-top-btn svg {
  width: 24px;
  height: 24px;
}

/* 第一个卡片的按钮组样式 */
.tool-card:first-child .card-content .button-group {
  position: absolute;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 3rem;
}

/* 其他卡片的按钮组样式 */
.tool-card:not(:first-child) .button-group {
  position: absolute;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
}

/* 文字缩放动画效果 - 初始状态：所有文字元素都是缩放和透明状态 */
.card-content h1,
.card-content p,
.data-title,
.data-content p {
  transform: scale(0.8);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 激活动画的类：触发动画 */
.card-content.animate h1 {
  transform: scale(1);
  opacity: 1;
  transition-delay: 0.1s;
}

.card-content.animate p {
  transform: scale(1);
  opacity: 1;
  transition-delay: 0.2s;
}

.card-content.animate .data-title {
  transform: scale(1);
  opacity: 1;
  transition-delay: 0.15s;
}

.card-content.animate .data-content p {
  transform: scale(1);
  opacity: 1;
  transition-delay: 0.3s;
}

</style>

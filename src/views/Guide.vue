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
          <!-- 数据内容 -->
          <div v-if="card.content && card.content.length > 0" class="data-content">
            <!-- 所有卡片都使用相同的圆角矩形样式 -->
            <div class="carbon-data-card">
              <div v-if="card.subtitle" class="carbon-data-title">{{ card.subtitle }}</div>
              <div class="carbon-data-description">
                <p v-for="(paragraph, pIndex) in card.content" :key="pIndex">{{ paragraph }}</p>
              </div>
            </div>
        </div>

          <!-- 第一个卡片的按钮组 -->
          <div v-if="card.hasScrollButton && index === 0" class="button-group">
            <button class="see-more-btn" @click="scrollToNextCard">
              Learn more details
            </button>
            <button class="go-calculate-btn" @click="goToCalculate">
              Calculate your own CO2 emissions
            </button>
          </div>
          </div>

        <!-- 其他卡片的按钮组 -->
        <div v-if="card.hasScrollButton && index > 0" class="button-group">
          <!-- 非最后一个卡片显示See More和Go to Calculate -->
          <template v-if="index < toolsCards.length - 1">
            <button class="middle-calculate-btn" @click="goToCalculate">
              Calculate your own CO2 emissions
            </button>
          </template>
          <!-- 最后一个卡片只显示Go to Calculate -->
          <template v-else>
            <button class="middle-calculate-btn" @click="goToCalculate">
              Calculate your own  CO2 emissions
            </button>
          </template>
        </div>
            </div>
            </div>

    <!-- 卡片切换按钮（从第二个卡片开始显示） -->
    <div v-if="currentCardIndex >= 1" class="card-navigation-buttons">
      <button class="card-nav-btn prev-card-btn" @click="scrollToPrevCard" aria-label="Previous card">
        <span class="nav-arrow">‹</span>
      </button>
      <button class="card-nav-btn next-card-btn" @click="scrollToNextCard" aria-label="Next card">
        <span class="nav-arrow">›</span>
      </button>
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

  // 滚动到指定卡片
  function scrollToCard(index: number) {
    if (!cardsContainer.value) return

    const cards = cardsContainer.value.querySelectorAll('.tool-card')
    if (index >= 0 && index < cards.length) {
      currentCardIndex.value = index
      const targetCard = cards[index] as HTMLElement
      targetCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // 滚动到下一个卡片
  function scrollToNextCard() {
    scrollToCard(currentCardIndex.value + 1)
  }

  // 滚动到上一个卡片
  function scrollToPrevCard() {
    scrollToCard(currentCardIndex.value - 1)
  }

  // 滚动到顶部
  function scrollToTop() {
    scrollToCard(0)
  }

  // 跳转到Travel计算器页面
  function goToCalculate() {
    // 确保滚动到顶部，然后再跳转
    window.scrollTo(0, 0)
    router.push('/calculator/travel')
  }

  // 监听滚动事件
  function handleScroll() {
    if (!cardsContainer.value) return

    const cards = cardsContainer.value.querySelectorAll('.tool-card')

    // 更新当前卡片索引
    const viewportCenter = window.innerHeight / 2
    let currentIndex = -1
    cards.forEach((card, index) => {
      const rect = (card as HTMLElement).getBoundingClientRect()
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        currentIndex = index
      }
    })
    if (currentIndex !== -1) {
      currentCardIndex.value = currentIndex
    }

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
  padding-top: 80px; /* 添加顶部内边距，与导航栏高度相同 */
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
  color: #FFFFFF;
  font-size: 3.5rem;
  margin-bottom: 2rem;
  font-weight: 700;
}



.card-content h1 {
  color: #FFFFFF;
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


.data-content p {
  color: #636e72;
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.2rem;
  text-align: left;
}

/* 碳足迹数据卡片样式 */
.carbon-data-card {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 40px;
  padding: 2.5rem 2.5rem 1.5rem 2.5rem;
  margin: 0.5rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  width: 70vw;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.carbon-data-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 1.5rem;
  text-align: center;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.carbon-data-description {
  text-align: center;
}

.carbon-data-description p {
  color: #000000;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.7;
  margin-bottom: 1rem;
  text-align: center;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tools-page {
    padding-top: 70px; /* 移动设备上导航栏高度调整 */
  }
  
  .welcome-title {
    font-size: 2.5rem;
  }

  .card-content h1 {
    font-size: 2.5rem;
  }


  .card-content p {
    font-size: 1rem;
  }

  .data-content p {
    font-size: 1rem;
  }

  .data-content {
    max-width: 600px;
  }

  .carbon-data-card {
    padding: 2rem 1.5rem 1rem 1.5rem;
    margin: 0.75rem 0;
    border-radius: 25px;
  }

  .carbon-data-title {
    font-size: 2rem;
    max-width: 95%;
  }

  .carbon-data-description p {
    font-size: 1.4rem;
    font-weight: 600;
    max-width: 95%;
  }

  .button-group {
    gap: 0.75rem;
    bottom: 3rem;
    left: 4rem;
    right: 4rem;
  }

  .see-more-btn {
    padding: 0.8rem 1.4rem;
    font-size: 1.5rem;
    font-weight: 600;
    min-width: 50px;
  }

  .go-calculate-btn {
    padding: 0.8rem 1.4rem;
    font-size: 1.5rem;
    font-weight: 600;
    min-width: 350px;
  }

  .middle-calculate-btn {
    padding: 0.8rem 1.4rem;
    font-size: 1.5rem;
    font-weight: 600;
    min-width: 280px;
    left: 50%;
    transform: translateX(-50%);
    bottom: 2rem;
  }

  /* 卡片导航按钮响应式 */
  .card-navigation-buttons {
    padding: 0 1rem;
  }

  .card-nav-btn {
    width: 40px;
    height: 40px;
  }

  .nav-arrow {
    font-size: 20px;
  }

  .single-calculate-btn {
    padding: 0.8rem 1.4rem;
    font-size: 1.6rem;
    font-weight: 600;
    min-width: 300px;
    right: 3rem;
    bottom: 2rem;
  }

  .see-more-btn svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .tools-page {
    padding-top: 100px; /* 小屏幕设备上导航栏可能是双行的 */
  }
  
  .welcome-title {
    font-size: 2rem;
  }

  .card-content h1 {
    font-size: 2rem;
  }

  .card-content h1 {
    font-size: 2rem;
  }


  .card-content p {
    font-size: 0.95rem;
  }

  .data-content p {
    font-size: 0.95rem;
  }

  .data-content {
    max-width: 500px;
  }

  .button-group {
    gap: 0.5rem;
    bottom: 1rem;
    left: 3rem;
    right: 3rem;
  }

  .see-more-btn {
    padding: 0.6rem 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    min-width: 160px;
  }

  .go-calculate-btn {
    padding: 0.6rem 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    min-width: 280px;
  }

  .middle-calculate-btn {
    padding: 0.6rem 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    min-width: 220px;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0.5rem;
  }

  .single-calculate-btn {
    padding: 0.6rem 1rem;
    font-size: 1.2rem;
    font-weight: 600;
    min-width: 240px;
    right: 2rem;
    bottom: 1.5rem;
  }

  .see-more-btn svg {
    width: 12px;
    height: 12px;
  }

  .carbon-data-card {
    padding: 1.5rem 1rem 0.8rem 1rem;
    margin: 0.5rem 0;
    border-radius: 20px;
  }

  .carbon-data-title {
    font-size: 1.6rem;
  }

  .carbon-data-description p {
    font-size: 1.2rem;
    font-weight: 600;
  }

  /* 卡片导航按钮响应式 */
  .card-navigation-buttons {
    padding: 0 0.5rem;
  }

  .card-nav-btn {
    width: 35px;
    height: 35px;
  }

  .nav-arrow {
    font-size: 18px;
  }
}

/* 按钮组样式 */
  .button-group {
    position: absolute;
    bottom: -0.5rem;
    left: 5rem;
    right: 5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 100;
}

/* See More按钮样式 */
.see-more-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.3s ease;
  min-width: 280px;
  justify-content: center;
}

.see-more-btn:hover {
  color: #e0f7f7;
  text-decoration-thickness: 2px;
}

/* Go to Calculate按钮样式 */
.go-calculate-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.3s ease;
  min-width: 500px;
  text-align: center;
}

.go-calculate-btn:hover {
  color: #e8f4fd;
  text-decoration-thickness: 2px;
}

/* 中间卡片的 Calculate 按钮样式 */
.middle-calculate-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.3s ease;
  min-width: 400px;
  text-align: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0.5rem;
}

.middle-calculate-btn:hover {
  color: #e8f4fd;
  text-decoration-thickness: 2px;
}

/* 最后一个卡片的单个Go to Calculate按钮样式 */
.single-calculate-btn {
  padding: 0.75rem 2rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.9rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  transition: all 0.3s ease;
  min-width: 420px;
  text-align: center;
  position: absolute;
  right: 2rem;
  bottom: 1.5rem;
}

.single-calculate-btn:hover {
  color: #e8f4fd;
  text-decoration-thickness: 2px;
}

/* 卡片导航按钮容器 */
.card-navigation-buttons {
  position: fixed;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 1000;
  pointer-events: none;
}

.card-navigation-buttons .card-nav-btn {
  pointer-events: auto;
}

/* 卡片导航按钮样式（与Home.vue的slide-button样式一致） */
.card-nav-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card-nav-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(0, 0, 0, 1);
  transform: scale(1.1);
}

.nav-arrow {
  font-size: 24px;
  font-weight: bold;
  color: rgba(0, 0, 0, 1);
  line-height: 1;
}

.card-nav-btn:hover .nav-arrow {
  color: rgba(255, 255, 255, 1);
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

/* 文字缩放动画效果 - 初始状态：所有文字元素都是缩放和透明状态 */
.card-content h1,
.card-content p,
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

.card-content.animate .data-content p {
  transform: scale(1);
  opacity: 1;
  transition-delay: 0.3s;
}

</style>

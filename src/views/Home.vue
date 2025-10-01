<template>
  <div>
    <Header />
    <div class="page flex-col">
      <div class="hero-section flex-col">
        <img
          class="video-background"
          :src="homeBackground"
          alt="Background"
        />
        <span class="hero-title">Small Steps, Greener Future.</span>
        <span class="hero-subtitle">TAKE URGENT ACTION TO COMBAT CLIMATE CHANGE AND ITS IMPACTS.</span>
        <RouterLink to="/guide">
          <div class="cta-button flex-col">
            <span class="button-text">Start Now</span>
          </div>
        </RouterLink>
      </div>
      <div class="hero-question">
        What can we do ?
      </div>

      <div class="content-section">
         <div class="box-left">
            <div class="calculator-content">
               <h2 class="calculator-title">{{ currentSlideData.title }}</h2>
               <p class="calculator-description">
                  {{ currentSlideData.description }}
               </p>
               <RouterLink :to="currentSlideData.buttonLink" class="discover-button">
                  <span class="button-text">{{ currentSlideData.buttonText }}</span>
               </RouterLink>
            </div>
         </div>
         <div class="box-right">
            <div class="slider-container">
               <!-- 切换按钮（只保留左边的，点击切换下一张） -->
               <button class="slide-button prev-button" @click="nextSlide" aria-label="Next slide">
                  <span class="arrow">‹</span>
               </button>

               <!-- 图片显示区域 -->
               <div class="images-container">
                  <div
                     v-for="(slide, index) in reorderedSlides"
                     :key="slide.id"
                     class="slide-image"
                     :class="{ active: slide.id === slides[currentSlide].id }"
                     :style="{ backgroundImage: `url(${slide.image})` }"
                  ></div>
               </div>
            </div>
         </div>
      </div>

      <div class="about-section">
        <div class="about-title">About Us</div>
        <div class="about-subtitle">GreenPulse's mission is to promote carbon reduction knowledge at scale</div>
        <div class="about-description">
          Climate change is an urgent global crisis, driven by human activities such as burning fossil fuels. It leads to rising
          temperatures, extreme weather events, and sea-level rise, threatening ecosystems and communities worldwide. Aligned with
          SDG 13: Climate Action, GreenPulse empowers Malaysia’s urban youth to take immediate action through simple daily
          challenges, personalised recommendations, and gamified tools. By turning awareness into action, GreenPulse helps reduce
          carbon emissions and build sustainable habits—ensuring a livable future for all.
        </div>
      </div>

      <div class="footer-section flex-col">
        <Footer/>
      </div>
    </div>
    
    <!-- 聊天机器人组件 -->
    <ChatBot />
  </div>
</template>

<script>
import Header from './components/header.vue'
import Footer from './components/footer.vue'
import ChatBot from './components/ChatBot.vue'
import { RouterLink } from 'vue-router'

import homeSlide1 from '@/assets/img/home_slide_1.png'
import homeSlide2 from '@/assets/img/home_slide_2.jpg'
import homeSlide3 from '@/assets/img/home_slide_3.png'
import homeBackground from '@/assets/img/home.jpg'

export default {
  components: {
    Header,
    Footer,
    ChatBot,
  },
  name: 'Home',
  data() {
    return {
      homeBackground,
      currentSlide: 0,
      slides: [
        {
          id: 1,
          title: 'Footprint Calculator',
          description: 'Want to know how much impact your daily habits have on the planet? Enter your travel, eating, and spending habits to generate your carbon footprint report with one click. It also recommends tailored emissions reduction tips, making it easier to start living green today.',
          image: homeSlide1,
          buttonText: 'Discover More',
          buttonLink: '/guide'
        },
        {
          id: 2,
          title: 'Green AI Chatbot',
          description: "Embark on a green future with AI! Whether it's energy conservation and emissions reduction or eco-friendly transportation, chatbots provide real-time personalized recommendations to help you effortlessly take every step toward green action. Reduce your carbon footprint and safeguard a sustainable future",
          image: homeSlide2,
          buttonText: 'Discover More',
          buttonLink: '/coming-soon'
        },
        {
          id: 3,
          title: 'Green Map',
          description: 'Discover eco-friendly spots near you! 🌍 From recycling centers and green restaurants to sustainable events, Green Map helps you easily explore and save eco-friendly locations across Malaysia. Bookmark your favorite spots for future visits and join the journey toward a more sustainable lifestyle.',
          image: homeSlide3,
          buttonText: 'Discover More',
          buttonLink: '/coming-soon'
        }
      ]
    }
  },
  mounted() {
    requestAnimationFrame(() => {
      document.body.style.opacity = '0'
      document.body.style.transition = 'opacity 0.5s ease-in'
      setTimeout(() => {
        document.body.style.opacity = '1'
      }, 100)
    })
  },
  computed: {
    currentSlideData() {
      return this.slides[this.currentSlide]
    },
    reorderedSlides() {
      // 将选中的图片放在第一位，其余图片按原顺序排列
      const selectedSlide = this.slides[this.currentSlide]
      const otherSlides = this.slides.filter((_, index) => index !== this.currentSlide)
      return [selectedSlide, ...otherSlides]
    }
  },
  methods: {
    createRipple(event) {
      const button = event.currentTarget
      const ripple = document.createElement('span')
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      ripple.style.width = ripple.style.height = size + 'px'
      ripple.style.left = x + 'px'
      ripple.style.top = y + 'px'
      ripple.classList.add('ripple')
      button.appendChild(ripple)
      setTimeout(() => {
        ripple.remove()
      }, 600)
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length
    },
    prevSlide() {
      this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1
    },
  },
}
</script>

<style>
@import '@/assets/css/style.css';
</style>

<style scoped>
/* CSS Styles */
.page {
  background-color: rgba(255, 255, 255, 1);
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}




/* Video background text interactions */
.hero-title,
.hero-subtitle {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.hero-title:hover,
.hero-subtitle:hover {
  transform: scale(1.05);
  text-shadow:
    0 4px 12px rgba(0, 0, 0, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.3);
}

/* CTA button interaction enhancements */
.cta-button {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

/* Ripple effect */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple-animation 0.6s linear;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Ensure clickable elements are relatively positioned */
.cta-button {
  position: relative;
  overflow: hidden;
}


.hero-section {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.hero-section span,
.hero-section .cta-button {
  position: relative; /* ensure text stays above video */
  z-index: 1;
  color: white; /* optional: improves readability */
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35); /* dark overlay for contrast */
  z-index: 1;
}

.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero-title {
  width: 100%;
  max-width: 884px;
  overflow-wrap: break-word;
  color: rgba(255, 250, 250, 1);
  text-align: center;
  margin: 0 auto;
  font-size: 4rem;
  font-weight: 600;
  line-height: 1.3;
  position: relative;
  z-index: 3;
}

.hero-subtitle {
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  color: rgba(255, 254, 254, 1);
  text-align: center;
  margin: 1rem auto 0;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
  position: relative;
  z-index: 3;
}

.hero-question {
  text-align: center;
  font-size: 5rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 6rem auto;
  position: relative;
  z-index: 3;
  font-family: 'Cormorant Garamond', serif;
  line-height: 1.2;
}

/* About Section Styles */
.about-section {
  text-align: center;
  margin: 3rem auto;
  padding: 3rem 8rem;
  border-top: 1px solid #e0e0e0;

}

.about-title {
  font-size: 5rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 1);
  margin-bottom: 2rem;
  font-family: 'Cormorant Garamond', serif;
  line-height: 1.2;
}

.about-subtitle {
  font-size: 2.2rem;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
  margin-bottom: 3rem;
  font-family: 'EB Garamond', serif;
  line-height: 1.4;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.about-description {
  font-size: 1.8rem;
  line-height: 1.6;
  color: rgba(51, 51, 51, 1);
  font-family: 'EB Garamond', serif;
  /* max-width: 900px; */
  margin: 0 auto;
  text-align: center;
}

.content-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.box-left,
.box-right {
  flex: 1;
  height: 450px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.box-left:hover,
.box-right:hover {
  transform: translateY(-5px);
}

.box-left {
  margin-left: 80px;
  min-height: 500px;
  height: auto;
  overflow: visible;
}

/* Calculator content styles */
.calculator-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  min-height: 100%;
  padding: 2.1rem;
  gap: 1.4rem;
}

.calculator-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  line-height: 1.2;
}

.calculator-description {
  font-size: 1.6rem;
  line-height: 1.4;
  color: rgba(51, 51, 51, 1);
  margin: 0;
  font-family: 'EB Garamond', serif;
  font-weight: 400;
}

.discover-button {
  color: rgba(0, 0, 0, 1);
  padding: 0.7rem 1.4rem;
  border-radius: 50px;
  text-decoration: none;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: 3px solid rgba(0, 0, 0, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 126px;
}

.discover-button:hover {
  transform: translateY(-2px);
}

.discover-button .button-text {
  color: rgba(0, 0, 0, 1);
  font-size: 1.05rem;
  font-weight: 600;
  text-align: center;
}

/* Slider styles */
.slider-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
}

.slide-button {
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
  margin-left: 15px;
}

.slide-button:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(0, 0, 0, 1);
  transform: scale(1.1);
}

.arrow {
  font-size: 24px;
  font-weight: bold;
  color: rgba(0, 0, 0, 1);
  line-height: 1;
}

.slide-button:hover .arrow {
  color: rgba(255, 255, 255, 1);
}

.images-container {
  flex: 1;
  height: 100%;
  position: relative;
  display: flex;
  gap: 15px;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 20px;
  padding: 20px;
  align-items: center;
  justify-content: flex-start;
  scrollbar-width: thin;
  scrollbar-color: rgba(34, 139, 34, 0.3) transparent;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 440px;
}

.images-container::-webkit-scrollbar {
  height: 6px;
}

.images-container::-webkit-scrollbar-track {
  background: transparent;
}

.images-container::-webkit-scrollbar-thumb {
  background: rgba(34, 139, 34, 0.3);
  border-radius: 3px;
}

.images-container::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 139, 34, 0.6);
}

.slide-image {
  position: relative;
  width: 320px;
  height: 400px;
  background-size: cover !important;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0;
  border-radius: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.slide-image.active {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 5;
}


/* Responsive design */
@media (max-width: 768px) {
  .about-section {
    padding: 2.5rem 4rem;
  }

  .content-section {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .box-left,
  .box-right {
    width: 100%;
    margin: 0;
    height: auto;
    min-height: 280px;
  }

  .box-left {
    margin-left: 0;
  }

  .calculator-content {
    padding: 1.5rem;
    gap: 1rem;
    min-height: auto;
  }

  .calculator-title {
    font-size: 2rem;
  }

  .calculator-description {
    font-size: 1rem;
  }

  .discover-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    min-width: 140px;
  }

  .discover-button .button-text {
    font-size: 1.1rem;
  }

  .hero-question {
    font-size: 2.5rem;
    margin: 3rem auto;
  }

  .slide-button {
    width: 40px;
    height: 40px;
  }

  .arrow {
    font-size: 20px;
  }

  .prev-button {
    left: 10px;
  }

  .slide-image {
    width: 190px;
    height: 300px;
    max-height: 300px;
  }

  .images-container {
    height: auto;
    min-height: 280px;
    padding: 10px;
    gap: 8px;
    align-items: flex-start;
  }

  .slider-container {
    gap: 10px;
    height: 280px;
  }
}

/* 解决 box-left 自适应高度和字体大小问题 */
@media (max-width: 1024px) {
  .box-left {
    height: auto;
    min-height: 315px;
  }

  .box-right {
    height: auto;
    min-height: 315px;
  }

  .calculator-content {
    justify-content: flex-start;
    min-height: auto;
  }

  .slide-image {
    width: 280px;
    height: 400px;
  }

  .images-container {
    min-height: 390px;
    padding: 18px;
    align-items: flex-start;
  }

  .slider-container {
    gap: 15px;
    height: 390px;
  }
}

@media (max-width: 480px) {
  .about-section {
    padding: 2rem 2rem;
  }

  .box-left {
    margin-left: 20px;
    height: auto;
    min-height: 280px;
  }

  .box-right {
    height: auto;
    min-height: 210px;
  }

  .calculator-content {
    padding: 1.5rem;
    gap: 1rem;
    justify-content: flex-start;
    min-height: auto;
  }

  .calculator-title {
    font-size: 1.8rem;
    line-height: 1.3;
  }

  .calculator-description {
    font-size: 1rem;
    line-height: 1.4;
  }

  .discover-button {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
    min-width: 140px;
  }

  .discover-button .button-text {
    font-size: 1.2rem;
  }

  .hero-question {
    font-size: 2rem;
    margin: 2rem auto;
  }

  .slide-image {
    width: 160px;
    height: 250px;
  }

  .images-container {
    min-height: 230px;
    padding: 8px;
    gap: 6px;
    align-items: flex-start;
  }

  .slider-container {
    gap: 8px;
    height: 230px;
  }
}


.cta-button {
  background: rgba(255, 255, 255, 0.08);
  height: 60px;
  width: 200px;
  margin: 40px auto;
  position: relative;
  z-index: 1;
  border-radius: 40px; /* 高度的一半，使两侧成为半圆 */
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}



.button-text {
  width: 128px;
  height: 30px;
  overflow-wrap: break-word;
  color: rgba(255, 255, 255, 1);
  font-size: 2rem;
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 1;           /* avoid extra vertical space */
  margin: 0;
  display: flex;            /* center content */
  align-items: center;
  justify-content: center;
}

/* Utility Classes */
.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.justify-between {
  justify-content: space-between;
}

/* Ensure page fills screen */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

</style>
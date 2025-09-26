<template>
  <main class="coming-soon-container">
    <h1 class="coming-soon-title">{{ getTitle() }}</h1>
    <p class="coming-soon-text">
      {{ getDescription() }}
    </p>
    <div class="coming-soon-icon">
      <img :src="getIcon()" :alt="type + ' icon'" class="feature-icon" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'feature'
})

const getTitle = () => {
  switch (props.type) {
    case 'food':
      return 'Food Calculator Coming Soon'
    case 'shopping':
      return 'Shopping Calculator Coming Soon'
    default:
      return 'Coming Soon'
  }
}

const getDescription = () => {
  switch (props.type) {
    case 'food':
      return 'Our food calculator is being developed to help you track and reduce your food-related carbon footprint. Stay tuned for features including dietary analysis, local food recommendations, and sustainable eating tips!'
    case 'shopping':
      return 'Our shopping calculator will help you make environmentally conscious purchasing decisions. Track your consumption patterns, compare product impacts, and discover eco-friendly alternatives.'
    default:
      return 'This page is currently under development. Stay tuned - exciting features are on the way!'
  }
}

const getIcon = () => {
  switch (props.type) {
    case 'food':
      return '@/assets/img2/food_icon.png'
    case 'shopping':
      return '@/assets/img2/shopping_icon.png'
    default:
      return ''
  }
}
</script>

<style scoped>
.coming-soon-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 80vh;
  color: #545454;
  font-family: 'EB Garamond', serif;
  padding: 20px;
  background-color: rgba(249, 250, 236, 1);
}
.coming-soon-title {
  font-size: 48px;
  font-weight: 600;
  margin-bottom: 20px;
}
.coming-soon-text {
  font-size: 20px;
  max-width: 600px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.coming-soon-icon {
  margin-top: 20px;
}

.feature-icon {
  width: 80px;
  height: 80px;
  opacity: 0.7;
  border-radius: 50%;
  background-color: rgba(61, 124, 74, 0.1);
  padding: 15px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .coming-soon-container {
    height: 70vh;
    padding: 15px;
  }

  .coming-soon-title {
    font-size: 36px;
    margin-bottom: 15px;
  }

  .coming-soon-text {
    font-size: 16px;
    max-width: 90%;
    margin-bottom: 20px;
  }

  .feature-icon {
    width: 60px;
    height: 60px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .coming-soon-container {
    height: 60vh;
    padding: 10px;
  }

  .coming-soon-title {
    font-size: 28px;
    margin-bottom: 10px;
  }

  .coming-soon-text {
    font-size: 14px;
    max-width: 95%;
    margin-bottom: 15px;
  }

  .feature-icon {
    width: 50px;
    height: 50px;
    padding: 8px;
  }
}
</style>

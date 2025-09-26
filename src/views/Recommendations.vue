<template>
  <div class="recommendations-page">
    <!-- Header -->
    <Header />

    <!-- 返回按钮 -->
    <div class="back-button-container">
      <button class="nav-button back-button" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 右侧计算器按钮 -->
    <div class="right-buttons-container">
      <button class="calculator-button travel-button" @click="goToCalculator('travel')">
        <span>Travel Calculator</span>
      </button>
      <button class="calculator-button household-button" @click="goToCalculator('household')">
        <span>Household Calculator</span>
      </button>
      <button class="calculator-button shopping-button" @click="goToCalculator('shopping')">
        <span>Shopping Calculator</span>
      </button>
      <button class="calculator-button food-button" @click="goToCalculator('food')">
        <span>Food Calculator</span>
      </button>
    </div>

    <div class="recommendations-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Generating personalized recommendations...</p>
      </div>

      <!-- Error State - Hidden when unable to generate response -->
      <div v-else-if="apiError && !isUnableToGenerateResponse" class="error-container">
        <h2 class="error-title">Recommendation Error</h2>
        <p class="error-message">{{ apiError }}</p>
        <button @click="retryRecommendations" class="retry-button">Retry</button>
      </div>

      <!-- Recommendations Content -->
      <div v-else-if="!isUnableToGenerateResponse">
        <!-- Main Title -->
        <h1 class="recommendations-title">Recommendation</h1>

        <!-- Summary Section -->
        <div v-if="recommendationData.summary" class="summary-section">
          <div class="summary-text" v-html="parseMarkdown(recommendationData.summary)"></div>
        </div>

        <!-- Recommendations Display -->
        <div v-if="recommendationData.recommendations" class="recommendations-display">
          <div 
            v-for="(recommendation, index) in parsedRecommendations" 
            :key="index"
            class="recommendation-card"
          >
            <div class="recommendation-content" v-html="parseMarkdown(recommendation)">
            </div>
          </div>
        </div>

        <!-- Fallback if no recommendations -->
        <div v-else class="no-recommendations">
          <p class="no-recommendations-text">No specific recommendations available at this time.</p>
        </div>
      </div>

      <!-- Hidden state when unable to generate response -->
      <div v-else class="hidden-content">
        <!-- Content is hidden when unable to generate response -->
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Header from '@/views/components/header.vue'
import { generateRecommendations } from '@/services/api.js'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Reactive data
const isLoading = ref<boolean>(false)
const apiError = ref<string | null>(null)
const recommendationData = ref<{
  summary: string
  recommendations: string
}>({
  summary: '',
  recommendations: ''
})

// Check if unable to generate response
const isUnableToGenerateResponse = computed(() => {
  return apiError.value && (
    apiError.value.toLowerCase().includes('unable to generate response') ||
    apiError.value.toLowerCase().includes('unable to generate') ||
    apiError.value.toLowerCase().includes('generate response')
  )
})

// Configure marked for better parsing
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

// Parse recommendations into individual items
const parsedRecommendations = computed(() => {
  console.log('parsedRecommendations: Raw recommendations data:', recommendationData.value.recommendations)
  
  if (!recommendationData.value.recommendations) {
    console.log('parsedRecommendations: No recommendations data')
    return []
  }
  
  // Split by double newlines or recommendation patterns to get individual recommendations
  const recommendations = recommendationData.value.recommendations
    .split(/\n\s*\n/)
    .filter(rec => rec.trim().length > 0)
    .map(rec => rec.trim())
  
  console.log('parsedRecommendations: Initial split result:', recommendations)
  
  // If we have fewer than 2 recommendations, try splitting by recommendation patterns
  if (recommendations.length < 2) {
    const patternSplit = recommendationData.value.recommendations
      .split(/(?=🌱|🚀|💡|♻️|🌿|🚶)/)
      .filter(rec => rec.trim().length > 0)
      .map(rec => rec.trim())
    
    console.log('parsedRecommendations: Pattern split result:', patternSplit)
    
    if (patternSplit.length > recommendations.length) {
      const result = patternSplit.slice(0, 3) // Limit to 3 recommendations
      console.log('parsedRecommendations: Using pattern split result:', result)
      return result
    }
  }
  
  const result = recommendations.slice(0, 3) // Limit to 3 recommendations
  console.log('parsedRecommendations: Final result:', result)
  return result
})

// Parse Markdown content
function parseMarkdown(content: string): string {
  if (!content) return ''
  
  try {
    // Parse the markdown content
    const parsed = marked.parse(content)
    console.log('parseMarkdown: Parsed content:', parsed)
    return parsed
  } catch (error) {
    console.error('Error parsing markdown:', error)
    return content // Return original content if parsing fails
  }
}

// Function to go back to the result page
function goBack() {
  router.back()
}

// Function to navigate to specific calculator
function goToCalculator(type: string) {
  router.push(`/calculator/${type}`)
}

// Function to generate recommendations
async function generateRecommendationsData() {
  isLoading.value = true
  apiError.value = null
  
  try {
    // Get data from route query parameters
    const category = route.query.category as string
    const emissions = parseFloat(route.query.emissions as string)
    const calculationData = route.query.calculationData ? JSON.parse(route.query.calculationData as string) : undefined
    
    if (!category || !emissions) {
      throw new Error('Missing required parameters: category and emissions')
    }
    
    console.log('Generating recommendations with:', { category, emissions, calculationData })
    
    const response = await generateRecommendations({
      category,
      emissions,
      calculationData,
      debugMode: false
    })
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to generate recommendations')
    }
    
    recommendationData.value = {
      summary: response.data.summary || '',
      recommendations: response.data.recommendations || ''
    }
    
    console.log('Recommendations generated successfully:', recommendationData.value)
    
  } catch (error) {
    console.error('Error generating recommendations:', error)
    apiError.value = error instanceof Error ? error.message : 'Failed to generate recommendations'
  } finally {
    isLoading.value = false
  }
}

// Retry function
async function retryRecommendations() {
  await generateRecommendationsData()
}

// Function to format summary text (keeping this for special formatting)
function formatSummaryText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/≈/g, '<span class="approx-symbol">≈</span>')
    .replace(/\(([^)]+)\)/g, '<span class="parenthetical">($1)</span>')
}

onMounted(async () => {
  await generateRecommendationsData()
})
</script>

<style scoped>
@import '@/assets/css/style.css';

/* Page container */
.recommendations-page {
  width: 100%;
  min-height: 100vh;
  background-image: url('@/assets/img/result.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Main content container - center aligned */
.recommendations-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 25px 60px 25px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  flex: 1;
  margin-top: 80px; /* 为 header 留出空间 */
  margin-bottom: 50px;
}

/* Back Button Container */
.back-button-container {
  position: fixed;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 1000;
}

/* Right Calculator Buttons Container */
.right-buttons-container {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1000;
}

.calculator-button {
  background: rgba(61, 124, 74, 0.9);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 14px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 160px;
  text-align: center;
}

.calculator-button:hover {
  background: rgba(61, 124, 74, 1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateX(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.calculator-button:active {
  transform: translateX(-2px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.nav-button.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.nav-button.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

/* Title */
.recommendations-title {
  font-size: 36px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 800;
  color: rgba(255, 255, 255, 1);
  margin-bottom: 30px;
  text-align: center;
}

/* Summary Section */
.summary-section {
  margin-bottom: 30px;
  max-width: 1000px;
}

.summary-text {
  font-size: 20px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  text-align: center;
  background-color: rgba(61, 124, 74, 0.2);
  padding: 20px;
  border-radius: 15px;
  border-left: 4px solid rgba(61, 124, 74, 1);
}

.approx-symbol {
  font-weight: 600;
  color: rgba(61, 124, 74, 1);
}

.parenthetical {
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

/* Recommendations Display */
.recommendations-display {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1000px;
  width: 100%;
}

.recommendation-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  border: 2px solid rgba(61, 124, 74, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(61, 124, 74, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.recommendation-content {
  font-size: 18px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 500;
  color: rgba(255, 255, 255, 1);
  line-height: 1.6;
  text-align: left;
}

/* Recommendation Header */
.recommendation-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(61, 124, 74, 0.3);
}

.recommendation-icon {
  font-size: 24px;
  margin-right: 12px;
  display: inline-block;
}

.recommendation-title {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
}

/* Recommendation Main Text */
.recommendation-main-text {
  margin-bottom: 20px;
  font-size: 18px;
  line-height: 1.6;
}

/* Sections */
.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: rgba(61, 124, 74, 1);
  margin-bottom: 8px;
}

.section-content {
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}

/* Why Section */
.why-section {
  background-color: rgba(61, 124, 74, 0.1);
  padding: 15px;
  border-radius: 10px;
  border-left: 3px solid rgba(61, 124, 74, 0.5);
}

/* How Section */
.how-section {
  background-color: rgba(61, 124, 74, 0.1);
  padding: 15px;
  border-radius: 10px;
  border-left: 3px solid rgba(61, 124, 74, 0.5);
}

.how-section .section-content {
  counter-reset: step-counter;
}

.how-step {
  margin-bottom: 8px;
  padding-left: 25px;
  position: relative;
  counter-increment: step-counter;
}

.how-step::before {
  content: counter(step-counter) '.';
  position: absolute;
  left: 0;
  top: 0;
  color: rgba(61, 124, 74, 1);
  font-weight: bold;
  margin-right: 8px;
  min-width: 20px;
}

.how-text {
  margin-bottom: 5px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
}

/* Local Tip Section */
.local-tip-section {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(61, 124, 74, 0.3);
}

.local-tip-section .section-title {
  color: rgba(255, 255, 255, 1);
}

/* Bold text styling */
strong {
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
}

/* Markdown content styling */
.recommendation-content h1,
.recommendation-content h2,
.recommendation-content h3,
.recommendation-content h4,
.recommendation-content h5,
.recommendation-content h6 {
  color: rgba(61, 124, 74, 1);
  margin: 20px 0 10px 0;
  font-weight: 700;
}

.recommendation-content h1 {
  font-size: 24px;
}

.recommendation-content h2 {
  font-size: 20px;
}

.recommendation-content h3 {
  font-size: 18px;
}

.recommendation-content p {
  margin: 10px 0;
  line-height: 1.6;
}

.recommendation-content ul,
.recommendation-content ol {
  margin: 10px 0;
  padding-left: 20px;
}

.recommendation-content li {
  margin: 5px 0;
  line-height: 1.5;
}

.recommendation-content blockquote {
  border-left: 4px solid rgba(61, 124, 74, 0.5);
  padding-left: 15px;
  margin: 15px 0;
  font-style: italic;
  background-color: rgba(61, 124, 74, 0.05);
  padding: 10px 15px;
  border-radius: 5px;
}

.recommendation-content code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.recommendation-content pre {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  margin: 15px 0;
}

.recommendation-content pre code {
  background: none;
  padding: 0;
}

/* Section formatting styles */
.section-separator {
  text-align: center;
  margin: 15px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  font-weight: 400;
}

.section-indented {
  margin-left: 20px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
}

.dot-symbol {
  color: rgba(61, 124, 74, 1);
  font-weight: bold;
  margin-right: 8px;
  margin-top: 2px;
  flex-shrink: 0;
}

.indented-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
}

.section-with-colon {
  margin-bottom: 8px;
  line-height: 1.5;
}

.before-colon {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.colon {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 2px;
  font-weight: 500;
}

.after-colon {
  color: rgba(255, 255, 255, 0.9);
  margin-left: 4px;
}

.section-line {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

/* No Recommendations */
.no-recommendations {
  margin-top: 30px;
}

.no-recommendations-text {
  font-size: 18px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* Hidden content when unable to generate response */
.hidden-content {
  display: none;
}

/* Loading and Error States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid rgba(255, 255, 255, 1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 20px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(255, 0, 0, 0.3);
}

.error-title {
  font-size: 28px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  margin: 0 0 15px 0;
}

.error-message {
  font-size: 18px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.retry-button {
  background: linear-gradient(135deg, #3d7c4a 0%, #2d5a37 100%);
  color: white;
  border: none;
  padding: 14px 35px;
  border-radius: 25px;
  font-size: 16px;
  font-family: "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(61, 124, 74, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(61, 124, 74, 0.4);
  background: linear-gradient(135deg, #4a8c5a 0%, #3d6a47 100%);
}

.retry-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(61, 124, 74, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .recommendations-content {
    padding: 30px 15px;
    margin-top: 70px;
  }

  .back-button-container {
    top: 90px;
  }

  .recommendations-title {
    font-size: 30px;
  }

  .summary-text {
    font-size: 18px;
    padding: 15px;
  }

  .recommendation-content {
    font-size: 16px;
  }

  .recommendation-card {
    padding: 20px;
  }

  .recommendation-title {
    font-size: 18px;
  }

  .recommendation-icon {
    font-size: 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .section-content {
    font-size: 14px;
  }

  .section-indented {
    margin-left: 15px;
  }

  .dot-symbol {
    margin-right: 6px;
  }

  .section-separator {
    font-size: 14px;
    margin: 12px 0;
  }

  .after-colon {
    margin-left: 2px;
  }
}

@media (max-width: 480px) {
  .recommendations-content {
    padding: 20px 10px;
    margin-top: 100px;
  }

  .back-button-container {
    top: 110px;
  }

  .recommendations-title {
    font-size: 26px;
  }

  .summary-text {
    font-size: 16px;
    padding: 12px;
  }

  .recommendation-content {
    font-size: 15px;
  }

  .recommendation-card {
    padding: 15px;
  }

  .recommendation-title {
    font-size: 16px;
  }

  .recommendation-icon {
    font-size: 18px;
  }

  .section-title {
    font-size: 15px;
  }

  .section-content {
    font-size: 13px;
  }

  .section-indented {
    margin-left: 12px;
  }

  .dot-symbol {
    margin-right: 4px;
  }

  .section-separator {
    font-size: 13px;
    margin: 10px 0;
  }

  .after-colon {
    margin-left: 1px;
  }
}
</style>

<template>
  <div class="result-page">
    <!-- Header -->
    <Header />

    <!-- Popup for zero values -->
    <div v-if="showZeroValuesPopup" class="popup-overlay" @click="closePopup">
      <div class="popup-content" @click.stop>
        <div class="popup-header">
          <h3>No Values Set</h3>
        </div>
        <div class="popup-body">
          <p>Please set at least one value to get a result</p>
          <p class="popup-subtitle">You will be returned to the calculator to enter your data.</p>
        </div>
        <div class="popup-footer">
          <button class="popup-button" @click="closePopup">Go to Calculator</button>
        </div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="back-button-container">
      <button class="nav-button back-button" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div class="result-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Calculating your carbon footprint...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="apiError" class="error-container">
          <h2 class="error-title">Calculation Error</h2>
          <p class="error-message">{{ apiError }}</p>
          <button @click="retryCalculation" class="retry-button">Retry</button>
        </div>

        <!-- Results Content -->
        <div v-else>
        <!-- Main Title -->
        <h1 class="result-title">{{ resultTitle }}</h1>

        <!-- Description -->
        <p class="result-description">{{ resultDescription }}</p>

        <!-- Carbon Footprint Display -->
        <div class="footprint-container">
          <div class="footprint-value">{{ totalFootprint }} kg CO2</div>
          <div class="footprint-unit" v-if="currentResultType === 'household' || currentResultType === 'shopping'">{{ t('result.perMonth') }}</div>
          <div class="footprint-unit" v-else>{{ t('result.perWeek') }}</div>
        </div>

        <!-- Breakdown Sections -->
        <div class="breakdown-sections" v-if="parseFloat(carFootprint) > 0 || parseFloat(motorcycleFootprint) > 0 || parseFloat(publicTransportFootprint) > 0 || breakdownCards.length > 0">
          <!-- Debug info for travel type -->
          <!-- <div v-if="currentResultType === 'travel'" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px;">
            <strong>Debug Info:</strong><br>
            carFootprint: {{ carFootprint }}<br>
            motorcycleFootprint: {{ motorcycleFootprint }}<br>
            publicTransportFootprint: {{ publicTransportFootprint }}<br>
            publicTransportBreakdown: {{ JSON.stringify(publicTransportBreakdown) }}
          </div> -->
          <!-- Travel/Private Transport Breakdown -->
          <div class="breakdown-section" v-if="parseFloat(carFootprint) > 0 || parseFloat(motorcycleFootprint) > 0">
            <h3 class="section-title">Private Transport Breakdown</h3>
            <div class="breakdown-list">
              <div class="breakdown-item" v-if="parseFloat(carFootprint) > 0">
                <span class="breakdown-label">Cars</span>
                <span class="breakdown-value">{{ carFootprint }} kg CO2</span>
              </div>
              <div class="breakdown-item" v-if="parseFloat(motorcycleFootprint) > 0">
                <span class="breakdown-label">Motorcycles</span>
                <span class="breakdown-value">{{ motorcycleFootprint }} kg CO2</span>
              </div>
            </div>
          </div>

          <!-- Public Transport Breakdown -->
          <div class="breakdown-section" v-if="parseFloat(publicTransportFootprint) > 0">
            <h3 class="section-title">Public Transport Details</h3>
            <div class="breakdown-list">
              <div class="breakdown-item" v-if="publicTransportBreakdown.lrt > 0">
                <span class="breakdown-label">LRT</span>
                <span class="breakdown-value">{{ publicTransportBreakdown.lrt.toFixed(2) }} kg CO2</span>
              </div>
              <div class="breakdown-item" v-if="publicTransportBreakdown.mrt > 0">
                <span class="breakdown-label">MRT</span>
                <span class="breakdown-value">{{ publicTransportBreakdown.mrt.toFixed(2) }} kg CO2</span>
              </div>
              <div class="breakdown-item" v-if="publicTransportBreakdown.ktm > 0">
                <span class="breakdown-label">KTM</span>
                <span class="breakdown-value">{{ publicTransportBreakdown.ktm.toFixed(2) }} kg CO2</span>
              </div>
              <div class="breakdown-item" v-if="publicTransportBreakdown.monorail > 0">
                <span class="breakdown-label">Monorail</span>
                <span class="breakdown-value">{{ publicTransportBreakdown.monorail.toFixed(2) }} kg CO2</span>
              </div>
              <div class="breakdown-item" v-if="publicTransportBreakdown.bus > 0">
                <span class="breakdown-label">Bus (Detailed)</span>
                <span class="breakdown-value">{{ publicTransportBreakdown.bus.toFixed(2) }} kg CO2</span>
              </div>
              <div class="breakdown-item" v-if="publicTransportBreakdown.bus_simple > 0">
                <span class="breakdown-label">Bus (Simple)</span>
                <span class="breakdown-value">{{ publicTransportBreakdown.bus_simple.toFixed(2) }} kg CO2</span>
              </div>
              <div class="breakdown-item" v-if="publicTransportBreakdown.train_simple > 0">
                <span class="breakdown-label">Train (Simple)</span>
                <span class="breakdown-value">{{ publicTransportBreakdown.train_simple.toFixed(2) }} kg CO2</span>
              </div>
            </div>
          </div>

          <!-- Household Breakdown Cards -->
          <div
            v-for="(card, index) in breakdownCards"
            :key="`household-breakdown-${index}`"
            class="breakdown-section"
          >
            <h3 class="section-title">{{ card.title }}</h3>
            <div class="breakdown-list">
              <div
                v-for="(item, index) in getFilteredBreakdownItems(card.data)"
                :key="index"
                class="breakdown-item"
              >
                <span class="breakdown-label">{{ item.label }}</span>
                <span class="breakdown-value">{{ item.value }} kg CO2</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tree Planting Message -->
        <div class="trees-message">
          <p>{{ t('result.treePlanting') }}</p>
          <div class="trees-value">{{ treesNeeded.toFixed(2) }}</div>
          <p v-if="currentResultType === 'household' || currentResultType === 'shopping'">{{ t('result.trees') }} {{ t('result.annually') }} {{ t('result.toAbsorb') }} {{ t('result.monthlyCO2') }}.</p>
          <p v-else>{{ t('result.trees') }} {{ t('result.tenYears') }} {{ t('result.toAbsorb') }} {{ t('result.weeklyCO2') }}.</p>
        </div>

        <!-- Tree Images Display -->
        <div class="trees-visual-container">
          <!-- Complete trees (maximum 20) -->
          <div
            v-for="(tree, index) in Math.min(Math.floor(treesNeeded), 20)"
            :key="`complete-${index}`"
            class="tree-image-wrapper"
          >
            <img
              src="/img/FigmaDDSSlicePNGdaf978382374dc7320e036e93b35bb9d.png"
              alt="Tree sapling"
              class="tree-image"
            />
          </div>

          <!-- Partial tree (if there's a decimal part and we haven't exceeded the display limit) -->
          <div
            v-if="treesNeeded % 1 > 0 && Math.floor(treesNeeded) < 20"
            class="tree-image-wrapper partial-tree"
          >
            <div class="partial-tree-container">
              <img
                src="/img/FigmaDDSSlicePNGdaf978382374dc7320e036e93b35bb9d.png"
                alt="Partial tree sapling"
                class="tree-image partial-tree-image"
                :style="{ clipPath: `inset(0 0 ${(1 - (treesNeeded % 1)) * 100}% 0)` }"
              />
            </div>
          </div>

          <div v-if="Math.ceil(treesNeeded) > 20" class="trees-overflow-message">
            <span class="trees-overflow-text">... and {{ Math.ceil(treesNeeded) - 20 }} more trees</span>
          </div>
        </div>

        <!-- Generate Recommendations Button -->
        <div class="details-button-container">
          <button @click="navigateToRecommendations" class="details-button">
            <span>Generate Recommendations</span>
          </button>
        </div>
        </div> <!-- End of results content -->
      </div>

    <!-- 聊天机器人组件 -->
    <ChatBot />

    <!-- 计算器按钮组 -->
    <div class="calculator-buttons">
      <button class="calc-button" @click="navigateToCalculator('travel')">
        <div class="button-icon">🚗</div>
        <div class="button-text">Travel</div>
      </button>
      <button class="calc-button" @click="navigateToCalculator('household')">
        <div class="button-icon">🏠</div>
        <div class="button-text">Household</div>
      </button>
      <button class="calc-button" @click="navigateToCalculator('shopping')">
        <div class="button-icon">🛒</div>
        <div class="button-text">Shopping</div>
      </button>
      <button class="calc-button" @click="navigateToCalculator('food')">
        <div class="button-icon">🍽️</div>
        <div class="button-text">Food</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ChatBot from './components/ChatBot.vue'
import Header from '@/views/components/header.vue'
// Disabled: Non-API calculations are not allowed
// import '@/scripts/calculator.js'
// Import API functions
import { calculateTravel, calculateHousehold, calculateFood, calculateShopping } from '@/services/api'

const route = useRoute()
const { t } = useI18n()

// Reactive data for displaying results
const totalFootprint = ref<string>('0.00')
const treesNeeded = ref<number>(0)
const carFootprint = ref<string>('0.00')
const motorcycleFootprint = ref<string>('0.00')
const publicTransportFootprint = ref<string>('0.00')
const publicTransportBreakdown = ref<Record<string, number>>({})

// Breakdown cards for household data
const breakdownCards = ref<any[]>([])

// Popup state
const showZeroValuesPopup = ref<boolean>(false)

// API loading and error states
const isLoading = ref<boolean>(false)
const apiError = ref<string | null>(null)

// Dynamic content based on result type
const resultTitle = ref<string>('RESULT - TRAVEL')
const resultDescription = ref<string>('Your total weekly carbon footprint for this category is')

// Update titles and descriptions based on language and result type
const updateLocalizedContent = () => {
  if (route.query.type === 'travel') {
    resultTitle.value = t('result.travelResult')
    resultDescription.value = t('result.weeklyFootprint')
  } else if (route.query.type === 'household') {
    resultTitle.value = t('result.householdResult')
    resultDescription.value = t('result.monthlyFootprint')
  } else if (route.query.type === 'shopping') {
    resultTitle.value = t('result.shoppingResult')
    resultDescription.value = t('result.shoppingFootprint')
  } else if (route.query.type === 'food') {
    resultTitle.value = t('result.foodResult')
    resultDescription.value = t('result.foodFootprint')
  }
}

// Current result type for conditional rendering
const currentResultType = ref<string>('travel')

// Function to filter breakdown items
function getFilteredBreakdownItems(data: Record<string, number>) {
  return Object.entries(data)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value: parseFloat(value.toFixed(2))
    }))
}

// Router for navigation
const router = useRouter()

// Safely reference calculator utilities
type MaybeCalcUtils = {
  calculateTotalFootprint?: () => {
    totalFootprint: number
    treesNeeded: number
    carFootprint: number
    motorcycleFootprint: number
    publicTransportFootprint: number
    publicTransportBreakdown: Record<string, number>
  }
  clearAllValues?: () => void
}

const getCalculatorUtils = (): MaybeCalcUtils => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).calculatorUtils || {}
  } catch {
    return {}
  }
}

// Function to check if all values are zero
function checkForZeroValues() {
  // For travel data, check individual components as well as total
  if (route.query.type === 'travel' || route.query.type === 'private') {
    const carValue = parseFloat(carFootprint.value) || 0
    const motorcycleValue = parseFloat(motorcycleFootprint.value) || 0
    const publicTransportValue = parseFloat(publicTransportFootprint.value) || 0
    const totalValue = parseFloat(totalFootprint.value) || 0
    
    // Check if all individual components and total are zero
    return carValue === 0 && motorcycleValue === 0 && 
           publicTransportValue === 0 && totalValue === 0
  }
  
  // For other types, just check total footprint
  const footprint = parseFloat(totalFootprint.value)
  return footprint === 0 || footprint < 0.01
}

// Function to close popup and navigate back to the appropriate calculator
function closePopup() {
  showZeroValuesPopup.value = false
  goBack()
}

// Function to go back to the originating page
function goBack() {
  if (route.query.type === 'travel') {
    router.push('/travel-private')
  } else if (route.query.type === 'private') {
    router.push('/travel-private')
  } else if (route.query.type === 'household') {
    router.push('/household-calculator')
  } else if (route.query.type === 'shopping') {
    router.push('/shopping-calculator')
  } else if (route.query.type === 'food') {
    router.push('/calculator/food')
  } else {
    // Default fallback
    router.push('/travel-private')
  }
}

// Function to navigate to recommendations page
function navigateToRecommendations() {
  // Get the current calculation data from route query
  const category = route.query.type as string
  const emissions = parseFloat(totalFootprint.value)
  
  // Get calculation data if available and convert frequency numbers to words
  let calculationData = undefined
  if (route.query.data) {
    try {
      const rawData = JSON.parse(route.query.data as string)
      
      // Convert frequency numbers to words for food category
      if (category === 'food') {
        const frequencyLabels = [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Infrequently' },
          { value: 2, label: 'Occasionally' },
          { value: 3, label: 'Often' },
          { value: 4, label: 'Very Often' }
        ]
        
        const getFrequencyString = (value: number) => {
          const frequency = frequencyLabels.find(f => f.value === value)
          return frequency ? frequency.label : 'Never'
        }
        
        calculationData = {
          ...rawData,
          animal_products_frequency: getFrequencyString(rawData.animal_products_frequency || 0),
          fruit_veg_frequency: getFrequencyString(rawData.fruit_veg_frequency || 0),
          grain_frequency: getFrequencyString(rawData.grain_frequency || 0)
        }
      } else {
        // For other categories, pass data as-is
        calculationData = rawData
      }
    } catch (error) {
      console.error('Error parsing calculation data:', error)
    }
  }
  
  // Navigate to recommendations page with required parameters
  router.push({
    path: '/recommendations',
    query: {
      category,
      emissions: emissions.toString(),
      calculationData: calculationData ? JSON.stringify(calculationData) : undefined
    }
  })
}

// Function to navigate to calculator pages
function navigateToCalculator(type: string) {
  router.push(`/calculator/${type}`)
}

// API calculation functions
async function calculateWithAPI(calculatorType: string, data: any) {
  isLoading.value = true
  apiError.value = null
  
  try {
    let result
    switch (calculatorType) {
      case 'travel':
        result = await calculateTravel(data)
        break
      case 'household':
        result = await calculateHousehold(data)
        break
      case 'food':
        result = await calculateFood(data)
        break
      case 'shopping':
        result = await calculateShopping(data)
        break
      default:
        throw new Error(`Unknown calculator type: ${calculatorType}`)
    }
    
    if (!result.success) {
      throw new Error(result.message || 'API calculation failed')
    }
    
    return result
  } catch (error) {
    console.error(`Error calculating ${calculatorType} emissions:`, error)
    apiError.value = error instanceof Error ? error.message : 'Unknown error occurred'
    throw error
  } finally {
    isLoading.value = false
  }
}

// Function to format travel API response
function formatTravelResult(apiResult: any) {
  const totalEmissions = apiResult.totalEmissions || 0
  const treeSaplingsNeeded = parseFloat(apiResult.treeSaplingsNeeded || '0')
  
  // Extract private transport breakdown
  let carFootprint = 0
  let motorcycleFootprint = 0
  if (apiResult.results?.privateTransport?.breakdown) {
    apiResult.results.privateTransport.breakdown.forEach((item: any) => {
      if (item.vehicleType === 'car') {
        carFootprint += item.emissions || 0
      } else if (item.vehicleType === 'motorbike') {
        motorcycleFootprint += item.emissions || 0
      }
    })
  }
  
  // Extract public transport breakdown
  let publicTransportFootprint = 0
  const publicTransportBreakdown: Record<string, number> = {}
  if (apiResult.results?.publicTransport?.breakdown) {
    apiResult.results.publicTransport.breakdown.forEach((item: any) => {
      const transportType = item.transportType?.toLowerCase()
      const emissions = item.emissions || 0
      publicTransportFootprint += emissions
      
      if (transportType) {
        publicTransportBreakdown[transportType] = (publicTransportBreakdown[transportType] || 0) + emissions
      }
    })
  }
  
  return {
    totalFootprint: totalEmissions.toFixed(2),
    treesNeeded: parseFloat(treeSaplingsNeeded.toFixed(2)),
    carFootprint: carFootprint.toFixed(2),
    motorcycleFootprint: motorcycleFootprint.toFixed(2),
    publicTransportFootprint: publicTransportFootprint.toFixed(2),
    publicTransportBreakdown,
    breakdownCards: []
  }
}

// Function to format household API response
function formatHouseholdResult(apiResult: any) {
  const totalEmissions = apiResult.totalMonthlyEmissions || 0
  const treeSaplingsNeeded = parseFloat(apiResult.treeSaplingsNeeded || '0')
  
  // Create breakdown cards from API response
  const breakdownCards: Array<{title: string, data: Record<string, number>}> = []
  if (apiResult.results?.breakdown) {
    const breakdown = apiResult.results.breakdown
    const cardData: Record<string, number> = {}
    
    breakdown.forEach((item: any) => {
      if (item.category && item.monthlyEmissions > 0) {
        cardData[item.category] = parseFloat(item.monthlyEmissions.toFixed(2))
      }
    })
    
    if (Object.keys(cardData).length > 0) {
      breakdownCards.push({
        title: 'Monthly Emissions Breakdown',
        data: cardData
      })
    }
  }
  
  return {
    totalFootprint: totalEmissions.toFixed(2),
    treesNeeded: parseFloat(treeSaplingsNeeded.toString()),
    carFootprint: '0',
    motorcycleFootprint: '0',
    publicTransportFootprint: '0',
    publicTransportBreakdown: {},
    breakdownCards
  }
}

// Function to format food API response
function formatFoodResult(apiResult: any) {
  const totalEmissions = apiResult.totalEmissions || 0
  const treeSaplingsNeeded = parseFloat(apiResult.treeSaplingsNeeded || '0')
  
  // Create breakdown cards from API response
  const breakdownCards: Array<{title: string, data: Record<string, number>}> = []
  if (apiResult.results?.groups) {
    Object.values(apiResult.results.groups).forEach((group: any) => {
      if (group.total > 0) {
        const cardData: Record<string, number> = {}
        if (group.breakdown) {
          group.breakdown.forEach((item: any) => {
            cardData[item.foodType] = parseFloat((item.emissions || 0).toFixed(2))
          })
        }
        
        if (Object.keys(cardData).length > 0) {
          breakdownCards.push({
            title: group.name,
            data: cardData
          })
        }
      }
    })
  }
  
  return {
    totalFootprint: totalEmissions.toFixed(2),
    treesNeeded: parseFloat(treeSaplingsNeeded.toString()),
    carFootprint: '0',
    motorcycleFootprint: '0',
    publicTransportFootprint: '0',
    publicTransportBreakdown: {},
    breakdownCards
  }
}

// Function to format shopping API response
function formatShoppingResult(apiResult: any) {
  const totalEmissions = apiResult.totalEmissions || 0
  const treeSaplingsNeeded = parseFloat(apiResult.treeSaplingsNeeded || '0')
  
  // Create breakdown cards from API response
  const breakdownCards: Array<{title: string, data: Record<string, number>}> = []
  if (apiResult.results?.groups) {
    Object.values(apiResult.results.groups).forEach((group: any) => {
      if (group.total > 0) {
        const cardData: Record<string, number> = {}
        if (group.breakdown) {
          group.breakdown.forEach((item: any) => {
            cardData[item.type] = parseFloat((item.emissions || 0).toFixed(2))
          })
        }
        
        if (Object.keys(cardData).length > 0) {
          breakdownCards.push({
            title: group.name,
            data: cardData
          })
        }
      }
    })
  }
  
  return {
    totalFootprint: totalEmissions.toFixed(2),
    treesNeeded: parseFloat(treeSaplingsNeeded.toString()),
    carFootprint: '0',
    motorcycleFootprint: '0',
    publicTransportFootprint: '0',
    publicTransportBreakdown: {},
    breakdownCards
  }
}

// Calculate and display results
async function calculateAndDisplayResults() {
  console.log('calculateAndDisplayResults called')
  console.log('route.query:', route.query)
  console.log('sessionStorage foodCarbonResult:', sessionStorage.getItem('foodCarbonResult'))
  
  // 检查是否有来自路由参数的数据
  if (route.query.type && route.query.data) {
    try {
      const resultData = JSON.parse(route.query.data as string)
      
      // Parse details data if it exists
      let detailsData = {}
      if (route.query.details) {
        try {
          detailsData = JSON.parse(route.query.details as string)
          console.log('Parsed details data:', detailsData)
        } catch (error) {
          console.error('Error parsing details data:', error)
        }
      }
      
      // Add details to resultData for API conversion
      if (Object.keys(detailsData).length > 0) {
        resultData.details = detailsData
      }
      
      // Check for zero values on original data before API call
      if (route.query.type === 'travel' || route.query.type === 'private') {
        // For travel, check both detailed data and simple data
        // Priority: detailed data over simple data
        let hasAnyValue = false
        
        // First check if there's detailed data
        if (resultData.details && Object.keys(resultData.details).length > 0) {
          console.log('Checking detailed data for travel:', resultData.details)
          hasAnyValue = Object.values(resultData.details).some((questionData: any) => {
            console.log('Checking question data:', questionData)
            // Check for private transport (cars, motorcycles)
            if (questionData.vehicles) {
              console.log('Found vehicles data:', questionData.vehicles)
              // Check cars
              if (questionData.vehicles.cars && Array.isArray(questionData.vehicles.cars)) {
                const hasCarValue = questionData.vehicles.cars.some((car: any) => car.distance && car.distance > 0)
                console.log('Cars check result:', hasCarValue)
                if (hasCarValue) return true
              }
              // Check motorcycles
              if (questionData.vehicles.motorcycles && Array.isArray(questionData.vehicles.motorcycles)) {
                const hasMotorcycleValue = questionData.vehicles.motorcycles.some((motorcycle: any) => motorcycle.distance && motorcycle.distance > 0)
                console.log('Motorcycles check result:', hasMotorcycleValue)
                if (hasMotorcycleValue) return true
              }
            }
            // Check for public transport (lrt, mrt, ktm, monorail, bus)
            if (questionData.transport) {
              console.log('Found transport data:', questionData.transport)
              const transportValues = Object.values(questionData.transport)
              const hasTransportValue = transportValues.some((value: any) => typeof value === 'number' && value > 0)
              console.log('Transport values:', transportValues, 'Has transport value:', hasTransportValue)
              if (hasTransportValue) return true
            }
            return false
          })
        }
        
        // If no detailed data or no values in detailed data, check simple data
        if (!hasAnyValue) {
          const carValue = parseFloat(resultData.car) || 0
          const motorcycleValue = parseFloat(resultData.motorcycle) || 0
          const busValue = parseFloat(resultData.bus) || 0
          const trainValue = parseFloat(resultData.train) || 0
          
          hasAnyValue = carValue > 0 || motorcycleValue > 0 || busValue > 0 || trainValue > 0
        }
        
        console.log('Pre-API zero value check (travel) - Raw input values:', resultData)
        console.log('Pre-API zero value check (travel) - Details data:', resultData.details)
        console.log('Has any value > 0:', hasAnyValue)
        
        // If no values are greater than 0, show popup and return early
        if (!hasAnyValue) {
          console.log('Zero values detected in travel input data, showing popup')
          showZeroValuesPopup.value = true
          return
        }
      } else if (route.query.type === 'household') {
        // For household, check simple data only (no detailed data functionality)
        const hasAnyValue = Object.values(resultData).some(value => 
          typeof value === 'number' && value > 0
        )
        
        console.log('Pre-API zero value check (household) - Raw input values:', resultData)
        console.log('Has any value > 0:', hasAnyValue)
        
        // If no values are greater than 0, show popup and return early
        if (!hasAnyValue) {
          console.log('Zero values detected in household input data, showing popup')
          showZeroValuesPopup.value = true
          return
        }
      } else if (route.query.type === 'shopping') {
        // For shopping, check if any input values are greater than 0
        // Priority: detailed data over simple data
        let hasAnyValue = false
        
        // First check if there's detailed data with weight values
        if (resultData.details && Object.keys(resultData.details).length > 0) {
          hasAnyValue = Object.values(resultData.details).some((items: any) => {
            if (Array.isArray(items)) {
              return items.some((item: any) => item.weight && item.weight > 0)
            }
            return false
          })
        }
        
        // If no detailed data or no values in detailed data, check simple data
        if (!hasAnyValue) {
          hasAnyValue = Object.values(resultData).some(value => 
            typeof value === 'number' && value > 0
          )
        }
        
        console.log('Pre-API zero value check (shopping) - Raw input values:', resultData)
        console.log('Has any value > 0:', hasAnyValue)
        
        // If no values are greater than 0, show popup and return early
        if (!hasAnyValue) {
          console.log('Zero values detected in shopping input data, showing popup')
          showZeroValuesPopup.value = true
          return
        }
      } else if (route.query.type === 'food') {
        // For food, check both raw input values and detailed data
        // Priority: detailed data over simple data
        let hasAnyValue = false
        
        // First check if there's detailed data with weight values
        if (resultData.details && Object.keys(resultData.details).length > 0) {
          hasAnyValue = Object.values(resultData.details).some((items: any) => {
            if (Array.isArray(items)) {
              return items.some((item: any) => item.weight && item.weight > 0)
            }
            return false
          })
        }
        
        // If no detailed data or no values in detailed data, check simple data
        if (!hasAnyValue) {
          hasAnyValue = Object.values(resultData).some(value => 
            typeof value === 'number' && value > 0
          )
        }
        
        console.log('Pre-API zero value check (food) - Raw input values:', resultData)
        console.log('Has any value > 0:', hasAnyValue)
        
        // If no values are greater than 0, show popup and return early
        if (!hasAnyValue) {
          console.log('Zero values detected in food input data, showing popup')
          showZeroValuesPopup.value = true
          return
        }
      }
      
      // Handle food calculations - make API call with raw input data
      if (route.query.type === 'food') {
        console.log('Food calculation - making API call with raw input data:', resultData)
        try {
          const apiData = convertFoodDataForAPI(resultData)
          console.log('Converting food data for API:', apiData)
          
          const apiResult = await calculateWithAPI('food', apiData)
          console.log('Food API response:', apiResult)
          
          const formattedResult = formatFoodResult(apiResult)
          currentResultType.value = 'food'
          
          // Update localized content
          updateLocalizedContent()
          
          // Set the formatted results
          totalFootprint.value = formattedResult.totalFootprint
          treesNeeded.value = formattedResult.treesNeeded
          breakdownCards.value = formattedResult.breakdownCards
          
          console.log('Food results displayed:', formattedResult)
          return
        } catch (error) {
          console.error('Food API calculation failed:', error)
          apiError.value = 'Food calculation requires API connection. Please ensure the API is available and try again.'
          return
        }
      }
      
      // API-only calculations for other types - no fallback to mock data
      try {
        await calculateWithAPIAndDisplay(route.query.type as string, resultData)
        return
      } catch (error) {
        console.error('API calculation failed:', error)
        apiError.value = `${route.query.type} calculation requires API connection. Please ensure the API is available and try again.`
        return
      }
      
      // Disabled: Mock data handling removed
      if (false && route.query.type === 'travel') {
        console.log('Travel data received:', resultData)
        currentResultType.value = 'travel'
        updateLocalizedContent()
        totalFootprint.value = resultData.totalFootprint
        carFootprint.value = resultData.carFootprint
        motorcycleFootprint.value = resultData.motorcycleFootprint
        publicTransportFootprint.value = resultData.publicTransportFootprint
        publicTransportBreakdown.value = {
          bus: 0,
          bus_simple: parseFloat(resultData.busFootprint || '0'),
          train_simple: parseFloat(resultData.trainFootprint || '0'),
          lrt: 0,
          mrt: 0,
          ktm: 0,
          monorail: 0
        }
        console.log('Public transport breakdown for travel:', publicTransportBreakdown.value)
        breakdownCards.value = []

        // 计算需要的树木数量 (每棵树每年吸收22kg CO2)
        treesNeeded.value = parseFloat((parseFloat(resultData.totalFootprint) / 22).toFixed(2))
        
        // Debug: Log the values being checked
        console.log('Zero value check - Car:', carFootprint.value, 'Motorcycle:', motorcycleFootprint.value, 'Public Transport:', publicTransportFootprint.value, 'Total:', totalFootprint.value)
        
        // Check if all values are zero and show popup if needed
        if (checkForZeroValues()) {
          console.log('Zero values detected, showing popup')
          showZeroValuesPopup.value = true
        } else {
          console.log('Non-zero values detected, not showing popup')
        }
      } else if (false && route.query.type === 'private') {
        // 来自PrivateSimple页面的数据（向后兼容）
        currentResultType.value = 'private'
        updateLocalizedContent()
        totalFootprint.value = resultData.totalFootprint
        carFootprint.value = resultData.carFootprint
        motorcycleFootprint.value = resultData.motorcycleFootprint
        publicTransportFootprint.value = '0.00'
        publicTransportBreakdown.value = {}
        breakdownCards.value = []

        // 计算需要的树木数量 (每棵树每年吸收22kg CO2)
        treesNeeded.value = parseFloat((parseFloat(resultData.totalFootprint) / 22).toFixed(2))
        
        // Debug: Log the values being checked
        console.log('Zero value check (private) - Car:', carFootprint.value, 'Motorcycle:', motorcycleFootprint.value, 'Public Transport:', publicTransportFootprint.value, 'Total:', totalFootprint.value)
        
        // Check if all values are zero and show popup if needed
        if (checkForZeroValues()) {
          console.log('Zero values detected (private), showing popup')
          showZeroValuesPopup.value = true
        } else {
          console.log('Non-zero values detected (private), not showing popup')
        }
      } else if (false && route.query.type === 'household') {
        // 来自HouseholdCalculator页面的数据
        console.log('Household data received:', resultData)
        currentResultType.value = 'household'
        updateLocalizedContent()
        totalFootprint.value = resultData.totalFootprint
        carFootprint.value = '0'
        motorcycleFootprint.value = '0'
        publicTransportFootprint.value = '0'
        publicTransportBreakdown.value = {}
        breakdownCards.value = resultData.breakdownCards || []
        console.log('Breakdown cards:', breakdownCards.value)

        // 计算需要的树木数量 (每棵树每年吸收22kg CO2, household数据是月度数据)
        treesNeeded.value = parseFloat(((parseFloat(resultData.totalFootprint) * 12) / 22).toFixed(2))
        
        // Check if all values are zero and show popup if needed
        if (checkForZeroValues()) {
          showZeroValuesPopup.value = true
        }
      } else if (false && route.query.type === 'shopping') {
        // 来自ShoppingCalculator页面的数据
        console.log('Shopping data received:', resultData)
        currentResultType.value = 'shopping'
        updateLocalizedContent()
        totalFootprint.value = resultData.totalFootprint
        carFootprint.value = '0'
        motorcycleFootprint.value = '0'
        publicTransportFootprint.value = '0'
        publicTransportBreakdown.value = {}
        breakdownCards.value = resultData.breakdownCards || []
        console.log('Breakdown cards:', breakdownCards.value)

        // 计算需要的树木数量 (每棵树每年吸收22kg CO2, shopping数据是月度数据)
        treesNeeded.value = parseFloat(((parseFloat(resultData.totalFootprint) * 12) / 22).toFixed(2))
        
        // Check if all values are zero and show popup if needed
        if (checkForZeroValues()) {
          showZeroValuesPopup.value = true
        }
      } else if (route.query.type === 'food') {
        // Food calculations should only use API - no mock data
        console.error('Food calculation should use API only. No mock data available.')
        apiError.value = 'Food calculation requires API connection. Please try again.'
      }
    } catch (error) {
      console.error('Error parsing result data:', error)
      // Disabled: No fallback to non-API calculations
      apiError.value = 'Error parsing calculation data. Please try again.'
    }
  } else {
    // 检查sessionStorage中是否有food结果数据
    console.log('Checking sessionStorage for food result data')
    const foodResult = sessionStorage.getItem('foodCarbonResult')
    console.log('foodResult from sessionStorage:', foodResult)
    if (foodResult) {
      try {
        const resultData = JSON.parse(foodResult)
        console.log('Food data from sessionStorage:', resultData)
        
        // Use API for food calculation
        try {
          await calculateWithAPIAndDisplay('food', resultData)
          // Clear sessionStorage after successful API call
        sessionStorage.removeItem('foodCarbonResult')
          return
        } catch (error) {
          console.error('API calculation failed for food:', error)
          apiError.value = 'Failed to calculate food carbon footprint. Please try again.'
          sessionStorage.removeItem('foodCarbonResult')
          return
        }
      } catch (error) {
        console.error('Error parsing food result data:', error)
        apiError.value = 'Error parsing food calculation data. Please try again.'
      }
    } else {
      // Disabled: No fallback to non-API calculations
      console.error('No calculation data available and non-API calculations are disabled.')
      apiError.value = 'No calculation data available. Please use one of the calculators to generate data.'
    }
  }
}

// Function to call API and display results
async function calculateWithAPIAndDisplay(calculatorType: string, data: any) {
  // Convert data to API format based on calculator type
  let apiData
  switch (calculatorType) {
    case 'travel':
      apiData = convertTravelDataForAPI(data)
      break
    case 'household':
      apiData = convertHouseholdDataForAPI(data)
      break
    case 'food':
      apiData = convertFoodDataForAPI(data)
      break
    case 'shopping':
      apiData = convertShoppingDataForAPI(data)
      break
    default:
      throw new Error(`Unknown calculator type: ${calculatorType}`)
  }
  
  // Log the JSON being passed to the API
  console.log(`Making API request to /api/calculate/${calculatorType} with data:`, JSON.stringify(apiData, null, 2))
  
  // Call API
  const apiResult = await calculateWithAPI(calculatorType, apiData)
  
  // Format and display results
  let formattedResult
  switch (calculatorType) {
    case 'travel':
      formattedResult = formatTravelResult(apiResult)
      currentResultType.value = 'travel'
      break
    case 'household':
      formattedResult = formatHouseholdResult(apiResult)
      currentResultType.value = 'household'
      break
    case 'food':
      formattedResult = formatFoodResult(apiResult)
      currentResultType.value = 'food'
      break
    case 'shopping':
      formattedResult = formatShoppingResult(apiResult)
      currentResultType.value = 'shopping'
      break
    default:
      throw new Error(`Unknown calculator type: ${calculatorType}`)
  }
  
  // Update localized content
  updateLocalizedContent()
  
  // Set the formatted results
  totalFootprint.value = formattedResult.totalFootprint
  treesNeeded.value = formattedResult.treesNeeded
  carFootprint.value = formattedResult.carFootprint || '0'
  motorcycleFootprint.value = formattedResult.motorcycleFootprint || '0'
  publicTransportFootprint.value = formattedResult.publicTransportFootprint || '0'
  publicTransportBreakdown.value = formattedResult.publicTransportBreakdown || {}
  breakdownCards.value = formattedResult.breakdownCards || []
  
  console.log(`API calculation successful for ${calculatorType}:`, formattedResult)
}

// Data conversion functions for API
function convertTravelDataForAPI(data: any) {
  console.log('Converting travel data for API:', data)
  
  // Extract the details data which contains the vehicle information
  const details = data.details || {}
  console.log('Details data:', details)
  
  // The details data is nested under string keys like "0", "1", etc.
  const privateVehicles = details["0"]?.vehicles || { cars: [], motorcycles: [] }
  console.log('Private vehicles extracted:', privateVehicles)
  
  // Get basic slider values from the original answers (not calculated footprints)
  // The data now includes originalValues from the travel calculator
  console.log('Original values from travel calculator:', data.originalValues)
  
  const basicAnswers = {
    car: data.originalValues?.car || 0,
    motorcycle: data.originalValues?.motorcycle || 0,
    bus: data.originalValues?.bus || 0,
    train: data.originalValues?.train || 0
  }
  
  console.log('Basic answers extracted (original slider values):', basicAnswers)
  
  // Convert cars to API format
  let carVehicles = []
  console.log('Private vehicles cars:', privateVehicles.cars)
  console.log('Basic answers car:', basicAnswers.car)
  
  // Check if user submitted detailed car data (clicked "ADD DETAILS" and submitted)
  const hasDetailedCarData = privateVehicles.cars && privateVehicles.cars.length > 0 && 
    privateVehicles.cars.some((car: any) => car.distance > 0)
  
  if (hasDetailedCarData) {
    // User clicked "ADD DETAILS" and submitted - use detailed dropdown values
    console.log('Using detailed car data from modal')
    carVehicles = privateVehicles.cars
      .filter((car: any) => car.distance > 0) // Only include cars with distance > 0
      .map((car: any) => ({
        vehicleType: 'car',
        vehicleSize: car.size || 'average',
        fuelType: car.fuel || 'petrol',
        distance: car.distance || 0
      }))
  } else if (basicAnswers.car > 0) {
    // User didn't click "ADD DETAILS" - use basic slider value with default "average" size
    console.log('Using basic car data with value:', basicAnswers.car)
    carVehicles = [{
      vehicleType: 'car',
      vehicleSize: 'average',
      fuelType: 'petrol',
      distance: basicAnswers.car
    }]
  } else {
    console.log('No car data found')
  }
  
  console.log('Car vehicles result:', carVehicles)
  
  // Convert motorcycles to API format
  let motorcycleVehicles = []
  console.log('Private vehicles motorcycles:', privateVehicles.motorcycles)
  console.log('Basic answers motorcycle:', basicAnswers.motorcycle)
  
  // Check if user submitted detailed motorcycle data (clicked "ADD DETAILS" and submitted)
  const hasDetailedMotorcycleData = privateVehicles.motorcycles && privateVehicles.motorcycles.length > 0 && 
    privateVehicles.motorcycles.some((motorcycle: any) => motorcycle.distance > 0)
  
  if (hasDetailedMotorcycleData) {
    // User clicked "ADD DETAILS" and submitted - use detailed dropdown values
    console.log('Using detailed motorcycle data from modal')
    motorcycleVehicles = privateVehicles.motorcycles
      .filter((motorcycle: any) => motorcycle.distance > 0) // Only include motorcycles with distance > 0
      .map((motorcycle: any) => ({
        vehicleType: 'motorbike',
        vehicleSize: motorcycle.size || 'average',
        fuelType: 'petrol', // Motorcycles are always petrol
        distance: motorcycle.distance || 0
      }))
  } else if (basicAnswers.motorcycle > 0) {
    // User didn't click "ADD DETAILS" - use basic slider value with default "average" size
    console.log('Using basic motorcycle data with value:', basicAnswers.motorcycle)
    motorcycleVehicles = [{
      vehicleType: 'motorbike',
      vehicleSize: 'average',
      fuelType: 'petrol',
      distance: basicAnswers.motorcycle
    }]
  } else {
    console.log('No motorcycle data found')
  }
  
  console.log('Motorcycle vehicles result:', motorcycleVehicles)
  
  // Combine all private transport
  const privateTransport = [...carVehicles, ...motorcycleVehicles]
  
  // Convert public transport data
  const publicTransport = details["1"]?.transport || {}
  console.log('Public transport extracted:', publicTransport)
  
  // Get basic public transport values (when user doesn't click "ADD DETAILS")
  // Use the original slider values from basicAnswers
  const basicPublicTransport = {
    bus: basicAnswers.bus,
    train: basicAnswers.train
  }
  
  console.log('Basic public transport values (from originalValues):', basicPublicTransport)
  console.log('Bus value from originalValues:', data.originalValues?.bus)
  console.log('Train value from originalValues:', data.originalValues?.train)
  
  // Determine if user used detailed public transport data
  const hasDetailedPublicTransport = publicTransport.bus > 0 || 
    publicTransport.lrt > 0 || publicTransport.mrt > 0 || 
    publicTransport.ktm > 0 || publicTransport.monorail > 0
  
  let publicTransportArray = []
  
  if (hasDetailedPublicTransport) {
    // User clicked "ADD DETAILS" - use detailed values
    console.log('Using detailed public transport data from modal')
    
    // Add bus if distance > 0
    if (publicTransport.bus > 0) {
      publicTransportArray.push({
        transportType: "bus",
        distance: publicTransport.bus
      })
    }
    
    // Add LRT if distance > 0
    if (publicTransport.lrt > 0) {
      publicTransportArray.push({
        transportType: "lrt",
        distance: publicTransport.lrt
      })
    }
    
    // Add MRT if distance > 0
    if (publicTransport.mrt > 0) {
      publicTransportArray.push({
        transportType: "mrt",
        distance: publicTransport.mrt
      })
    }
    
    // Add KTM if distance > 0
    if (publicTransport.ktm > 0) {
      publicTransportArray.push({
        transportType: "ktm",
        distance: publicTransport.ktm
      })
    }
    
    // Add Monorail if distance > 0
    if (publicTransport.monorail > 0) {
      publicTransportArray.push({
        transportType: "monorail",
        distance: publicTransport.monorail
      })
    }
  } else if (basicPublicTransport.bus > 0 || basicPublicTransport.train > 0) {
    // User didn't click "ADD DETAILS" - use basic values with default transport type
    console.log('Using basic public transport data with values:', basicPublicTransport)
    
    // Add bus if distance > 0
    if (basicPublicTransport.bus > 0) {
      publicTransportArray.push({
        transportType: "bus",
        distance: basicPublicTransport.bus
      })
    }
    
    // Add train with "average train" type if distance > 0
    if (basicPublicTransport.train > 0) {
      publicTransportArray.push({
        transportType: "average train",
        distance: basicPublicTransport.train
      })
    }
  } else {
    // No public transport data
    console.log('No public transport data found')
  }
  
  const apiData = {
    privateTransport,
    publicTransport: publicTransportArray
  }
  
  console.log('Converted API data:', apiData)
  return apiData
}

function convertHouseholdDataForAPI(data: any) {
  // Convert household data to match the expected API request body format
  return {
    numberOfPeople: data.people || 0,
    electricityUsage: data.electricity || 0,
    waterUsage: data.water || 0,
    wasteDisposal: data.trash || 0
  }
}

function convertFoodDataForAPI(data: any) {
  // Transform the food answers into the new API format with foodItems array
  const foodItems = []
  
  // Frequency labels mapping (same as in FoodCalculator.vue)
  const frequencyLabels = [
    { value: 0, label: 'Never', description: 'Never' },
    { value: 1, label: 'Infrequently', description: 'Once or twice a week' },
    { value: 2, label: 'Occasionally', description: 'Multiple times a week' },
    { value: 3, label: 'Often', description: 'Most days in a week' },
    { value: 4, label: 'Very Often', description: 'Every day' }
  ]
  
  // Helper function to convert slider value to frequency string
  const getFrequencyString = (value: number) => {
    const frequency = frequencyLabels.find(f => f.value === value)
    return frequency ? frequency.label : 'Never'
  }
  
  // Check if user has submitted detailed data from popups
  const hasDetailedData = data.details && Object.keys(data.details).length > 0
  
  if (hasDetailedData) {
    // Use detailed data from popups (user clicked "ADD DETAILS..." and submitted)
    // Map question indices to categories
    const categoryMapping = {
      0: 'animal',    // Animal products
      1: 'plant',     // Fruits and vegetables  
      2: 'grain'      // Grains and staples
    }
    
    Object.keys(data.details).forEach(questionIndex => {
      const index = parseInt(questionIndex)
      const category = categoryMapping[index as keyof typeof categoryMapping]
      if (!category) return
      
      const items = data.details[questionIndex]
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
    const categoriesWithDetails = Object.keys(data.details).map(q => categoryMapping[parseInt(q) as keyof typeof categoryMapping])
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
  console.log('Detail data:', data.details)
  return apiData
}

function convertShoppingDataForAPI(data: any) {
  console.log('Converting shopping data for API:', data)
  
  // Check if we have detailed data from the modal (user clicked Submit on ADD DETAILS)
  const hasDetailedData = data.details && Object.keys(data.details).length > 0
  console.log('Has detailed shopping data:', hasDetailedData)
  
  let shoppingItems: Array<{type: string, quantity: number, subcategoryGroup?: string}> = []
  
  if (hasDetailedData) {
    // Use detailed data from the modal (user submitted ADD DETAILS)
    console.log('Using detailed shopping data from modal:', data.details)
    
    // Process each question's detailed items
    Object.keys(data.details).forEach(questionKey => {
      const questionItems = data.details[questionKey]
      if (Array.isArray(questionItems)) {
        questionItems.forEach((item: any) => {
          if (item.name && item.weight > 0) {
            // Map question index to subcategory group
            const subcategoryGroup = getShoppingSubcategoryGroup(parseInt(questionKey))
            shoppingItems.push({
              type: item.name, // Use specific entity name from dropdown
              quantity: Number(item.weight),
              subcategoryGroup: subcategoryGroup
            })
          }
        })
      }
    })
  } else {
    // Use basic data with "average" type (default behavior)
    console.log('Using basic shopping data with averages (default)')
    
    // Map each input field to appropriate subcategory group
    const categoryMapping: Record<string, string> = {
      'groceries_beverages': 'Groceries & Beverages',
      'home_garden': 'Home & Garden',
      'appliance_electronics': 'Home, Appliances & Electronics',
      'entertainment': 'Entertainment',
      'general_merchandise': 'General Merchandise',
      'clothing': 'Clothing',
      'accessories': 'Accessories',
      'health_pharmacy': 'Health & Pharmacy'
    }
    
    Object.keys(data).forEach((key) => {
      const value = Number(data[key])
      const subcategoryGroup = categoryMapping[key]
      
      if (value > 0 && subcategoryGroup) {
        shoppingItems.push({
          type: 'average', // Default to average type
          quantity: value,
          subcategoryGroup: subcategoryGroup
        })
      }
    })
  }
  
  console.log('Converted shopping items:', shoppingItems)
  
  return {
    shoppingItems: shoppingItems
  }
}

function getShoppingSubcategoryGroup(questionIndex: number): string {
  const subcategoryGroups = [
    'Groceries & Beverages',    // Question 0
    'Home & Garden',            // Question 1  
    'Clothing'                  // Question 2
  ]
  return subcategoryGroups[questionIndex] || 'General Merchandise'
}

// Disabled: Non-API calculations are not allowed
function fallbackToCalculatorUtils() {
  console.error('Non-API calculations are disabled. All calculations must use the API.')
  apiError.value = 'Calculation requires API connection. Please ensure the API is available and try again.'
}

// Language change listener
const handleLanguageChange = () => {
  updateLocalizedContent()
}

// Retry calculation function
async function retryCalculation() {
  apiError.value = null
  await calculateAndDisplayResults()
}

onMounted(async () => {
  // Set loading state immediately for food calculations to show loading spinner
  if (route.query.type === 'food') {
    isLoading.value = true
  }
  
  // Calculate results when component mounts
  await calculateAndDisplayResults()

  // Listen for language changes
  if (typeof window !== 'undefined') {
    window.addEventListener('languageChanged', handleLanguageChange as EventListener)
  }
})

// Add a function to clear all values for testing (can be called from browser console)
// To test the popup: Open browser console and run: clearAllValuesForTesting()
function clearAllValuesForTesting() {
  const utils = getCalculatorUtils()
  if (utils.clearAllValues) {
    utils.clearAllValues()
    // Recalculate to show popup
    calculateAndDisplayResults()
  }
}

// Make the function available globally for testing
if (typeof window !== 'undefined') {
  (window as any).clearAllValuesForTesting = clearAllValuesForTesting
}
</script>

<style scoped>
@import '@/assets/css/style.css';

/* Page container */
.result-page {
  width: 100%;
  min-height: 100vh;
  background-image: url('@/assets/img/result_bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Main content container - center aligned */
.result-content {
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
  top: 100px; /* 在Header下方 */
  left: 20px;
  z-index: 1000;
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
.result-title {
  font-size: 36px;
  font-family: var(--font-display);
  font-weight: 800;
  color: rgba(255, 255, 255, 1);
  margin-bottom: 8px;
  text-align: center;
}

/* Description */
.result-description {
  font-size: 24px;
  font-family: var(--font-display);
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  margin-bottom: 12px;
  text-align: center;
  line-height: 1.4;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

/* Carbon Footprint Display */
.footprint-container {
  margin: 12px 0;
  text-align: center;
}

.footprint-value {
  font-size: 32px;
  font-family: var(--font-display);
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  text-align: center;
  background-color: rgba(61, 124, 74, 0.9);
  padding: 20px 40px;
  border-radius: 15px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  display: inline-block;
  min-width: 200px;
}

/* Breakdown Sections */
.breakdown-sections {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin: 12px 0;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 1200px;
  width: 100%;
}

.breakdown-section {
  flex: 1;
  min-width: 280px;
  max-width: 450px;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  background-color: rgba(249, 250, 236, 0.5);
  border-left: 4px solid rgba(61, 124, 74, 1);
  text-align: center;
}

.section-title {
  font-size: 20px;
  font-family: var(--font-display);
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  margin-bottom: 20px;
  text-align: center;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(61, 124, 74, 0.2);
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-label {
  font-size: 16px;
  font-family: var(--font-display);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
}

.breakdown-value {
  font-size: 16px;
  font-family: var(--font-display);
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  text-align: right;
}

/* Tree Planting Message */
.trees-message {
  margin: 12px auto;
  text-align: center;
  max-width: 1000px;
  width: 100%;
}

.trees-message p {
  font-size: 22px;
  font-family: var(--font-display);
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  margin: 10px 0;
  text-align: center;
  line-height: 1.4;
}

.trees-value {
  font-size: 28px;
  font-family: var(--font-display);
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  background-color: rgba(61, 124, 74, 0.9);
  padding: 10px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  display: inline-block;
  margin: 12px 0;
  text-align: center;
}

/* Tree Images Display */
.trees-visual-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 12px auto;
  max-width: 1100px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  width: 100%;
}

.tree-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.tree-image-wrapper:hover {
  transform: scale(1.1);
}

.tree-image {
  width: 70px;
  height: auto;
  max-height: 90px;
  object-fit: contain;
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.tree-image:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
}

.partial-tree-container {
  position: relative;
  width: 70px;
  height: 90px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
}

.partial-tree-image {
  width: 70px;
  height: auto;
  max-height: 90px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  opacity: 0.8;
  transform: translateY(0);
  /* clip-path will be set dynamically via inline style */
}

.trees-overflow-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 15px;
}

.trees-overflow-text {
  font-size: 16px;
  font-family: var(--font-display);
  font-weight: 500;
  color: rgba(255, 255, 255, 1);
  text-align: center;
  background-color: rgba(61, 124, 74, 0.8);
  padding: 10px 20px;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Details Button */
.details-button-container {
  margin: 15px 0 10px 0;
  text-align: center;
}

.details-button {
  background: transparent;
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 35px;
  font-size: 20px;
  font-family: var(--font-display);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: inline-block;
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(135deg, transparent, transparent), 
                    linear-gradient(135deg, #3d7c4a, #2d5a37, #4a8c5a, #3d6a47);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border: 2px solid transparent;
}

.details-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
  border-radius: 35px;
}

.details-button:hover::before {
  left: 100%;
}

.details-button:hover {
  transform: translateY(-3px);
  background-image: linear-gradient(135deg, transparent, transparent), 
                    linear-gradient(135deg, #4a8c5a, #3d6a47, #5a9c6a, #4d7a57);
  box-shadow: 0 10px 30px rgba(61, 124, 74, 0.3);
}

.details-button:active {
  transform: translateY(-1px);
  background-image: linear-gradient(135deg, transparent, transparent), 
                    linear-gradient(135deg, #3d7c4a, #2d5a37, #4a8c5a, #3d6a47);
  box-shadow: 0 6px 20px rgba(61, 124, 74, 0.3);
}

.details-button span {
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.popup-content {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: popupSlideIn 0.3s ease-out;
}

@keyframes popupSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.popup-header {
  background: linear-gradient(135deg, #3d7c4a 0%, #2d5a37 100%);
  color: white;
  padding: 25px;
  text-align: center;
}

.popup-header h3 {
  margin: 0;
  font-size: 22px;
  font-family: var(--font-display);
  font-weight: 700;
}

.popup-body {
  padding: 35px 25px;
  text-align: center;
}

.popup-body p {
  margin: 0;
  font-size: 16px;
  font-family: var(--font-display);
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.5;
}

.popup-subtitle {
  margin-top: 10px !important;
  font-size: 14px !important;
  color: rgba(0, 0, 0, 0.6) !important;
  font-style: italic;
}

.popup-footer {
  padding: 25px;
  text-align: center;
  background-color: rgba(248, 244, 208, 0.3);
}

.popup-button {
  background: linear-gradient(135deg, #3d7c4a 0%, #2d5a37 100%);
  color: white;
  border: none;
  padding: 14px 35px;
  border-radius: 25px;
  font-size: 16px;
  font-family: var(--font-display);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(61, 124, 74, 0.3);
}

.popup-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(61, 124, 74, 0.4);
  background: linear-gradient(135deg, #4a8c5a 0%, #3d6a47 100%);
}

.popup-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(61, 124, 74, 0.3);
}

/* Header 保持原有字体样式 */

/* Responsive Design */
@media (max-width: 768px) {
  .result-content {
    padding: 30px 15px;
    margin-top: 70px; /* 调整移动端 header 高度 */
  }

  .back-button-container {
    top: 90px; /* 移动端调整 */
  }

  .result-title {
    font-size: 30px;
  }

  .result-description {
    font-size: 20px;
  }

  .footprint-value {
    font-size: 28px;
    padding: 18px 30px;
  }

  .breakdown-sections {
    flex-direction: column;
    gap: 20px;
  }

  .breakdown-section {
    min-width: 250px;
    max-width: 100%;
  }

  .trees-message p {
    font-size: 20px;
  }

  .trees-value {
    font-size: 24px;
    padding: 12px 25px;
  }

  .trees-visual-container {
    gap: 15px;
    padding: 25px;
  }

  .tree-image {
    width: 60px;
    max-height: 75px;
    border-radius: 20px;
  }

  .partial-tree-container {
    width: 60px;
    height: 75px;
    background-color: transparent;
  }

  .partial-tree-image {
    width: 60px;
    height: auto;
    max-height: 75px;
  }

  .details-button {
    padding: 16px 35px;
    font-size: 18px;
  }

  .popup-content {
    width: 95%;
    margin: 20px;
  }

  .popup-header h3 {
    font-size: 20px;
  }

  .popup-body p {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .result-content {
    padding: 20px 10px;
    margin-top: 100px; /* 调整小屏幕 header 高度 */
  }

  .back-button-container {
    top: 110px; /* 小屏幕调整 */
  }

  .result-title {
    font-size: 26px;
  }

  .result-description {
    font-size: 18px;
  }

  .footprint-value {
    font-size: 24px;
    padding: 15px 25px;
    min-width: 180px;
  }

  .section-title {
    font-size: 18px;
  }

  .breakdown-label,
  .breakdown-value {
    font-size: 14px;
  }

  .trees-message p {
    font-size: 18px;
  }

  .trees-value {
    font-size: 20px;
    padding: 10px 20px;
  }

  .trees-visual-container {
    gap: 12px;
    padding: 20px;
  }

  .tree-image {
    width: 50px;
    max-height: 65px;
    border-radius: 15px;
  }

  .partial-tree-container {
    width: 50px;
    height: 65px;
    background-color: transparent;
  }

  .partial-tree-image {
    width: 50px;
    height: auto;
    max-height: 65px;
  }

  .trees-overflow-text {
    font-size: 14px;
    padding: 8px 15px;
  }

  .details-button {
    padding: 14px 30px;
    font-size: 16px;
  }

  .popup-content {
    width: 95%;
    margin: 15px;
  }

  .popup-header h3 {
    font-size: 18px;
  }

  .popup-body p {
    font-size: 14px;
  }
}

/* 碳足迹单位样式 */
.footprint-unit {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
  font-weight: 400;
  font-family: var(--font-display);
}

/* 返回按钮容器样式 */
.back-button-container {
  position: fixed;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 1000;
}

/* 返回按钮样式 - 复制PrivateSimple的nav-button样式 */
.nav-button {
  background: linear-gradient(135deg,
    rgba(61, 124, 74, 0.95) 0%,
    rgba(51, 104, 64, 0.95) 50%,
    rgba(42, 94, 54, 0.95) 100%);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 12px 30px rgba(61, 124, 74, 0.3),
    0 6px 15px rgba(0, 0, 0, 0.2);
}

.nav-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: linear-gradient(135deg,
    rgba(150, 150, 150, 0.6) 0%,
    rgba(180, 180, 180, 0.6) 50%,
    rgba(200, 200, 200, 0.6) 100%);
  transform: none;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.05);
}

.nav-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.nav-button:active::before {
  width: 100px;
  height: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .back-button-container {
    left: 15px;
  }

  .nav-button {
    width: 60px;
    height: 60px;
  }

  .nav-button svg {
    width: 18px;
    height: 18px;
  }

  .nav-button:active::before {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .back-button-container {
    left: 10px;
  }

  .nav-button {
    width: 50px;
    height: 50px;
  }

  .nav-button svg {
    width: 16px;
    height: 16px;
  }

  .nav-button:active::before {
    width: 70px;
    height: 70px;
  }
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
  font-family: var(--font-display);
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
  font-family: var(--font-display);
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  margin: 0 0 15px 0;
}

.error-message {
  font-size: 18px;
  font-family: var(--font-display);
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
  font-family: var(--font-display);
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

/* Calculator Buttons */
.calculator-buttons {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1000;
}

.calc-button {
  background: linear-gradient(135deg, 
    rgba(61, 124, 74, 0.95) 0%, 
    rgba(51, 104, 64, 0.95) 50%, 
    rgba(42, 94, 54, 0.95) 100%);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.calc-button:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 12px 30px rgba(61, 124, 74, 0.3),
    0 6px 15px rgba(0, 0, 0, 0.2);
}

.calc-button:active:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.2),
    0 3px 8px rgba(0, 0, 0, 0.1);
}

.calc-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: linear-gradient(135deg,
    rgba(150, 150, 150, 0.6) 0%,
    rgba(180, 180, 180, 0.6) 50%,
    rgba(200, 200, 200, 0.6) 100%);
  transform: none;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.05);
}

.calc-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.calc-button:active::before {
  width: 100px;
  height: 100px;
}

.button-icon {
  font-size: 24px;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}

.button-text {
  font-size: 10px;
  font-family: var(--font-display);
  font-weight: 600;
  color: white;
  text-align: center;
  position: relative;
  z-index: 1;
  line-height: 1.1;
}

/* Responsive design for calculator buttons */
@media (max-width: 768px) {
  .calculator-buttons {
    right: 15px;
    gap: 12px;
  }

  .calc-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }

  .button-icon {
    font-size: 18px;
    margin-bottom: 2px;
  }

  .button-text {
    font-size: 8px;
  }

  .calc-button:active::before {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .calculator-buttons {
    right: 10px;
    gap: 10px;
  }

  .calc-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }

  .button-icon {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .button-text {
    font-size: 7px;
  }

  .calc-button:active::before {
    width: 70px;
    height: 70px;
  }
}
</style>

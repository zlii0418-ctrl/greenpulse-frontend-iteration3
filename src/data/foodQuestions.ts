// 单位映射配置
export const UNIT_MAPPING: Record<string, string> = {
  'percent': '%',
  'servings': 'servings',
  'kg': 'kg',
  'times': 'times',
  'times/week': 'times/week',
  'times per week': 'times per week'
}


export interface FoodQuestionConfig {
  id: string
  question: string
  subtext?: string
  type: 'slider' | 'single_choice' | 'text_input'
  options?: Array<{
    id: string
    label: string
    value: string | number
    iconPath?: string
  }>
  sliders?: Array<{
    id: string
    label: string
    min: number
    max: number
    step: number
    defaultValue: number
    unit?: string
    iconPath: string
  }>
  textInputs?: Array<{
    id: string
    label: string
    placeholder?: string
    unit?: string
    min?: number
    max?: number
  }>
  placeholder?: string
  unit?: string
}

export const foodQuestions: FoodQuestionConfig[] = [
  {
    id: 'animal_products_frequency',
    question: '1. How often do you eat animal products?',
    subtext: 'Including meat, poultry, fish, eggs, and dairy products',
    type: 'slider',
    sliders: [
      {
        id: 'animal_products_frequency',
        label: 'Frequency',
        min: 0,
        max: 4,
        step: 1,
        defaultValue: 0,
        unit: '',
        iconPath: 'proteins'
      }
    ]
  },
  {
    id: 'fruit_veg_frequency',
    question: '2. How often do you eat fruits and vegetables?',
    subtext: 'All manners of fruits and vegetables',
    type: 'slider',
    sliders: [
      {
        id: 'fruit_veg_frequency',
        label: 'Frequency',
        min: 0,
        max: 4,
        step: 1,
        defaultValue: 0,
        unit: '',
        iconPath: 'vegetable'
      }
    ]
  },
  {
    id: 'grain_frequency',
    question: '3. How often do you eat grain and starches?',
    subtext: 'Including rice, bread, pasta, noodles, and other grain-based foods',
    type: 'slider',
    sliders: [
      {
        id: 'grain_frequency',
        label: 'Frequency',
        min: 0,
        max: 4,
        step: 1,
        defaultValue: 0,
        unit: '',
        iconPath: 'ramen'
      }
    ]
  }
]

export interface FoodAnswers {
  [key: string]: string | number
}

export function calculateFoodCarbonFootprint(answers: FoodAnswers): {
  totalFootprint: string
  breakdown: {
    diet: number
    meat: number
    dairy: number
    local: number
    organic: number
    waste: number
    cooking: number
  }
  details: {
    dietType: string
    meatConsumption: number
    dairyConsumption: number
    localPercentage: number
    organicPercentage: number
    foodWaste: number
    cookingFrequency: number
  }
  breakdownCards: Array<{
    title: string
    data: Record<string, number>
  }>
} {
  const {
    diet_type = 'omnivore',
    meat_consumption = 0,
    dairy_consumption = 0,
    local_food_percentage = 0,
    organic_food_percentage = 0,
    food_waste = 0,
    cooking_frequency = 0
  } = answers

  console.log('Food calculation inputs:', answers)

  // 碳排放因子 (kg CO2 per serving/week)
  const FACTORS = {
    diet: {
      vegan: 0.5,
      vegetarian: 1.2,
      pescatarian: 1.8,
      omnivore: 2.5
    },
    meat: 3.3, // kg CO2 per serving
    dairy: 1.0, // kg CO2 per serving
    local: -0.1, // 负值表示减少排放
    organic: -0.05, // 负值表示减少排放
    waste: 2.1, // kg CO2 per kg waste
    cooking: 0.3 // kg CO2 per cooking session
  }

  // 计算各项排放
  const dietEmission = FACTORS.diet[diet_type as keyof typeof FACTORS.diet] || FACTORS.diet.omnivore
  const meatEmission = (meat_consumption as number) * FACTORS.meat
  const dairyEmission = (dairy_consumption as number) * FACTORS.dairy * 7 // 转换为周排放
  const localReduction = (local_food_percentage as number) * FACTORS.local * 0.01
  const organicReduction = (organic_food_percentage as number) * FACTORS.organic * 0.01
  const wasteEmission = (food_waste as number) * FACTORS.waste
  const cookingEmission = (cooking_frequency as number) * FACTORS.cooking

  console.log('Food emission calculations:', {
    dietEmission,
    meatEmission,
    dairyEmission,
    localReduction,
    organicReduction,
    wasteEmission,
    cookingEmission
  })

  // 总排放 = 所有项的总和（减少项为负值）
  const total = dietEmission + meatEmission + dairyEmission + localReduction + organicReduction + wasteEmission + cookingEmission
  console.log('Food total emission:', total)

  // 生成breakdown卡片配置
  const breakdownCards: Array<{title: string, data: Record<string, number>}> = []
  
  // 第一个卡片: Diet & Consumption
  const dietData: Record<string, number> = {}
  if (dietEmission > 0) dietData.diet = Math.round(dietEmission * 10) / 10
  if (meatEmission > 0) dietData.meat = Math.round(meatEmission * 10) / 10
  if (dairyEmission > 0) dietData.dairy = Math.round(dairyEmission * 10) / 10
  
  if (Object.keys(dietData).length > 0) {
    breakdownCards.push({
      title: 'Diet & Consumption Breakdown',
      data: dietData
    })
  }
  
  // 第二个卡片: Sustainability & Waste
  const sustainabilityData: Record<string, number> = {}
  if (localReduction !== 0) sustainabilityData.local = Math.round(localReduction * 10) / 10
  if (organicReduction !== 0) sustainabilityData.organic = Math.round(organicReduction * 10) / 10
  if (wasteEmission > 0) sustainabilityData.waste = Math.round(wasteEmission * 10) / 10
  if (cookingEmission > 0) sustainabilityData.cooking = Math.round(cookingEmission * 10) / 10
  
  if (Object.keys(sustainabilityData).length > 0) {
    breakdownCards.push({
      title: 'Sustainability & Waste Details',
      data: sustainabilityData
    })
  }

  return {
    totalFootprint: Math.max(0, total).toFixed(2),
    breakdown: {
      diet: Math.round(dietEmission * 10) / 10,
      meat: Math.round(meatEmission * 10) / 10,
      dairy: Math.round(dairyEmission * 10) / 10,
      local: Math.round(localReduction * 10) / 10,
      organic: Math.round(organicReduction * 10) / 10,
      waste: Math.round(wasteEmission * 10) / 10,
      cooking: Math.round(cookingEmission * 10) / 10
    },
    details: {
      dietType: diet_type as string,
      meatConsumption: meat_consumption as number,
      dairyConsumption: dairy_consumption as number,
      localPercentage: local_food_percentage as number,
      organicPercentage: organic_food_percentage as number,
      foodWaste: food_waste as number,
      cookingFrequency: cooking_frequency as number
    },
    breakdownCards
  }
}

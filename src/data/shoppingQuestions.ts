import fastFoodIcon from '@/assets/img/fast-food.png'
import furnitureIcon from '@/assets/img/furniture.png'
import fanIcon from '@/assets/img/fan.png'
import karaokeIcon from '@/assets/img/karaoke.png'
import tissueRollIcon from '@/assets/img/tissue-roll.png'
import maleClothesIcon from '@/assets/img/male-clothes.png'
import accessoriesIcon from '@/assets/img/accessories.png'
import medicineIcon from '@/assets/img/medicine.png'

export interface SliderConfig {
  id: string
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit?: string
  iconPath: string
}

export interface QuestionConfig {
  id: string
  question: string
  sliders: SliderConfig[]
}

export const shoppingQuestions: QuestionConfig[] = [
  {
    id: 'groceries_beverages',
    question: '1. How much do you typically spend on\ngroceries each week?',
    sliders: [
      {
        id: 'groceries_beverages',
        label: 'Groceries',
        min: 0,
        max: 2000,
        step: 10,
        defaultValue: 0,
        unit: 'RM',
        iconPath: fastFoodIcon,
      }
    ]
  },
  {
    id: 'home_lifestyle',
    question: '2. How much do you typically spend on home\nand lifestyle items each week?',
    sliders: [
      {
        id: 'home_garden',
        label: 'Home & Garden',
        min: 0,
        max: 3000,
        step: 100,
        defaultValue: 0,
        unit: 'RM',
        iconPath: furnitureIcon,
      },
      {
        id: 'appliance_electronics',
        label: 'Appliance & Electronics',
        min: 0,
        max: 3000,
        step: 100,
        defaultValue: 0,
        unit: 'RM',
        iconPath: fanIcon,
      },
      {
        id: 'entertainment',
        label: 'Entertainment',
        min: 0,
        max: 3000,
        step: 100,
        defaultValue: 0,
        unit: 'RM',
        iconPath: karaokeIcon,
      },
      {
        id: 'general_merchandise',
        label: 'General Merchandise',
        min: 0,
        max: 3000,
        step: 100,
        defaultValue: 0,
        unit: 'RM',
        iconPath: tissueRollIcon,
      }
    ]
  },
  {
    id: 'clothing_personal_care',
    question: '3. How much do you typically spend on clothing\nand personal care products each week?',
    sliders: [
      {
        id: 'clothing',
        label: 'Clothing',
        min: 0,
        max: 3000,
        step: 100,
        defaultValue: 0,
        unit: 'RM',
        iconPath: maleClothesIcon,
      },
      {
        id: 'accessories',
        label: 'Accessories',
        min: 0,
        max: 3000,
        step: 100,
        defaultValue: 0,
        unit: 'RM',
        iconPath: accessoriesIcon,
      },
      {
        id: 'health_pharmacy',
        label: 'Health ＆ Pharmacy',
        min: 0,
        max: 3000,
        step: 100,
        defaultValue: 0,
        unit: 'RM',
        iconPath: medicineIcon,
      }
    ]
  }
]

export interface ShoppingAnswers {
  [key: string]: number
}

export function calculateShoppingCarbonFootprint(answers: ShoppingAnswers): {
  totalFootprint: string
  breakdown: {
    clothing: number
    accessories: number
    groceries: number
    fastFood: number
    electronics: number
    furniture: number
  }
  details: {
    clothing: number
    accessories: number
    groceries: number
    fastFood: number
    electronics: number
    furniture: number
  }
  breakdownCards: Array<{
    title: string
    data: Record<string, number>
  }>
} {
  const {
    clothing = 0,
    accessories = 0,
    groceries = 0,
    fastFood = 0,
    electronics = 0,
    furniture = 0
  } = answers

  console.log('Shopping calculation inputs:', { clothing, accessories, groceries, fastFood, electronics, furniture })

  // 各项碳排放因子 (kg CO2 per RM spent)
  const FACTORS = {
    clothing: 0.8,        // kg CO2 per RM
    accessories: 0.6,     // kg CO2 per RM
    groceries: 0.3,       // kg CO2 per RM
    fastFood: 0.5,        // kg CO2 per RM
    electronics: 1.2,     // kg CO2 per RM
    furniture: 0.9        // kg CO2 per RM
  }

  // 计算各项排放
  const clothingEmission = clothing * FACTORS.clothing
  const accessoriesEmission = accessories * FACTORS.accessories
  const groceriesEmission = groceries * FACTORS.groceries
  const fastFoodEmission = fastFood * FACTORS.fastFood
  const electronicsEmission = electronics * FACTORS.electronics
  const furnitureEmission = furniture * FACTORS.furniture

  console.log('Shopping emission calculations:', {
    clothingEmission,
    accessoriesEmission,
    groceriesEmission,
    fastFoodEmission,
    electronicsEmission,
    furnitureEmission
  })

  // 总排放 = 所有六项的总和
  const total = clothingEmission + accessoriesEmission + groceriesEmission + fastFoodEmission + electronicsEmission + furnitureEmission
  console.log('Shopping total emission:', total)

  // 生成breakdown卡片配置
  const breakdownCards: Array<{title: string, data: Record<string, number>}> = []
  
  // 第一个卡片: Personal Items
  const personalData: Record<string, number> = {}
  if (clothingEmission > 0) personalData.clothing = Math.round(clothingEmission)
  if (accessoriesEmission > 0) personalData.accessories = Math.round(accessoriesEmission)
  
  if (Object.keys(personalData).length > 0) {
    breakdownCards.push({
      title: 'Personal Items Breakdown',
      data: personalData
    })
  }
  
  // 第二个卡片: Food & Groceries
  const foodData: Record<string, number> = {}
  if (groceriesEmission > 0) foodData.groceries = Math.round(groceriesEmission)
  if (fastFoodEmission > 0) foodData.fastFood = Math.round(fastFoodEmission)
  
  if (Object.keys(foodData).length > 0) {
    breakdownCards.push({
      title: 'Food & Groceries Details',
      data: foodData
    })
  }

  // 第三个卡片: Home & Electronics
  const homeData: Record<string, number> = {}
  if (electronicsEmission > 0) homeData.electronics = Math.round(electronicsEmission)
  if (furnitureEmission > 0) homeData.furniture = Math.round(furnitureEmission)
  
  if (Object.keys(homeData).length > 0) {
    breakdownCards.push({
      title: 'Home & Electronics Details',
      data: homeData
    })
  }

  return {
    totalFootprint: total.toFixed(2),
    breakdown: {
      clothing: Math.round(clothingEmission),
      accessories: Math.round(accessoriesEmission),
      groceries: Math.round(groceriesEmission),
      fastFood: Math.round(fastFoodEmission),
      electronics: Math.round(electronicsEmission),
      furniture: Math.round(furnitureEmission)
    },
    details: {
      clothing: clothing,
      accessories: accessories,
      groceries: groceries,
      fastFood: fastFood,
      electronics: electronics,
      furniture: furniture
    },
    breakdownCards
  }
}

import girlIcon from '@/assets/img/girl.png'
import waterIcon from '@/assets/img/water.png'
import elecIcon from '@/assets/img/elec.png'
import trashIcon from '@/assets/img/trash.png'

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

export const householdQuestions: QuestionConfig[] = [
  {
    id: 'people_count',
    question: '1. How many people are living in your house?',
    sliders: [
      {
        id: 'people',
        label: 'People',
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 0,
        unit: 'people',
        iconPath: girlIcon,
      }
    ]
  },
  {
    id: 'water_electricity',
    question: '2. How much water and electricity do you use in a month?',
    sliders: [
      {
        id: 'water',
        label: 'Water',
        min: 0,
        max: 50,
        step: 1,
        defaultValue: 0,
        unit: 'm³',
        iconPath: waterIcon
      },
      {
        id: 'electricity',
        label: 'Electricity',
        min: 0,
        max: 500,
        step: 1,
        defaultValue: 0,
        unit: 'kWh',
        iconPath: elecIcon
      }
    ]
  },
  {
    id: 'waste_management',
    question: '3. How much trash do you throw away every week?',
    sliders: [
      {
        id: 'trash',
        label: 'Trash',
        min: 0,
        max: 200,
        step: 1,
        defaultValue: 0,
        unit: 'kg',
        iconPath: trashIcon
      }
    ]
  }
]

export interface HouseholdAnswers {
  [key: string]: number
}

export function calculateHouseholdCarbonFootprint(answers: HouseholdAnswers): {
  totalFootprint: string
  breakdown: {
    electricity: number
    water: number
    people: number
    trash: number
  }
  details: {
    people: number
    electricityUsage: number
    waterUsage: number
    trash: number
  }
  breakdownCards: Array<{
    title: string
    data: Record<string, number>
  }>
} {
  const {
    people = 0,
    water = 0,
    electricity = 0,
    trash = 0
  } = answers

  console.log('Household calculation inputs:', { people, water, electricity, trash })

  // 各项碳排放因子
  const FACTORS = {
    water: 0.344,         // kg CO2 per m³
    people: 32.2466,      // kg CO2 per person
    trash: 1,             // kg CO2 per kg
    electricity: 1        // kg CO2 per kWh
  }

  // 计算各项排放
  const waterEmission = water * FACTORS.water
  const peopleEmission = people * FACTORS.people
  const trashEmission = trash * FACTORS.trash
  const electricityEmission = electricity * FACTORS.electricity

  console.log('Household emission calculations:', {
    waterEmission,
    peopleEmission,
    trashEmission,
    electricityEmission
  })

  // 总排放 = 所有四项的总和
  const total = waterEmission + peopleEmission + trashEmission + electricityEmission
  console.log('Household total emission:', total)

  // 生成breakdown卡片配置
  const breakdownCards: Array<{title: string, data: Record<string, number>}> = []
  
  // 第一个卡片: Energy & Utilities
  const energyData: Record<string, number> = {}
  if (electricityEmission > 0) energyData.electricity = Math.round(electricityEmission)
  if (waterEmission > 0) energyData.water = Math.round(waterEmission)
  
  if (Object.keys(energyData).length > 0) {
    breakdownCards.push({
      title: 'Energy & Utilities Breakdown',
      data: energyData
    })
  }
  
  // 第二个卡片: Lifestyle & Consumption
  const lifestyleData: Record<string, number> = {}
  if (peopleEmission > 0) lifestyleData.people = Math.round(peopleEmission)
  if (trashEmission > 0) lifestyleData.trash = Math.round(trashEmission)
  
  if (Object.keys(lifestyleData).length > 0) {
    breakdownCards.push({
      title: 'Lifestyle & Consumption Details',
      data: lifestyleData
    })
  }

  return {
    totalFootprint: total.toFixed(2),
    breakdown: {
      electricity: Math.round(electricityEmission),
      water: Math.round(waterEmission),
      people: Math.round(peopleEmission),
      trash: Math.round(trashEmission)
    },
    details: {
      people: people,
      electricityUsage: electricity,
      waterUsage: water,
      trash: trash
    },
    breakdownCards
  }
}

// Travel calculation function
export function calculateTravelCarbonFootprint(): {
  total: number
  breakdown: {
    cars: number
    motorcycles: number
    publicTotal: number
  }
  details: {
    carFootprint: number
    motorcycleFootprint: number
    publicTransportFootprint: number
  }
  breakdownCards: Array<{
    title: string
    data: Record<string, number>
  }>
} {
  // 从localStorage获取旅行计算结果
  const totalFootprint = parseFloat(localStorage.getItem('total_footprint') || '0')
  const carFootprint = parseFloat(localStorage.getItem('car_footprint') || '0')
  const motorcycleFootprint = parseFloat(localStorage.getItem('motorcycle_footprint') || '0')
  const publicTransportFootprint = parseFloat(localStorage.getItem('public_transport_footprint') || '0')
  
  // 生成breakdown卡片配置
  const breakdownCards: Array<{title: string, data: Record<string, number>}> = []
  
  // 第一个卡片: Transport Breakdown
  const transportData: Record<string, number> = {}
  if (carFootprint > 0) transportData.cars = Math.round(carFootprint)
  if (motorcycleFootprint > 0) transportData.motorcycles = Math.round(motorcycleFootprint)
  if (publicTransportFootprint > 0) transportData.publicTotal = Math.round(publicTransportFootprint)
  
  if (Object.keys(transportData).length > 0) {
    breakdownCards.push({
      title: 'Transport Breakdown',
      data: transportData
    })
  }
  
  // 第二个卡片: Public Transport Details
  const busDistance = parseFloat(localStorage.getItem('bus_distance_1') || '0')
  const trainDistance = parseFloat(localStorage.getItem('train_distance_1') || '0')
  
  const publicDetailsData: Record<string, number> = {}
  if (busDistance > 0) {
    const busEmission = busDistance * 0.10385
    publicDetailsData.bus = Math.round(busEmission)
  }
  if (trainDistance > 0) {
    const trainEmission = trainDistance * 0.12597
    publicDetailsData.train = Math.round(trainEmission)
  }
  
  if (Object.keys(publicDetailsData).length > 0) {
    breakdownCards.push({
      title: 'Public Transport Details',
      data: publicDetailsData
    })
  }

  return {
    total: Math.round(totalFootprint),
    breakdown: {
      cars: Math.round(carFootprint),
      motorcycles: Math.round(motorcycleFootprint),
      publicTotal: Math.round(publicTransportFootprint)
    },
    details: {
      carFootprint: Math.round(carFootprint),
      motorcycleFootprint: Math.round(motorcycleFootprint),
      publicTransportFootprint: Math.round(publicTransportFootprint)
    },
    breakdownCards
  }
}

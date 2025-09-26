import sportCarIcon from '@/assets/img/sport-car.png'
import motorbikeIcon from '@/assets/img/motorbike.png'
import busIcon from '@/assets/img/bus.png'
import trainIcon from '@/assets/img/train.png'

export interface VehicleConfig {
  id: string
  label: string
  iconPath: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit: string
  emissionFactor: number // kg CO2 per km
}

export interface TravelQuestionConfig {
  id: string
  question: string
  vehicles: VehicleConfig[]
}

export const travelQuestions: TravelQuestionConfig[] = [
  {
    id: 'private_transport',
    question: '1. How far do you drive in a week?',
    vehicles: [
      {
        id: 'car',
        label: 'Car',
        iconPath: sportCarIcon,
        min: 0,
        max: 800,
        step: 1,
        defaultValue: 0,
        unit: 'km',
        emissionFactor: 0.192 // kg CO2 per km
      },
      {
        id: 'motorcycle',
        label: 'Motorcycle',
        iconPath: motorbikeIcon,
        min: 0,
        max: 800,
        step: 1,
        defaultValue: 0,
        unit: 'km',
        emissionFactor: 0.103 // kg CO2 per km
      }
    ]
  },
  {
    id: 'public_transport',
    question: '2. How far do you travel per week by public transportation?',
    vehicles: [
      {
        id: 'bus',
        label: 'Bus',
        iconPath: busIcon,
        min: 0,
        max: 800,
        step: 1,
        defaultValue: 0,
        unit: 'km',
        emissionFactor: 0.10385 // kg CO2 per km
      },
      {
        id: 'train',
        label: 'Train',
        iconPath: trainIcon,
        min: 0,
        max: 800,
        step: 1,
        defaultValue: 0,
        unit: 'km',
        emissionFactor: 0.12597 // kg CO2 per km
      }
    ]
  }
]

export interface TravelAnswers {
  [key: string]: number
}

export function calculateTravelCarbonFootprint(answers: TravelAnswers): {
  totalFootprint: string
  carFootprint: string
  motorcycleFootprint: string
  busFootprint: string
  trainFootprint: string
  privateTransportFootprint: string
  publicTransportFootprint: string
  breakdown: {
    car: number
    motorcycle: number
    bus: number
    train: number
  }
} {
  const { car = 0, motorcycle = 0, bus = 0, train = 0 } = answers
  
  // 计算各项碳排放量
  const carFootprint = car * 0.192
  const motorcycleFootprint = motorcycle * 0.103
  const busFootprint = bus * 0.10385
  const trainFootprint = train * 0.12597
  
  const privateTransportFootprint = carFootprint + motorcycleFootprint
  const publicTransportFootprint = busFootprint + trainFootprint
  const totalFootprint = privateTransportFootprint + publicTransportFootprint
  
  return {
    totalFootprint: totalFootprint.toFixed(2),
    carFootprint: carFootprint.toFixed(2),
    motorcycleFootprint: motorcycleFootprint.toFixed(2),
    busFootprint: busFootprint.toFixed(2),
    trainFootprint: trainFootprint.toFixed(2),
    privateTransportFootprint: privateTransportFootprint.toFixed(2),
    publicTransportFootprint: publicTransportFootprint.toFixed(2),
    breakdown: {
      car: carFootprint,
      motorcycle: motorcycleFootprint,
      bus: busFootprint,
      train: trainFootprint
    }
  }
}

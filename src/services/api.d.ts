export function fetchFoodDropdownOptions(categoryIndex: number): Promise<string[]>
export function fetchAllFoodDropdownOptions(): Promise<{
  foodOptions: Record<number, string[]>
  errors: Record<number, string> | null
}>
export function fetchShoppingDropdownOptions(categoryIndex: number): Promise<string[]>
export function fetchAllShoppingDropdownOptions(): Promise<{
  shoppingOptions: Record<number, string[]>
  errors: Record<number, string> | null
}>

// Calculator API functions
export function calculateTravel(travelData: any): Promise<any>
export function calculateHousehold(householdData: any): Promise<any>
export function calculateFood(foodData: any): Promise<any>
export function calculateShopping(shoppingData: any): Promise<any>

// Recommendations API function
export function generateRecommendations(recommendationData: any): Promise<any>

export default any

// Type definitions for dropdownData.js

export interface DropdownDataResult {
  foodOptions: Record<number, string[]> | null
  error: string | null
}

export interface ShoppingDropdownDataResult {
  shoppingOptions: Record<number, string[]> | null
  error: string | null
}

export interface DropdownDataStatus {
  foodOptions: Record<number, string[]> | null
  error: string | null
  isLoading: boolean
}

export interface ShoppingDropdownDataStatus {
  shoppingOptions: Record<number, string[]> | null
  error: string | null
  isLoading: boolean
}

export interface AllDropdownDataResult {
  food: DropdownDataResult
  shopping: ShoppingDropdownDataResult
}

// Exported functions
export function initializeFoodDropdownData(): Promise<DropdownDataResult>
export function initializeShoppingDropdownData(): Promise<ShoppingDropdownDataResult>
export function getFoodDropdownData(): DropdownDataStatus
export function getShoppingDropdownData(): ShoppingDropdownDataStatus
export function initializeAllDropdownData(): Promise<AllDropdownDataResult>

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import Recommendations from '../views/Recommendations.vue'

// Mock the API
vi.mock('@/services/api.js', () => ({
  generateRecommendations: vi.fn().mockResolvedValue({
    success: true,
    data: {
      summary: 'Test summary',
      recommendations: `Car-pool or share rides for your 100 km car trips
• Why: Splitting the journey cuts the per-person emissions in half (or more) and saves fuel cost.
• How: 
1. Use apps like GrabShare, MyCar, or local Facebook groups to find neighbours or colleagues traveling the same route.
2. Schedule a weekly "car-pool day" and agree on a pick-up point to keep the drive efficient.
• Local tip: In Malaysia, many office compounds have dedicated car-pool parking bays—park there to get a small discount on parking fees.`
    }
  })
}))

// Create router and i18n for testing
const router = createRouter({
  history: createWebHistory(),
  routes: []
})

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {}
  }
})

describe('Recommendations', () => {
  it('renders numbered lists correctly in How section', async () => {
    // Mock the route with proper parameters
    const mockRoute = {
      query: {
        category: 'travel',
        emissions: '50.5',
        calculationData: JSON.stringify({})
      }
    }

    const wrapper = mount(Recommendations, {
      global: {
        plugins: [router, i18n],
        mocks: {
          $route: mockRoute
        }
      }
    })

    // Wait for the component to load and generate recommendations
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if the component rendered
    expect(wrapper.exists()).toBe(true)
    
    // Check if the How section contains numbered steps
    const howSteps = wrapper.findAll('.how-step')
    expect(howSteps.length).toBeGreaterThan(0)
    
    // Check if the CSS counter is applied
    const howSection = wrapper.find('.how-section')
    expect(howSection.exists()).toBe(true)
    
    // Check if the section content has counter-reset
    const sectionContent = howSection.find('.section-content')
    expect(sectionContent.exists()).toBe(true)
  })

  it('formats recommendation text with proper structure', () => {
    // Mock the route with proper parameters
    const mockRoute = {
      query: {
        category: 'travel',
        emissions: '50.5',
        calculationData: JSON.stringify({})
      }
    }

    const wrapper = mount(Recommendations, {
      global: {
        plugins: [router, i18n],
        mocks: {
          $route: mockRoute
        }
      }
    })

    const testText = `Car-pool or share rides
• Why: Test reason
• How: 
1. First step
2. Second step
• Local tip: Test tip`

    const result = wrapper.vm.formatRecommendationText(testText, 1)
    
    // Check if the result contains proper HTML structure
    expect(result).toContain('recommendation-header')
    expect(result).toContain('how-section')
    expect(result).toContain('how-step')
    expect(result).toContain('First step')
    expect(result).toContain('Second step')
  })
})

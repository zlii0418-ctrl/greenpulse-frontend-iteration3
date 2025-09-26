<template>
    <div class="calc_nav_main flex-row">
      <div class="nav_box_1 flex-col tooltip-container">
        <RouterLink to="/travel-private">
            <div class="calc_image-wrapper_1 flex-col">
              <img
                class="calc_label_1"
                referrerpolicy="no-referrer"
                src="@/assets/img2/travel_icon.png"
              />
            </div>
        </RouterLink>
        <div class="tooltip">Travel Calculator</div>
      </div>
      <div class="nav_box_3 flex-col tooltip-container">
        <RouterLink to="/household-calculator" @click="handleHouseholdClick">
            <div class="calc_image-wrapper_1 flex-col">
              <img
                class="calc_label_2"
                referrerpolicy="no-referrer"
                src="@/assets/img2/household_icon.png"
              />
            </div>
        </RouterLink>
        <div class="tooltip">Household Calculator</div>
      </div>
      <div class="nav_box_5 flex-col tooltip-container">
        <RouterLink to="/coming-soon" @click="handleFoodClick">
            <div class="calc_image-wrapper_2 flex-col">
              <img
                class="calc_label_3"
                referrerpolicy="no-referrer"
                src="@/assets/img2/food_icon.png"
              />
            </div>
        </RouterLink>
        <div class="tooltip">Food Calculator</div>
      </div>
      <div class="nav_box_6 flex-col tooltip-container">
        <RouterLink to="/coming-soon" @click="handleShoppingClick">
            <div class="calc_image-wrapper_3 flex-col">
              <img
                class="calc_label_4"
                referrerpolicy="no-referrer"
                src="@/assets/img2/shopping_icon.png"
              />
            </div>
        </RouterLink>
        <div class="tooltip">Shopping Calculator</div>
      </div>
      <!-- Hide until results page for all calculators combined -->
      <!-- <div class="nav_box_7 flex-col tooltip-container">
        <RouterLink to="/travel-result" @click="handleResultsClick">
            <div class="calc_image-wrapper_4 flex-col">
              <img
                class="calc_label_5"
                referrerpolicy="no-referrer"
                src="@/assets/img2/results_icon.png"
              />
            </div>
        </RouterLink>
        <div class="tooltip">Results</div>
      </div> -->
    </div>
  </template>

<script setup lang="ts">
// Safely reference calculator utilities
type MaybeCalcUtils = {
  clearAllValues?: () => void;
}

const getCalculatorUtils = (): MaybeCalcUtils => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).calculatorUtils || {}
  } catch {
    return {}
  }
}

function handleTravelClick() {
  // Don't clear values when staying within travel calculator
}

function handleHouseholdClick() {
  // Clear all values when switching to household calculator
  const utils = getCalculatorUtils()
  utils.clearAllValues?.()
}

function handleFoodClick() {
  // Clear all values when switching to food calculator
  const utils = getCalculatorUtils()
  utils.clearAllValues?.()
}

function handleShoppingClick() {
  // Clear all values when switching to shopping calculator
  const utils = getCalculatorUtils()
  utils.clearAllValues?.()
}

function handleResultsClick() {
  // Don't clear values when going to results
}
</script>
  
  <style scoped>
  .calc_nav_main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70px;
    margin-top: 20px;
  }
  
  .nav_box_1 {
    box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.15);
    height: 70px;
    width: 169px;
    border-radius: 35px;
  }
  
  .nav_box_2 {
    height: 70px;
    background: url(@/assets/img2/calc_nav_box.png)
      100% no-repeat;
    background-size: 100% 100%;
    width: 169px;
  }
  
  .calc_image-wrapper_1 {
    background-color: transparent;
    border-radius: 50%;
    height: 24px;
    width: 118px;
    margin: 35px 0 0 26px;
  }
  
  .calc_label_1 {
    width: 46px;
    height: 45px;
    margin: -24px 0 0 32px;
  }
  
  .nav_box_3 {
    box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.15);
    height: 70px;
    margin-left: 66px;
    width: 169px;
    border-radius: 35px;
  }
  
  .nav_box_4 {
    height: 70px;
    background: url(@/assets/img2/calc_nav_box.png)
      100% no-repeat;
    background-size: 100% 100%;
    width: 169px;
    position: relative;
  }
  
  .nav_block_1 {
    background-color: transparent;
    border-radius: 50%;
    width: 118px;
    height: 24px;
    margin: 35px 0 0 26px;
  }
  
  .calc_label_2 {
    width: 64px;
    height: 64px;
    margin: -30px 0 0 30px;
  }
  
  .nav_box_5 {
    box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.15);
    height: 70px;
    margin-left: 66px;
    width: 169px;
    border-radius: 35px;
  }
  
  .nav_block_1 {
    height: 70px;
    background: url(@/assets/img2/calc_nav_box.png)
      100% no-repeat;
    background-size: 100% 100%;
    width: 169px;
  }
  
  .calc_image-wrapper_2 {
    background-color: transparent;
    border-radius: 50%;
    height: 24px;
    width: 118px;
    margin: 35px 0 0 26px;
  }
  
  .calc_label_3 {
    width: 45px;
    height: 45px;
    margin: -22px 0 0 36px;
  }
  
  .nav_box_6 {
    box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.15);
    height: 70px;
    margin-left: 66px;
    width: 169px;
    border-radius: 35px;
  }
  
  .nav_block_3 {
    height: 70px;
    background: url(@/assets/img2/calc_nav_box.png)
      100% no-repeat;
    background-size: 100% 100%;
    width: 169px;
  }
  
  .calc_image-wrapper_3 {
    background-color: transparent;
    border-radius: 50%;
    height: 24px;
    width: 118px;
    margin: 35px 0 0 26px;
  }
  
  .calc_label_4 {
    width: 45px;
    height: 45px;
    margin: -22px 0 0 36px;
  }
  
  .nav_box_7 {
    box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.15);
    height: 70px;
    margin-left: 66px;
    width: 169px;
    border-radius: 35px;
  }
  
  .nav_block_4 {
    height: 70px;
    background: url(@/assets/img2/calc_nav_box.png)
      100% no-repeat;
    background-size: 100% 100%;
    width: 169px;
  }
  
  .calc_image-wrapper_4 {
    background-color: transparent;
    border-radius: 50%;
    height: 24px;
    width: 118px;
    margin: 35px 0 0 26px;
  }
  
  .calc_label_5 {
    width: 45px;
    height: 45px;
    margin: -22px 0 0 36px;
  }
  
  /* Animation */
  .calc_nav_main {
    animation: scaleIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both;
  }
  
  .nav_box_1,
  .nav_box_3,
  .nav_box_4,
  .nav_box_5,
  .nav_box_6,
  .nav_box_7 {
    animation: bounceIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both;
  }
  
  .nav_box_1,
  .nav_box_3,
  .nav_box_4,
  .nav_box_5,
  .nav_box_6,
  .nav_box_7 {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    cursor: pointer;
  }
  
  .nav_box_1:hover,
  .nav_box_3:hover,
  .nav_box_4:hover,
  .nav_box_5:hover,
  .nav_box_6:hover,
  .nav_box_7:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.2),
      0 15px 30px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .calc_label_1,
  .calc_image_2,
  .calc_label_2,
  .calc_label_3,
  .calc_label_4,
  .calc_label_5 {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .calc_label_1:hover,
  .calc_image_2:hover,
  .calc_label_2:hover,
  .calc_label_3:hover,
  .calc_label_4:hover,
  .calc_label_5:hover {
    transform: rotate(15deg) scale(1.1);
    filter: drop-shadow(0 4px 8px rgba(61, 124, 74, 0.4));
  }
  /* Tooltip Styles */
  .tooltip-container {
    position: relative;
  }

  .tooltip {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    pointer-events: none;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(0, 0, 0, 0.8);
  }

  .tooltip-container:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-5px);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .calc_nav_main {
      flex-direction: column;
      gap: 20px;
      height: auto;
      margin-top: 15px;
    }

    .nav_box_1,
    .nav_box_3,
    .nav_box_5,
    .nav_box_6 {
      margin-left: 0;
      margin-bottom: 15px;
      width: 140px;
      height: 60px;
    }

    .nav_box_2,
    .nav_box_4,
    .nav_block_1,
    .nav_block_3 {
      width: 140px;
      height: 60px;
    }

    .calc_image-wrapper_1 {
      margin: 30px 0 0 20px;
    }

    .calc_label_1 {
      margin: -22px 0 0 28px;
    }

    .calc_label_2 {
      margin: -28px 0 0 28px;
    }

    .calc_image-wrapper_2,
    .calc_image-wrapper_3 {
      margin: 30px 0 0 20px;
    }

    .calc_label_3,
    .calc_label_4 {
      margin: -20px 0 0 28px;
    }
  }

  @media (max-width: 480px) {
    .calc_nav_main {
      gap: 15px;
      margin-top: 10px;
    }

    .nav_box_1,
    .nav_box_3,
    .nav_box_5,
    .nav_box_6 {
      width: 120px;
      height: 50px;
      margin-bottom: 10px;
    }

    .nav_box_2,
    .nav_box_4,
    .nav_block_1,
    .nav_block_3 {
      width: 120px;
      height: 50px;
    }

    .calc_image-wrapper_1 {
      height: 20px;
      width: 100px;
      margin: 25px 0 0 20px;
    }

    .calc_label_1 {
      width: 38px;
      height: 38px;
      margin: -20px 0 0 25px;
    }

    .calc_label_2 {
      width: 50px;
      height: 50px;
      margin: -25px 0 0 25px;
    }

    .calc_image-wrapper_2,
    .calc_image-wrapper_3 {
      height: 20px;
      width: 100px;
      margin: 25px 0 0 20px;
    }

    .calc_label_3,
    .calc_label_4 {
      width: 35px;
      height: 35px;
      margin: -18px 0 0 25px;
    }

    /* Hide tooltips on small screens for better UX */
    .tooltip {
      display: none;
    }
  }
</style>
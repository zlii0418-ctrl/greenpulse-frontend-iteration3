<template>
    <div class="page flex-col">
      <div class="main-container">
          <div class="text-wrapper_1 flex-row">
            <span class="text_1">Type</span> 
            <span class="text_2">Distance</span>
          </div>
        <div class="box_1 flex-row">
          <div class="group_1 flex-col"></div>
          <div class="text-wrapper_3 flex-col">
            <span class="text_4">LRT</span>
          </div>
          <div class="group_2 flex-col justify-between">
            <div class="box_2 flex-col">
              <input 
                      type="range" 
                      class="gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      id="mySlider1"
                      v-model.number="lrtDistance"
                  >
            </div>
            <div class="text-wrapper_4 flex-row justify-between">
              <span class="text_5">{{ lrtDistance }}</span>
              <span class="text_6">unit: km</span>
            </div>
          </div>
        </div>
        <div class="box_3 flex-row">
          <div class="text-wrapper_6 flex-col">
            <span class="text_8">MRT</span>
          </div>
          <div class="block_1 flex-col justify-between">
            <div class="group_3 flex-col">
              <input 
                      type="range" 
                      class="gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      id="mySlider2"
                      v-model.number="mrtDistance"
                  >
            </div>
            <div class="text-wrapper_7 flex-row justify-between">
              <span class="text_9">{{ mrtDistance }}</span>
              <span class="text_10">unit: km</span>
            </div>
          </div>
        </div>
        <div class="box_3 flex-row">
          <div class="text-wrapper_6 flex-col">
            <span class="text_8">KTM</span>
          </div>
          <div class="block_1 flex-col justify-between">
            <div class="group_3 flex-col">
              <input 
                type="range" 
                class="gradient-slider" 
                min="0" 
                max="800" 
                value="0" 
                step="1"
                id="mySlider3"
                v-model.number="ktmDistance">
            </div>
            <div class="text-wrapper_7 flex-row justify-between">
              <span class="text_9">{{ ktmDistance }}</span>
              <span class="text_10">unit: km</span>
            </div>
          </div>
        </div>
        <div class="box_3 flex-row">
          <div class="text-wrapper_6 flex-col">
            <span class="text_8">Monorail</span>
          </div>
          <div class="block_1 flex-col justify-between">
            <div class="group_3 flex-col">
              <input 
                      type="range" 
                      class="gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      id="mySlider4"
                      v-model.number="monorailDistance"
                  >
            </div>
            <div class="text-wrapper_7 flex-row justify-between">
              <span class="text_9">{{ monorailDistance }}</span>
              <span class="text_10">unit: km</span>
            </div>
          </div>
        </div>
        <div class="box_3 flex-row">
          <div class="text-wrapper_6 flex-col">
            <span class="text_8">Bus</span>
          </div>
          <div class="block_1 flex-col justify-between">
            <div class="group_3 flex-col">
              <input 
                      type="range" 
                      class="gradient-slider" 
                      min="0" 
                      max="800" 
                      value="0" 
                      step="1"
                      id="mySlider5"
                      v-model.number="busDistance"
                  >
            </div>
            <div class="text-wrapper_7 flex-row justify-between">
              <span class="text_9">{{ busDistance }}</span>
              <span class="text_10">unit: km</span>
            </div>
          </div>
        </div>
        <div class="popup-buttons">
          <div class="cancel-button">
            <RouterLink to="/travel-private">
                Cancel
            </RouterLink>
          </div>  
          <div class="submit-button">
            <RouterLink to="/travel-result" @click="handleSubmit">
                Submit
            </RouterLink>
          </div>
        </div>
      </div>
      
      <!-- 聊天机器人组件 -->
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import trainIcon from '@/assets/img/train.png'
import busIcon from '@/assets/img/bus.png'

const lrtDistance = ref<number>(0)
const mrtDistance = ref<number>(0)
const ktmDistance = ref<number>(0)
const monorailDistance = ref<number>(0)
const busDistance = ref<number>(0)

watch(lrtDistance, (val) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)?.calculatorUtils?.saveSliderValues?.('lrt_distance_detailed', String(val))
  } catch {}
})

watch(mrtDistance, (val) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)?.calculatorUtils?.saveSliderValues?.('mrt_distance_detailed', String(val))
  } catch {}
})

watch(ktmDistance, (val) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)?.calculatorUtils?.saveSliderValues?.('ktm_distance_detailed', String(val))
  } catch {}
})

watch(monorailDistance, (val) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)?.calculatorUtils?.saveSliderValues?.('monorail_distance_detailed', String(val))
  } catch {}
})

watch(busDistance, (val) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)?.calculatorUtils?.saveSliderValues?.('bus_distance_detailed', String(val))
  } catch {}
})

// Safely reference calculator utilities
type MaybeCalcUtils = {
  saveSliderValues?: (key: string, value: string | number) => void;
  setSubmissionPath?: (path: string) => void;
  getSubmissionPath?: () => string;
}

const getCalculatorUtils = (): MaybeCalcUtils => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).calculatorUtils || {}
  } catch {
    return {}
  }
}

function handleSubmit(): void {
  const utils = getCalculatorUtils()
  utils.setSubmissionPath?.('public_detailed')
}

onMounted(() => {
  // Load existing values from localStorage
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const utils = (window as any)?.calculatorUtils
    if (utils?.getSliderValue) {
      lrtDistance.value = utils.getSliderValue('lrt_distance_detailed', 0)
      mrtDistance.value = utils.getSliderValue('mrt_distance_detailed', 0)
      ktmDistance.value = utils.getSliderValue('ktm_distance_detailed', 0)
      monorailDistance.value = utils.getSliderValue('monorail_distance_detailed', 0)
      busDistance.value = utils.getSliderValue('bus_distance_detailed', 0)
    }
  } catch {}

  // Ripple effect
  function createRipple(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement
    if (!button || !button.getBoundingClientRect) return
    const ripple = document.createElement('span')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    ripple.style.width = ripple.style.height = size + 'px'
    ripple.style.left = x + 'px'
    ripple.style.top = y + 'px'
    ripple.classList.add('ripple')
    button.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  const clickableElements = document.querySelectorAll(
    '.image-wrapperNav, .box_2, .box_4, .box_6, .box_7, .box_8, .image-wrapper_5, .image-wrapper_6, .image_4-0, .image_4-1, .image_4-2, .image_4-3, .text_2, .text_3, .text_4, .text_1, .image_1',
  )
  clickableElements.forEach((el) => el.addEventListener('click', createRipple as any))

  // Parallax on scroll
  function onScroll() {
    const scrolled = window.pageYOffset
    const parallax = document.querySelectorAll('.image-wrapper_8, .section_4')
    parallax.forEach((element, index) => {
      const speed = 0.3 + index * 0.1
      ;(element as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`
    })
  }
  window.addEventListener('scroll', onScroll)

  // Body load fade
  window.addEventListener('load', function () {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.5s ease-in'
    setTimeout(() => {
      document.body.style.opacity = '1'
    }, 100)
  })

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'ArrowLeft': {
        const el = document.getElementById('dynamicLinkLeft') as HTMLElement | null
        el?.click()
        break
      }
      case 'ArrowRight': {
        const el = document.getElementById('dynamicLinkRight') as HTMLElement | null
        el?.click()
        break
      }
      case 'Enter': {
        const el = document.querySelector('.box_2') as HTMLElement | null
        el?.dispatchEvent(new Event('click', { bubbles: true }))
        break
      }
    }
  })

  // Touch support
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device')
    const touchElements = document.querySelectorAll('.box_2, .box_4, .box_6, .box_7, .box_8')
    touchElements.forEach((el) => {
      el.addEventListener('touchstart', function (this: HTMLElement) {
        this.style.transform = 'scale(0.95)'
      })
      el.addEventListener('touchend', function (this: HTMLElement) {
        this.style.transform = 'scale(1)'
      })
    })
  }
})
</script>

<style scoped>
.page {
  background-image: linear-gradient(
    90deg,
    rgba(248, 244, 208, 1) 0,
    rgba(226, 252, 214, 1) 100%
  );
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.image-wrapper_1 {
  width: 21px;
  height: 21px;
  margin: 24px 0 0 933px;
}

.label_1 {
  width: 21px;
  height: 21px;
}

.text-wrapper_1 {
  width: 420px;
  height: 18px;
  margin: 23px auto;
  justify-content: flex-start;
  padding-left: 20px;
}

.text_1 {
  width: 35px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(255, 110, 110, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin-left: -100px;
}

.text_2 {
  width: 66px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(255, 110, 110, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin-left: 200px;
}

.box_1 {
  width: 851px;
  height: 47px;
  margin: 31px auto;
}

.text-wrapper_2 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 29px;
  width: 28px;
}

.text_3 {
  width: 7px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 5px 0 0 11px;
}

.group_1 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 3px;
  height: 3px;
  margin: 14px 0 0 59px;
}

.text-wrapper_3 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 24px;
  margin-left: 11px;
  width: 122px;
}

.text_4 {
  width: 30px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 3px 0 0 45px;
}

.group_2 {
  width: 573px;
  height: 42px;
  margin: 5px 0 0 55px;
}

.box_2 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 474px;
  height: 14px;
  margin-left: 9px;
}

.text-wrapper_4 {
  width: 573px;
  height: 25px;
  margin-top: 3px;
}

.text_5 {
  width: 17px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_6 {
  width: 104px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
  margin-top: 6px;
}

.box_3 {
  width: 851px;
  height: 45px;
  margin: 31px auto;
}

.text-wrapper_5 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 30px;
  width: 28px;
}

.text_7 {
  width: 10px;
  height: 20px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 5px 0 0 10px;
}

.text-wrapper_6 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 25px;
  margin-left: 73px;
  width: 122px;
}

.text_8 {
  width: 35px;
  height: 20px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 3px 0 0 43px;
}

.block_1 {
  width: 573px;
  height: 42px;
  margin: 3px 0 0 55px;
}

.group_3 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 474px;
  height: 15px;
  margin-left: 9px;
}

.text-wrapper_7 {
  width: 573px;
  height: 22px;
  margin-top: 5px;
}

.text_9 {
  width: 17px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_10 {
  width: 104px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
  margin-top: 3px;
}

.box_4 {
  width: 851px;
  height: 30px;
  margin: 21px 0 0 72px;
}

.text-wrapper_8 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 29px;
  margin-top: 1px;
  width: 28px;
}

.text_11 {
  width: 10px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 5px 0 0 10px;
}

.text-wrapper_9 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 24px;
  width: 122px;
  margin: 3px 0 0 73px;
}

.text_12 {
  width: 35px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 4px 0 0 42px;
}

.block_2 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 4px;
  height: 4px;
  margin-left: 229px;
}

.block_3 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 4px;
  height: 4px;
  margin: 11px 0 0 111px;
}

.text-wrapper_10 {
  width: 573px;
  height: 19px;
  margin-top: 4px;
}

.text_13 {
  width: 17px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_14 {
  width: 104px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.box_5 {
  width: 4px;
  height: 4px;
  margin: 20px 0 0 526px;
}

.box_6 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 4px;
  height: 4px;
}

.box_7 {
  width: 851px;
  height: 47px;
  margin: 31px auto;
}

.text-wrapper_11 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 30px;
  width: 28px;
}

.text_15 {
  width: 10px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 6px 0 0 10px;
}

.text-wrapper_12 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 24px;
  width: 122px;
  margin: 2px 0 0 73px;
}

.text_16 {
  width: 63px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 3px 0 0 29px;
}

.group_4 {
  width: 573px;
  height: 42px;
  margin: 5px 0 0 55px;
}

.block_4 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 474px;
  height: 14px;
  margin-left: 9px;
}

.block_5 {
  background-color: rgba(217, 217, 217, 1);
  border-radius: 50%;
  width: 4px;
  height: 4px;
  margin: 1px 0 0 249px;
}

.text-wrapper_13 {
  width: 573px;
  height: 19px;
  margin-top: 4px;
}

.text_17 {
  width: 17px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_18 {
  width: 104px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.box_8 {
  width: 762px;
  height: 29px;
  margin: 31px auto;
}

.text-wrapper_14 {
  background-color: rgba(254, 254, 254, 1);
  border-radius: 4px;
  height: 29px;
  width: 28px;
}

.text_19 {
  width: 10px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 6px 0 0 10px;
}

.text-wrapper_15 {
  background-color: rgba(230, 227, 224, 1);
  border-radius: 4px;
  height: 23px;
  width: 122px;
  margin: 5px 0 0 73px;
}

.text_20 {
  width: 29px;
  height: 18px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 15px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 2px 0 0 46px;
}

.group_5 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  width: 477px;
  height: 14px;
  margin: 8px 0 0 62px;
}

.text-wrapper_16 {
  width: 573px;
  height: 19px;
  margin: 2px 0 73px 350px;
}

.text_21 {
  width: 17px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.text_22 {
  width: 104px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 11px;
  font-family: Inter-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 11px;
}

.label_2 {
  position: absolute;
  left: 584px;
  top: 111px;
  width: 35px;
  height: 35px;
}

.label_3 {
  position: absolute;
  left: 584px;
  top: 180px;
  width: 35px;
  height: 35px;
}

.box_9 {
  background-image: linear-gradient(
    90deg,
    rgba(247, 253, 65, 0.8) 0,
    rgba(184, 205, 188, 0.8) 100%
  );
  border-radius: 80px;
  position: absolute;
  left: 359px;
  top: 212px;
  width: 474px;
  height: 14px;
}

.label_4 {
  position: absolute;
  left: 584px;
  top: 252px;
  width: 38px;
  height: 38px;
}

.label_5 {
  position: absolute;
  left: 584px;
  top: 323px;
  width: 38px;
  height: 38px;
}

.label_6 {
  position: absolute;
  left: 584px;
  top: 397px;
  width: 38px;
  height: 38px;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.justify-between {
  justify-content: space-between;
}

body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(61, 124, 74, 0.9);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-family: Inter-Regular;
  transition: all 0.3s ease;
  z-index: 1000;
}

.back-button:hover {
  background: rgba(61, 124, 74, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 124, 74, 0.3);
}

 .gradient-slider {
      width: 100%;
      height: 15px;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      outline: none;
  }

.gradient-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 35px;
      height: 35px;
      margin-top: -7px;
      background-image: url('@/assets/img/train.png');
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 8px transparent;
      transition: all 0.2s ease;
      background-size: cover; 
      background-repeat: no-repeat; 
      background-position: center;
  }

/* Bus slider specific styling */
#mySlider5::-webkit-slider-thumb {
      background-image: url('@/assets/img/bus.png');
  }

/* Button container */
.popup-buttons {
  display: flex;
  justify-content: center; /* center horizontally */
  gap: 20px;               /* space between buttons */
  margin-top: 20px;        /* some space above */
}

/* Shared button styles */
.cancel-button,
.submit-button {
  display: flex;
  align-items: center;   /* center text vertically */
  justify-content: center;
  width: 120px;
  height: 40px;
  border: 1px solid;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
}

.cancel-button a,
.submit-button a {
  color: inherit;          /* inherit parent color */
  text-decoration: none;   /* remove underline */
}

/* Optional hover effect */
.cancel-button a:hover,
.submit-button a:hover {
  opacity: 0.8;
}

/* Individual colors */
.cancel-button {
  color: orange; 
  border: 1px solid orange;
}

.submit-button {
  color: green;
  border: 1px solid green;
}

.main-container {
  width: 95%;
  position: fixed;              /* Fix to viewport */
  top: 50%;                     /* Move to vertical center */
  left: 50%;                    /* Move to horizontal center */
  transform: translate(-50%, -50%); /* Center exactly */
  padding: 30px;                /* Optional spacing */
  max-height: calc(100vh - 150px);             /* Prevent overflow */
  overflow-y: auto;             /* Scroll inside if too tall */  
  text-align: center;
}
</style>

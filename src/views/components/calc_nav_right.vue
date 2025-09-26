<!-- calc_nav_right.vue -->
<template>
  <div v-if="!hideRight" class="image-wrapperNav right-button">
    <router-link id="dynamicLinkRight" :to="rightToSafe" class="full-button-link">
      <img
        class="label_right"
        referrerpolicy="no-referrer"
        src="@/assets/img2/nav_right.png"
      />
    </router-link>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    hideRight?: boolean
    rightTo?: string
  }>()

  const rightToSafe = computed(() => props.rightTo ?? '/')
</script>

<style scoped>
  @keyframes breathe {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.9;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(61, 124, 74, 0.7);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(61, 124, 74, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(61, 124, 74, 0);
    }
  }

  .image-wrapperNav {
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    background-image: linear-gradient(180deg, rgba(236, 230, 168, 1) 0, rgba(255, 255, 255, 1) 100%);
    border-radius: 50%;
    height: 70px;
    margin-top: 33px;
    width: 70px;
    position: fixed;
    top: 30%;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    cursor: pointer;
    animation: breathe 3s ease-in-out infinite;
    z-index: 2147483647; /* Ensure buttons are above other content */
  }

  .right-button {
    right: 20px; /* distance from right edge */
  }

  .label_right {
    width: 54px; /* adjust size */
    height: 54px;
    cursor: pointer;
    margin: 10px 0 0 10px;
  }

  .full-button-link {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
  }
  .image-wrapperNav:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    animation: pulse 1.5s infinite;
  }
</style>

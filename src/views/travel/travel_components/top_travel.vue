<template>
  <div class="section_3 flex-col">
    <slot />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.section_3 {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: transparent;
}
.flex-col {
  display: flex;
}
</style>

<template>
    <component :is="SvgComponent" />
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineAsyncComponent } from 'vue';
  
  const props = defineProps({
    name: {
      type: String,
      required: true
    }
  });
  
  const SvgComponent = defineAsyncComponent(() =>
    import(`@/assets/${props.name}.svg?component`)
  );
  </script>
  
  <style scoped>
  /* 可添加样式 */
  </style>    
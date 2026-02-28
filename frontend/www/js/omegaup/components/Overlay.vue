<template>
  <div v-if="isOverlayShown" data-overlay @click="onOverlayClicked">
    <slot name="popup" :isOverlayShown="isOverlayShown"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    showOverlay?: boolean;
  }>(),
  {
    showOverlay: false,
  },
);

const emit = defineEmits<{
  (e: 'hide-overlay'): void;
}>();

const isOverlayShown = ref(props.showOverlay);

function onOverlayClicked(evt: Event): void {
  if (typeof $(evt.composedPath()[0]).attr('data-overlay') !== 'undefined') {
    isOverlayShown.value = false;
    emit('hide-overlay');
  }
}

watch(
  () => props.showOverlay,
  (newValue) => {
    isOverlayShown.value = newValue;
  },
);
</script>

<style lang="scss" scoped>
@import '../../../sass/main.scss';

[data-overlay] {
  display: block !important;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(var(--overlay-background-color), 0.5);
  z-index: 9999998 !important;
}
</style>

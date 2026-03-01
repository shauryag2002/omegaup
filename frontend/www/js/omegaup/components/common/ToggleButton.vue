<template>
  <button
    type="button"
    class="toggle-button"
    role="switch"
    :aria-checked="String(modelValue)"
    :style="{
      width: width + 'px',
      height: height + 'px',
      fontSize: fontSize + 'px',
      backgroundColor: modelValue ? color.checked : color.unchecked,
      borderRadius: height / 2 + 'px',
    }"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="toggle-label">{{
      modelValue ? labels.checked : labels.unchecked
    }}</span>
    <span
      class="toggle-circle"
      :style="{
        width: height - 6 + 'px',
        height: height - 6 + 'px',
        transform: modelValue
          ? `translateX(${width - height}px)`
          : 'translateX(0)',
      }"
    ></span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    color?: { checked: string; unchecked: string };
    fontSize?: number;
    height?: number;
    labels?: { checked: string; unchecked: string };
    width?: number;
  }>(),
  {
    color: () => ({ checked: '#75c791', unchecked: '#bfcbd9' }),
    fontSize: 12,
    height: 22,
    labels: () => ({ checked: 'On', unchecked: 'Off' }),
    width: 50,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<style scoped>
.toggle-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border: none;
  cursor: pointer;
  color: #fff;
  transition: background-color 0.3s;
  outline: none;
}

.toggle-label {
  position: relative;
  z-index: 1;
  width: 100%;
  text-align: center;
  user-select: none;
}

.toggle-circle {
  position: absolute;
  top: 3px;
  left: 3px;
  border-radius: 50%;
  background-color: #fff;
  transition: transform 0.3s;
}
</style>

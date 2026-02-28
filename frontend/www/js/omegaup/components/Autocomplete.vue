<template>
  <input
    ref="input"
    class="typeahead form-control"
    autocomplete="off"
    :placeholder="placeholder"
    :name="name"
    :value="value"
    @change="onUpdateInput"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  value: string;
  placeholder: string;
  name: string;
  // eslint-disable-next-line no-undef -- This is defined in TypeScript.
  init: (el: JQuery<HTMLElement>) => void;
}>();

const emit = defineEmits<{
  (e: 'input', value: string): void;
  (e: 'update:value', value: string): void;
}>();

const input = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (input.value) {
    props.init($(input.value as HTMLElement));
  }
});

function onUpdateInput(): void {
  if (!input.value) return;
  const dataValue = input.value.getAttribute('data-value');
  if (dataValue !== null) {
    emit('update:value', dataValue);
  }
  emit('input', input.value.value);
}

watch(
  () => props.value,
  (newValue: string) => {
    if (input.value) {
      input.value.value = newValue;
    }
  },
);
</script>

<style lang="scss">
.tt-dataset {
  background: white;
  padding: 10px;
  border: 1px solid gray;
}
</style>

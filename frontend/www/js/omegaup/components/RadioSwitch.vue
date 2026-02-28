<template>
  <div class="form-control container-fluid" :readonly="readonly">
    <div class="form-check form-check-inline">
      <label class="form-check-label">
        <input
          v-model="radioValue"
          :disabled="readonly"
          class="form-check-input"
          type="radio"
          :name="name"
          :value="valueForTrue"
          @change.prevent="onUpdateInput"
        />{{ textForTrue }}
      </label>
    </div>
    <div class="form-check form-check-inline">
      <label class="form-check-label">
        <input
          v-model="radioValue"
          :disabled="readonly"
          class="form-check-input"
          type="radio"
          :name="name"
          :value="valueForFalse"
          @change.prevent="onUpdateInput"
        />{{ textForFalse }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import T from '../lang';

const props = withDefaults(
  defineProps<{
    name: string;
    readonly?: boolean;
    selectedValue?: any;
    valueForTrue?: any;
    valueForFalse?: any;
    textForTrue?: string;
    textForFalse?: string;
  }>(),
  {
    readonly: false,
    selectedValue: undefined,
    valueForTrue: true,
    valueForFalse: false,
    textForTrue: () => T.wordsYes,
    textForFalse: () => T.wordsNo,
  },
);

const emit = defineEmits<{
  (e: 'update:value', value: any): void;
}>();

const radioValue = ref(props.selectedValue ?? props.valueForFalse);

watch(radioValue, (newValue) => {
  emit('update:value', newValue);
});

function onUpdateInput(): void {
  emit('update:value', radioValue.value);
}
</script>

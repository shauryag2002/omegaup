<template>
  <input
    ref="inputEl"
    v-model="stringValue"
    :name="name"
    :min="minDateStr"
    :max="maxDateStr"
    class="form-control"
    :class="{ 'is-invalid': isInvalid }"
    required="required"
    size="16"
    type="date"
    :disabled="!enabled"
    :readonly="usedFallback"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import T from '../lang';
import * as time from '../time';
import '../../../third_party/js/bootstrap-datepicker.js';

const props = withDefaults(
  defineProps<{
    name?: string;
    value: Date;
    enabled?: boolean;
    format?: string;
    isInvalid?: boolean;
    min?: Date | null;
    max?: Date | null;
  }>(),
  {
    name: '',
    enabled: true,
    format: () => T.datePickerFormat,
    isInvalid: false,
    min: null,
    max: null,
  },
);

const emit = defineEmits<{
  (e: 'input', value: Date): void;
}>();

const inputEl = ref<HTMLInputElement | null>(null);
const usedFallback = ref(false);
const stringValue = ref(time.formatDateLocal(props.value));

const minDateStr = computed(() => {
  return props.min?.toISOString()?.split('T')?.[0];
});

const maxDateStr = computed(() => {
  return props.max?.toISOString()?.split('T')?.[0];
});

function mountedFallback(): void {
  usedFallback.value = true;
  $(inputEl.value!)
    .datepicker({
      weekStart: 1,
      format: props.format,
    })
    .on('changeDate', (ev: any) => {
      emit('input', ev.date);
    })
    .datepicker('setValue', props.value);
}

onMounted(() => {
  if (inputEl.value && inputEl.value.type === 'text') {
    // Even though we declared the input as having date type,
    // browsers that don't support it will silently change the type to text.
    // In that case, use the bootstrap datepicker.
    mountedFallback();
  }
});

watch(
  () => stringValue.value,
  (newStringValue: string) => {
    if (usedFallback.value) {
      // If the fallback was used, we don't need to update anything.
      return;
    }
    emit('input', time.parseDateLocal(newStringValue));
  },
);

watch(
  () => props.value,
  (newValue: Date) => {
    stringValue.value = time.formatDateLocal(newValue);
    if (usedFallback.value) {
      $(inputEl.value!).datepicker('setValue', newValue);
    }
  },
);
</script>

<style>
@import '../../../third_party/css/bootstrap-datepicker.css';
</style>

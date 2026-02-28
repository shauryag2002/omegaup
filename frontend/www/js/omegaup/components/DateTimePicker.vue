<template>
  <input
    ref="inputEl"
    v-model="stringValue"
    class="form-control"
    :class="{ 'is-invalid': isInvalid }"
    required="required"
    size="16"
    type="datetime-local"
    :disabled="!enabled"
    :max="finish ? time.formatDateTimeLocal(finish) : null"
    :min="start ? time.formatDateTimeLocal(addDelay(start)) : null"
    :readonly="readonly || usedFallback"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import T from '../lang';
import * as time from '../time';
import '../../../third_party/js/bootstrap-datetimepicker.min.js';
import '../../../third_party/js/locales/bootstrap-datetimepicker.es.js';
import '../../../third_party/js/locales/bootstrap-datetimepicker.pt-BR.js';

const props = withDefaults(
  defineProps<{
    value: Date;
    enabled?: boolean;
    format?: string;
    start?: Date | null;
    finish?: Date | null;
    readonly?: boolean;
    isInvalid?: boolean;
  }>(),
  {
    enabled: true,
    format: () => T.dateTimePickerFormat,
    start: null,
    finish: null,
    readonly: false,
    isInvalid: false,
  },
);

const emit = defineEmits<{
  (e: 'input', value: Date): void;
}>();

const inputEl = ref<HTMLInputElement | null>(null);
const usedFallback = ref(false);
const stringValue = ref(time.formatDateTimeLocal(props.value));

function addDelay(date: Date): Date {
  // Since test field population is slow, it's necessary to add a delay
  // of a few minutes to prevent the test from failing due to
  // the next minute starting.
  let delayedDate = new Date(date);
  const delay = 5;
  delayedDate.setMinutes(delayedDate.getMinutes() - delay);
  return delayedDate;
}

function mountedFallback(): void {
  usedFallback.value = true;
  $(inputEl.value!)
    .datetimepicker({
      format: props.format,
      defaultDate: props.value,
      locale: T.locale,
    })
    .on('change', () => {
      emit('input', $(inputEl.value!).data('datetimepicker').getDate());
    });

  $(inputEl.value!).data('datetimepicker').setDate(props.value);
  if (props.start !== null) {
    $(inputEl.value!).data('datetimepicker').setStartDate(props.start);
  }
  if (props.finish !== null) {
    $(inputEl.value!).data('datetimepicker').setEndDate(props.finish);
  }
}

onMounted(() => {
  if (inputEl.value && inputEl.value.type === 'text') {
    // Even though we declared the input as having datetime-local type,
    // browsers that don't support it will silently change the type to text.
    // In that case, use the bootstrap datetimepicker.
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
    emit('input', time.parseDateTimeLocal(newStringValue));
  },
);

watch(
  () => props.value,
  (newValue: Date) => {
    stringValue.value = time.formatDateTimeLocal(newValue);
    if (usedFallback.value) {
      $(inputEl.value!).data('datetimepicker').setDate(newValue);
    }
  },
);
</script>

<style>
@import '../../../third_party/css/bootstrap-datetimepicker.css';
</style>

<template>
  <span class="grader-count badge" :class="graderBadgeClass">{{
    graderCounter
  }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  queueLength: number;
  error: boolean;
}>();

const graderCounter = computed((): string => {
  if (props.error === true) {
    return '?';
  } else if (props.queueLength === -1) {
    return '…';
  }
  return `${props.queueLength}`;
});

const graderBadgeClass = computed((): string => {
  if (props.queueLength === -1 && props.error === false) {
    return '';
  } else if (props.error === true) {
    return 'grader-error';
  } else if (props.queueLength < 5) {
    return 'grader-ok';
  }
  return 'grader-warning';
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
.grader-error {
  color: var(--badges-grader-error-font-color);
  background-image: linear-gradient(
    var(--badges-grader-error-gradient-from-background-color),
    var(--badges-grader-error-gradient-to-background-color)
  );
  background-color: var(--badges-grader-error-background-color);
}

.grader-ok {
  color: var(--badges-grader-ok-font-color);
  background-image: linear-gradient(
    var(--badges-grader-ok-gradient-from-background-color),
    var(--badges-grader-ok-gradient-to-background-color)
  );
  background-color: var(--badges-grader-ok-background-color);
}

.grader-warning {
  color: var(--badges-grader-warning-font-color);
  background-image: linear-gradient(
    to bottom,
    var(--badges-grader-warning-from-font-color) 0,
    var(--badges-grader-warning-to-font-color) 100%
  );
  border-color: var(--badges-grader-warning-border-color);
}
</style>

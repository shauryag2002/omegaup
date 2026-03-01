<template>
  <span data-count-down-timer>
    {{ formattedTimeLeft }}
  </span>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { omegaup } from '../omegaup';
import * as time from '../time';
import * as ui from '../ui';
import T from '../lang';

const props = withDefaults(
  defineProps<{
    targetTime: Date;
    countdownFormat?: omegaup.CountdownFormat;
  }>(),
  {
    countdownFormat: omegaup.CountdownFormat.EventCountdown,
  },
);

const emit = defineEmits<{
  (e: 'finish'): void;
}>();

let timerInterval = 0;
const currentTime = ref(Date.now());

const timeLeft = computed((): number => {
  return props.targetTime.getTime() - currentTime.value;
});

const formattedTimeLeft = computed((): string => {
  switch (props.countdownFormat) {
    case omegaup.CountdownFormat.EventCountdown:
      if (timeLeft.value < 0) {
        return '00:00:00';
      }
      return time.formatDelta(timeLeft.value);
    case omegaup.CountdownFormat.WaitBetweenUploadsSeconds:
      return ui.formatString(T.arenaRunSubmitWaitBetweenUploads, {
        submissionGap: Math.ceil(timeLeft.value / 1000),
      });
    case omegaup.CountdownFormat.ContestHasNotStarted:
      if (timeLeft.value < 0) {
        return T.arenaContestHasAlreadyStarted;
      }
      return ui.formatString(T.contestWillBeginIn, {
        time: time.formatDelta(timeLeft.value),
      });
    case omegaup.CountdownFormat.AssignmentHasNotStarted:
      if (timeLeft.value < 0) {
        return T.arenaCourseAssignmentHasAlreadyStarted;
      }
      return ui.formatString(T.arenaCourseAssignmentWillBeginIn, {
        time: time.formatDelta(timeLeft.value),
      });
    default:
      return '';
  }
});

watch(timeLeft, (newValue) => {
  if (newValue > 0) return;
  if (!timerInterval) return;
  clearInterval(timerInterval);
  timerInterval = 0;
  emit('finish');
});

onMounted(() => {
  timerInterval = window.setInterval(
    () => (currentTime.value = Date.now()),
    1000,
  );
});
</script>

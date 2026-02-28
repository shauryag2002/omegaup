<template>
  <EphemeralIde
    :accepted-languages="acceptedLanguages"
    :initial-language="initialLanguage"
    :problem="problem"
    :should-show-submit-button="canSubmit"
    :can-run="canRun"
    :is-embedded="isEmbedded"
    :initial-theme="initialTheme"
    :next-submission-timestamp="nextSubmissionTimestamp"
    :next-execution-timestamp="nextExecutionTimestamp"
    @execute-run="emit('execute-run')"
  >
  </EphemeralIde>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { types } from '../../api_types';
import * as Util from '../../grader/util';
import EphemeralIde from '../../grader/Ephemeral.vue';

const props = withDefaults(
  defineProps<{
    problem?: types.ProblemInfo;
    canSubmit?: boolean;
    canRun?: boolean;
    acceptedLanguages?: string[];
    preferredLanguage?: string | null;
    isEmbedded?: boolean;
    initialTheme?: Util.MonacoThemes;
    nextSubmissionTimestamp?: null | Date;
    nextExecutionTimestamp?: null | Date;
  }>(),
  {
    problem: () => ({ ...Util.DUMMY_PROBLEM }),
    canSubmit: false,
    canRun: true,
    acceptedLanguages: () =>
      Object.values(Util.supportedLanguages).map(
        (languageInfo) => languageInfo.language,
      ),
    preferredLanguage: 'cpp17-gcc',
    isEmbedded: true,
    initialTheme: Util.MonacoThemes.VSLight,
    nextSubmissionTimestamp: null,
    nextExecutionTimestamp: null,
  },
);

const emit = defineEmits<{
  (e: 'execute-run'): void;
}>();

// note: initial source is for the IDE is also supported
const initialLanguage = computed(() => {
  if (
    !props.preferredLanguage ||
    !props.acceptedLanguages.includes(props.preferredLanguage)
  ) {
    return props.acceptedLanguages[0];
  }
  return props.preferredLanguage;
});
</script>

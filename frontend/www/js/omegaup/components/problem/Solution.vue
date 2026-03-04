<template>
  <div v-if="isDisabled" class="system-in-maintainance m-5 text-center">
    <OmegaupMarkdown
      :markdown="T.problemSolutionSystemInMaintainance"
    ></OmegaupMarkdown>
    <FontAwesomeIcon :icon="['fas', 'cogs']" />
  </div>
  <div v-else class="card">
    <div class="row p-3">
      <div class="col-12 text-right">
        <a :href="SolutionViewFeatureGuideURL"
          ><FontAwesomeIcon :icon="['fas', 'question-circle']" />
          {{ T.officialSolutionsInfo }}</a
        >
      </div>
    </div>

    <OmegaupMarkdown
      v-if="showSolution"
      :markdown="solution.markdown"
      :source-mapping="solution.sources"
      :image-mapping="solution.images"
    ></OmegaupMarkdown>
    <div v-else class="interstitial">
      <OmegaupMarkdown :markdown="statusMessage"></OmegaupMarkdown>
      <OmegaupMarkdown
        v-show="showViewsLeft"
        :markdown="
          ui.formatString(T.solutionViewsLeft, {
            available: allowedSolutionsToSee,
            total: 5,
          })
        "
      ></OmegaupMarkdown>
      <div class="text-center mt-5">
        <button
          v-if="status === 'unlocked'"
          class="btn btn-primary btn-md"
          @click="emit('get-solution')"
        >
          {{ T.wordsSeeSolution }}
          <FontAwesomeIcon :icon="['fas', 'unlock']" />
        </button>
        <button
          v-else-if="status === 'locked' && allowedSolutionsToSee === null"
          class="btn btn-secondary btn-md"
          @click="emit('get-allowed-solutions')"
        >
          {{ T.solutionAvailableViews }}
        </button>
        <button
          v-else-if="status === 'locked' && allowedSolutionsToSee > 0"
          class="btn btn-primary btn-md"
          @click="emit('unlock-solution')"
        >
          {{ T.wordsUnlockSolution }}
          <FontAwesomeIcon :icon="['fas', 'lock']" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import T from '../../lang';
import * as ui from '../../ui';
import { types } from '../../api_types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faLock,
  faUnlock,
  faQuestionCircle,
  faCogs,
} from '@fortawesome/free-solid-svg-icons';
import { getBlogUrl } from '../../urlHelper';
library.add(faLock);
library.add(faUnlock);
library.add(faQuestionCircle);
library.add(faCogs);

import OmegaupMarkdown from './ProblemMarkdown.vue';

const props = withDefaults(
  defineProps<{
    status: string;
    solution?: types.ProblemStatement | null;
    allowedSolutionsToSee: number;
    isDisabled?: boolean;
  }>(),
  {
    solution: null,
    isDisabled: true,
  },
);

const emit = defineEmits<{
  (e: 'get-solution'): void;
  (e: 'get-allowed-solutions'): void;
  (e: 'unlock-solution'): void;
}>();

const SolutionViewFeatureGuideURL = computed((): string => {
  return getBlogUrl('SolutionViewFeatureGuideURL');
});

const showSolution = computed((): boolean => {
  return props.status === 'unlocked' && props.solution !== null;
});

const statusMessage = computed((): string => {
  switch (props.status) {
    case 'unlocked':
      return T.solutionConfirm;
    case 'locked':
      return T.solutionLocked;
    case 'not_found':
      return T.solutionNotFound;
    case 'not_logged_in':
      return T.solutionNotLoggedIn;
    default:
      return '';
  }
});

const showViewsLeft = computed((): boolean => {
  return (
    props.allowedSolutionsToSee !== null && props.status !== 'not_logged_in'
  );
});
</script>

<style scoped lang="scss">
.interstitial {
  padding: 2em;
}

.solution {
  padding: 2em 7em;
}

.system-in-maintainance {
  font-size: 160%;
  color: var(--general-in-maintainance-color);
}
</style>

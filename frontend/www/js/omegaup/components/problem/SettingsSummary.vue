<template>
  <div>
    <h3 :data-problem-title="problem.alias" class="text-center mb-4">
      {{ title }}
      <template v-if="showVisibilityIndicators">
        <img
          v-if="problem.quality_seal || problem.visibility === 3"
          src="/media/quality-badge.png"
          :title="T.wordsHighQualityProblem"
          :alt="T.wordsHighQualityProblem"
          class="mr-2"
        />
        <font-awesome-icon
          v-if="problem.visibility === 1 || problem.visibility === -1"
          :icon="['fas', 'exclamation-triangle']"
          :title="T.wordsWarningProblem"
          class="mr-2"
        ></font-awesome-icon>
        <font-awesome-icon
          v-if="problem.visibility === 0 || problem.visibility === -1"
          :icon="['fas', 'eye-slash']"
          :title="T.wordsPrivate"
          class="mr-2"
        ></font-awesome-icon>
        <font-awesome-icon
          v-if="problem.visibility <= -2"
          :icon="['fas', 'ban']"
          :title="T.wordsBannedProblem"
          class="mr-2"
          color="darkred"
        ></font-awesome-icon>
      </template>

      <a v-if="showEditLink" :href="`/problem/${problem.alias}/edit/`">
        <font-awesome-icon :icon="['fas', 'edit']" />
      </a>
      <button
        v-if="userLoggedIn && !inContestOrCourse && problem.accepts_submissions"
        data-bookmark-button
        class="btn btn-link p-0 ml-2"
        :title="isBookmarked ? T.problemBookmarkRemove : T.problemBookmarkAdd"
        @click.prevent.stop="onToggleBookmark"
      >
        <font-awesome-icon
          :icon="['fas', 'bookmark']"
          class="bookmark-icon"
          :class="{
            'bookmark-active': isBookmarked,
            'bookmark-inactive': !isBookmarked,
          }"
        />
      </button>
    </h3>

    <!-- Warning/Ban Reasons Banner -->
    <div
      v-if="showWarningReasons && warningReasons.length"
      class="alert mx-auto w-75 mb-3"
      :class="isBanned ? 'alert-danger' : 'alert-warning'"
      role="alert"
    >
      <strong>{{
        isBanned ? T.problemBannedBecause : T.problemWarningBecause
      }}</strong>
      <ul class="warning-reasons-list mb-0 mt-2">
        <li v-for="(reason, index) in warningReasons" :key="index">
          {{ reason }}
        </li>
      </ul>
    </div>

    <table
      v-if="problem.accepts_submissions"
      class="table table-bordered mx-auto w-75 mb-0"
    >
      <tr>
        <th class="align-middle" scope="row">{{ T.wordsPoints }}</th>
        <td class="align-middle">{{ problem.points }}</td>
        <th class="align-middle" scope="row">{{ T.arenaCommonMemoryLimit }}</th>
        <td class="align-middle" data-memory-limit>{{ memoryLimit }}</td>
      </tr>
      <tr>
        <th class="align-middle" scope="row">{{ T.arenaCommonTimeLimit }}</th>
        <td class="align-middle">{{ timeLimit }}</td>
        <th class="align-middle" scope="row">
          {{ T.arenaCommonOverallWallTimeLimit }}
        </th>
        <td class="align-middle">{{ overallWallTimeLimit }}</td>
      </tr>
      <tr>
        <template v-if="!showVisibilityIndicators">
          <th class="align-middle" scope="row">{{ T.wordsInOut }}</th>
          <td class="align-middle">{{ T.wordsConsole }}</td>
        </template>
        <th class="align-middle" scope="row">
          {{ T.problemEditFormInputLimit }}
        </th>
        <td class="align-middle">{{ inputLimit }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBan,
  faBookmark,
  faEdit,
  faExclamationTriangle,
  faExternalLinkAlt,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(
  faExclamationTriangle,
  faEdit,
  faEyeSlash,
  faBan,
  faExternalLinkAlt,
  faBookmark,
);

const props = withDefaults(
  defineProps<{
    problem: types.ArenaProblemDetails;
    problemsetTitle?: null | string;
    showVisibilityIndicators?: boolean;
    showEditLink?: boolean;
    userLoggedIn?: boolean;
    isBookmarked?: boolean;
    inContestOrCourse?: boolean;
  }>(),
  {
    problemsetTitle: null,
    showVisibilityIndicators: false,
    showEditLink: false,
    userLoggedIn: false,
    isBookmarked: false,
    inContestOrCourse: false,
  },
);

const emit = defineEmits<{
  (e: 'toggle-bookmark', alias: string): void;
}>();

function onToggleBookmark(): void {
  emit('toggle-bookmark', props.problem.alias);
}

const title = computed((): string => {
  if (props.showVisibilityIndicators) {
    return ui.formatString(T.problemSettingsSummaryTitleWithProblemId, {
      problem_id: props.problem.problem_id,
      problem_title: props.problem.title,
    });
  }
  if (props.problem.letter && props.problemsetTitle) {
    return ui.formatString(
      T.problemSettingsSummaryTitleWithProblemsetTitleAndLetter,
      {
        problemset_title: props.problemsetTitle,
        letter: props.problem.letter,
        problem_title: props.problem.title,
      },
    );
  }
  if (props.problem.letter && !props.problemsetTitle) {
    return ui.formatString(T.problemSettingsSummaryTitleWithLetter, {
      letter: props.problem.letter,
      problem_title: props.problem.title,
    });
  }
  return props.problem.title;
});

const memoryLimit = computed((): string => {
  if (!props.problem.settings?.limits.MemoryLimit) {
    return '';
  }
  if (typeof props.problem.settings?.limits.MemoryLimit === 'string') {
    return props.problem.settings?.limits.MemoryLimit;
  }
  const memLimit = props.problem.settings?.limits.MemoryLimit as number;
  return `${memLimit / 1024 / 1024} MiB`;
});

const timeLimit = computed((): string => {
  if (!props.problem.settings?.limits.TimeLimit) {
    return '';
  }
  return `${props.problem.settings?.limits.TimeLimit}`;
});

const overallWallTimeLimit = computed((): string => {
  if (!props.problem.settings?.limits.OverallWallTimeLimit) {
    return '';
  }
  return `${props.problem.settings?.limits.OverallWallTimeLimit}`;
});

const inputLimit = computed((): string => {
  if (!props.problem.input_limit) {
    return '';
  }
  return `${props.problem.input_limit / 1024} KiB`;
});

const warningReasons = computed((): string[] => {
  return props.problem.warningReasons ?? [];
});

const showWarningReasons = computed((): boolean => {
  // Only show warning reasons when visibility indicators are active
  // (which means the user is viewing their own problem details)
  return props.showVisibilityIndicators;
});

const isBanned = computed((): boolean => {
  // visibility <= -2 indicates banned status
  return props.problem.visibility <= -2;
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

table td {
  padding: 0.5rem;
}

.bookmark-icon {
  font-size: 1.5em;
}

.bookmark-active {
  color: $omegaup-blue;
}

.bookmark-inactive {
  color: $omegaup-grey--lighter;
  opacity: 0.5;
}

.warning-reasons-list {
  max-height: 100px;
  overflow-y: auto;
  padding-left: 1.5rem;
}
</style>

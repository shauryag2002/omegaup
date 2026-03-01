<template>
  <div class="problem-list mr-3 mr-lg-0">
    <div v-if="inAssignment" class="active" data-breadcrumbs>
      <span>
        <a class="breadcrumbs-link" href="/course/">{{ T.navCourses }}</a> >
        <a class="breadcrumbs-link" :href="urlAssignment">{{ courseName }}</a>
        <template v-if="currentAssignment">
          > <span class="breadcrumbs-link">{{ currentAssignment.name }}</span>
        </template>
      </span>
    </div>
    <div class="summary" :class="{ active: !activeProblem }">
      <a
        class="name"
        href="#problems"
        @click="emit('disable-active-problem')"
        >{{ T.wordsSummary }}</a
      >
    </div>
    <div
      v-for="problem in problems"
      :key="problem.alias"
      :class="{ active: problem.alias === activeProblem }"
      data-navbar-problem
    >
      <div class="row">
        <div class="col-xs-5 problem-type w-50 pl-4">
          <span v-if="inAssignment">{{
            getProblemTypeTitle(problem.acceptsSubmissions)
          }}</span>
        </div>
        <div
          v-if="problem.acceptsSubmissions"
          class="col-xs-7 solved text-right w-50 pr-3"
        >
          <span class="mr-1">{{ getMaxScoreForProblem(problem) }}</span>
          <FontAwesomeIcon
            v-if="
              problem.myBestScore == problem.maxScore ||
              problem.bestScore == problem.maxScore
            "
            icon="check"
            :style="{ color: 'green' }"
          />
          <FontAwesomeIcon
            v-else-if="
              problem.hasMyRuns ||
              (problem.hasRuns && problem.hasMyRuns === null)
            "
            icon="times"
            :style="{ color: 'red' }"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12 pl-4">
          <a
            :data-problem="problem.alias"
            class="name"
            @click="onNavigateToProblem(problem)"
            >{{ problem.text }}</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { omegaup } from '../../omegaup';
import { types } from '../../api_types';
import T from '../../lang';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const props = withDefaults(
  defineProps<{
    problems: types.NavbarProblemsetProblem[];
    activeProblem: string | null;
    courseAlias: string | null;
    courseName: string | null;
    inAssignment: boolean;
    digitsAfterDecimalPoint: number;
    currentAssignment: omegaup.Assignment | null;
  }>(),
  {
    inAssignment: false,
    digitsAfterDecimalPoint: 2,
    currentAssignment: null,
  },
);

const emit = defineEmits<{
  (e: 'disable-active-problem'): void;
  (e: 'navigate-to-problem', problem: types.NavbarProblemsetProblem): void;
}>();

const urlAssignment = computed(() => `/course/${props.courseAlias}/`);

function getProblemTypeTitle(acceptsSubmissions: boolean): string {
  return acceptsSubmissions ? T.wordsProblem : T.wordsLecture;
}

function getMaxScoreForProblem(problem: types.NavbarProblemsetProblem): string {
  const bestScore = problem.myBestScore ?? problem.bestScore;
  return `(${bestScore.toFixed(
    props.digitsAfterDecimalPoint,
  )} / ${problem.maxScore.toFixed(props.digitsAfterDecimalPoint)})`;
}

function onNavigateToProblem(problem: types.NavbarProblemsetProblem) {
  emit('navigate-to-problem', problem);
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
.problem-list .breadcrumbs-link {
  display: inherit;
}

.problem-list > div {
  width: 19em;
  margin-bottom: 0.5em;
  padding-top: 0.2em;
  background: var(--arena-contest-navbar-problem-list-background-color);
  border: solid 1px var(--arena-contest-navbar-problem-list-border-color);
  border-width: 1px 0 1px 1px;
  position: relative;
}

.problem-list > div a {
  color: var(--arena-contest-navbar-problem-list-a-font-color);
  display: block;
  padding: 0.5em;
  width: 100%;
  cursor: pointer;
}

.problem-list > div.active {
  background: white;
}

.problem-list > div.summary {
  margin-bottom: 1em;
}

.problem-list > div .solved {
  text-align: right;
  right: 1em;
}

.problem-list .problem-type {
  font-size: 13px;
  color: var(--arena-contest-navbar-problem-type-font-color);
  font-weight: bold;
}
</style>

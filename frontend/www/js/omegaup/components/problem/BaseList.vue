<template>
  <div class="card">
    <div class="table-responsive mb-0">
      <table class="table">
        <thead>
          <tr class="sticky-top bg-white text-center">
            <th scope="col" class="align-middle text-nowrap">
              <span
                >{{ T.wordsID }}
                <OmegaupCommonSortControls
                  column="problem_id"
                  :sort-order="sortOrder"
                  :column-name="columnName"
                  @apply-filter="
                    (columnName, sortOrder) =>
                      emit('apply-filter', columnName, sortOrder)
                  "
              /></span>
            </th>
            <th scope="col" class="align-middle text-nowrap">
              <span>{{ T.wordsTitle }}</span>
              <span
                v-if="showProblemTags"
                class="badge custom-badge custom-badge-quality mr-1 ml-1 p-2"
                >{{ T.tagSourceLevel }}</span
              >
              <span
                v-if="showProblemTags"
                class="badge custom-badge custom-badge-owner mr-1 p-2"
                >{{ T.tagSourceOwner }}</span
              >
              <span
                v-if="showProblemTags"
                class="badge custom-badge custom-badge-voted p-2"
                >{{ T.tagSourceVoted }}</span
              >
              <OmegaupCommonSortControls
                column="title"
                :column-type="omegaup.ColumnType.String"
                :sort-order="sortOrder"
                :column-name="columnName"
                @apply-filter="
                  (columnName, sortOrder) =>
                    emit('apply-filter', columnName, sortOrder)
                "
              />
            </th>
            <th scope="col" class="align-middle text-nowrap">
              <span
                >{{ T.wordsQuality }}
                <OmegaupCommonSortControls
                  column="quality"
                  :sort-order="sortOrder"
                  :column-name="columnName"
                  @apply-filter="
                    (columnName, sortOrder) =>
                      emit('apply-filter', columnName, sortOrder)
                  "
              /></span>
            </th>
            <th scope="col" class="align-middle text-nowrap">
              <span
                >{{ T.wordsDifficulty }}
                <OmegaupCommonSortControls
                  column="difficulty"
                  :sort-order="sortOrder"
                  :column-name="columnName"
                  @apply-filter="
                    (columnName, sortOrder) =>
                      emit('apply-filter', columnName, sortOrder)
                  "
              /></span>
            </th>
            <th scope="col" class="align-middle text-nowrap">
              <span
                >{{ T.wordsRatio }}
                <OmegaupCommonSortControls
                  column="ratio"
                  :sort-order="sortOrder"
                  :column-name="columnName"
                  @apply-filter="
                    (columnName, sortOrder) =>
                      emit('apply-filter', columnName, sortOrder)
                  "
              /></span>
            </th>
            <th v-if="loggedIn" scope="col" class="align-middle text-nowrap">
              <span
                >{{ T.wordsMyScore }}
                <OmegaupCommonSortControls
                  column="score"
                  :sort-order="sortOrder"
                  :column-name="columnName"
                  @apply-filter="
                    (columnName, sortOrder) =>
                      emit('apply-filter', columnName, sortOrder)
                  "
              /></span>
            </th>
            <th scope="col" class="align-middle text-nowrap">
              <span>
                <a
                  data-toggle="tooltip"
                  :href="UserRankingFeatureGuideURL"
                  rel="tooltip"
                  :title="T.wordsPointsForRank"
                  :data-original-title="T.wordsPointsForRankTooltip"
                  ><img src="/media/question.png" :alt="T.wordsPointsForRank"
                /></a>
                <OmegaupCommonSortControls
                  column="points"
                  :sort-order="sortOrder"
                  :column-name="columnName"
                  @apply-filter="
                    (columnName, sortOrder) =>
                      emit('apply-filter', columnName, sortOrder)
                  "
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody data-problems>
          <tr v-for="problem in problems" :key="problem.problem_id">
            <td class="align-middle">{{ problem.problem_id }}</td>
            <td class="align-middle">
              <a
                :href="`/arena/problem/${problem.alias}/`"
                class="mr-2"
                data-problem-title-list
                >{{ problem.title }}</a
              >
              <FontAwesomeIcon
                v-if="problem.qualitySeal || problem.visibility === 3"
                :title="T.wordsHighQualityProblem"
                :icon="['fas', 'medal']"
                color="gold"
              />
              <FontAwesomeIcon
                v-else-if="problem.visibility === -1"
                :title="T.wordsWarningProblem"
                :icon="['fas', 'exclamation-triangle']"
              />
              <FontAwesomeIcon
                v-else-if="problem.visibility <= -3"
                :title="T.wordsBannedProblem"
                :icon="['fas', 'ban']"
              />
              <FontAwesomeIcon
                v-else-if="problem.visibility === 0"
                :title="T.wordsPrivate"
                :icon="['fas', 'eye-slash']"
              />
              <a
                v-for="tag in problem.tags"
                :key="tag.name"
                :class="`badge custom-badge custom-badge-${
                  tag.source.includes('quality') ? 'owner' : tag.source
                } ${
                  tag.name.includes('problemLevel')
                    ? 'custom-badge-quality'
                    : ''
                } m-1 p-2`"
                :href="hrefForProblemTag(props.selectedTags, tag.name)"
                >{{
                  Object.prototype.hasOwnProperty.call(T, tag.name)
                    ? T[tag.name]
                    : tag.name
                }}</a
              >
            </td>
            <td
              v-if="problem.quality !== null"
              class="text-center align-middle tooltip_column"
            >
              <span
                v-tooltip="
                  `${ui.formatString(T.wordsOutOf4, {
                    Score: problem.quality.toFixed(1),
                  })}`
                "
              >
                {{ QUALITY_TAGS[Math.round(problem.quality)] }}
              </span>
            </td>
            <td v-else class="text-right align-middle">—</td>
            <td
              v-if="problem.difficulty !== null"
              class="text-center align-middle"
            >
              <span
                v-tooltip="
                  `${ui.formatString(T.wordsOutOf4, {
                    Score: problem.difficulty.toFixed(1),
                  })}`
                "
              >
                {{ DIFFICULTY_TAGS[Math.round(problem.difficulty)] }}
              </span>
            </td>
            <td v-else class="text-center align-middle">—</td>
            <td class="text-right align-middle">
              {{ (100.0 * problem.ratio).toFixed(2) }}%<br />({{
                problem.accepted
              }}/{{ problem.submissions }})
            </td>
            <td v-if="loggedIn" class="text-right align-middle">
              {{ problem.score.toFixed(2) }}
            </td>
            <td class="text-right align-middle">
              {{ problem.points.toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="card-footer">
      <OmegaupCommonPaginator :pager-items="pagerItems" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import { types } from '../../api_types';
import * as ui from '../../ui';

import OmegaupCommonPaginator from '../common/Paginator.vue';
import OmegaupCommonSortControls from '../common/SortControls.vue';

import 'v-tooltip/dist/v-tooltip.css';
import { VTooltip } from 'v-tooltip';
import { getBlogUrl } from '../../urlHelper';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faEyeSlash,
  faMedal,
  faExclamationTriangle,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
library.add(faEyeSlash, faMedal, faExclamationTriangle, faBan);

const vTooltip = VTooltip;

const props = withDefaults(
  defineProps<{
    problems: omegaup.Problem[];
    loggedIn: boolean;
    selectedTags: string[];
    pagerItems: types.PageItem[];
    wizardTags: omegaup.Tag[];
    language: string;
    languages: string[];
    keyword: string;
    modes: string[];
    columns: string[];
    mode: string;
    column: string;
    tags: string[];
    sortOrder: string;
    columnName: string;
    path: string;
    showProblemTags?: boolean;
  }>(),
  {
    showProblemTags: true,
  },
);

defineEmits<{
  (e: 'apply-filter', columnName: string, sortOrder: string): void;
}>();

const QUALITY_TAGS = [
  T.qualityFormQualityVeryBad,
  T.qualityFormQualityBad,
  T.qualityFormQualityFair,
  T.qualityFormQualityGood,
  T.qualityFormQualityVeryGood,
];
const DIFFICULTY_TAGS = [
  T.qualityFormDifficultyVeryEasy,
  T.qualityFormDifficultyEasy,
  T.qualityFormDifficultyMedium,
  T.qualityFormDifficultyHard,
  T.qualityFormDifficultyVeryHard,
];

function hrefForProblemTag(selectedTags: string[], problemTag: string): string {
  if (!selectedTags) return `${props.path}?tag[]=${problemTag}`;
  let tags = selectedTags.slice();
  if (!tags.includes(problemTag)) tags.push(problemTag);
  return `${props.path}?tag[]=${tags.join('&tag[]=')}`;
}

const UserRankingFeatureGuideURL = computed((): string => {
  return getBlogUrl('UserRankingFeatureGuideURL');
});
</script>

<style lang="scss" scoped>
.sticky-offset {
  top: 4rem;
}
.sticky-top {
  z-index: 1;
}
.card {
  border-top: none;
  border-radius: 0rem 0rem 0.25rem 0.25rem;
}

table {
  border-collapse: separate;
  border-spacing: 0;
}

thead tr th {
  border: none;
}
</style>

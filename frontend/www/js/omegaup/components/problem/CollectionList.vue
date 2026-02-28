<template>
  <div class="container-fluid p-5 max-width mx-auto">
    <div class="row">
      <div class="col col-md-3 d-flex align-items-center">
        <a href="/problem/collection/" data-nav-problems-collection>{{
          T.problemCollectionBackCollections
        }}</a>
      </div>
      <div class="col mb-4">
        <h1 class="title-font p-0">{{ title }}</h1>
      </div>
    </div>
    <div class="d-flex flex-row">
      <div
        class="filters-sidebar"
        :class="{ 'filters-hidden': !filtersVisible }"
      >
        <OmegaupProblemFilterTags
          :selected-tags="selectedTags"
          :tags="availableTags"
          :public-quality-tags="publicQualityTags"
          @new-selected-tag="
            (selectedTags) =>
              emit(
                'apply-filter',
                columnName,
                sortOrder,
                difficulty,
                quality,
                selectedTags,
              )
          "
        />

        <div class="mb-3">
          <OmegaupToggleSwitch
            data-problem-tags-toggle
            :checked-value="showProblemTags"
            :text-description="T.userEditShowProblemTags"
            :size="ToggleSwitchSize.Small"
            @update:value="(value) => (showProblemTags = value)"
          />
        </div>
        <OmegaupProblemFilterDifficulty
          :selected-difficulty="difficulty"
          @change-difficulty="
            (difficulty) =>
              emit(
                'apply-filter',
                columnName,
                sortOrder,
                difficulty,
                quality,
                selectedTags,
              )
          "
        />

        <OmegaupProblemFilterQuality
          :quality="quality"
          @change-quality="
            (quality) =>
              emit(
                'apply-filter',
                columnName,
                sortOrder,
                difficulty,
                quality,
                selectedTags,
              )
          "
        />
      </div>

      <button
        class="btn btn-outline-secondary btn-sm filter-toggle"
        :title="
          filtersVisible ? T.collectionHideFilters : T.collectionShowFilters
        "
        :aria-label="
          filtersVisible ? T.collectionHideFilters : T.collectionShowFilters
        "
        @click="filtersVisible = !filtersVisible"
      >
        <FontAwesomeIcon
          :icon="filtersVisible ? 'chevron-left' : 'chevron-right'"
        />
      </button>

      <div class="flex-grow-1 main-content-wrapper">
        <div v-if="!problems || problems.length == 0" class="card-body">
          <div class="empty-table-message">
            {{ T.courseAssignmentProblemsEmpty }}
          </div>
        </div>

        <OmegaupProblemBaseList
          v-else
          :problems="problemsToShow"
          :logged-in="loggedIn"
          :selected-tags="selectedTags"
          :pager-items="pagerItems"
          :wizard-tags="wizardTags"
          :language="language"
          :languages="languages"
          :keyword="keyword"
          :modes="modes"
          :columns="columns"
          :mode="modes"
          :column="column"
          :tags="tagsList"
          :sort-order="sortOrder"
          :column-name="columnName"
          :path="`/problem/collection/${level}/`"
          :show-problem-tags="showProblemTags"
          @apply-filter="
            (columnName, sortOrder) =>
              emit(
                'apply-filter',
                columnName,
                sortOrder,
                difficulty,
                quality,
                selectedTags,
              )
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { omegaup } from '../../omegaup';
import OmegaupProblemFilterTags from './FilterTags.vue';
import OmegaupProblemBaseList from './BaseList.vue';
import OmegaupProblemFilterDifficulty from './FilterDifficulty.vue';
import OmegaupProblemFilterQuality from './FilterQuality.vue';
import OmegaupToggleSwitch, { ToggleSwitchSize } from '../ToggleSwitch.vue';
import T from '../../lang';
import { types } from '../../api_types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

library.add(faChevronLeft, faChevronRight);

const props = withDefaults(
  defineProps<{
    data: types.CollectionDetailsByLevelPayload;
    problems: omegaup.Problem[];
    loggedIn: boolean;
    selectedTags?: string[];
    pagerItems: types.PageItem[];
    wizardTags: omegaup.Tag[];
    language: string;
    languages: string[];
    keyword: string;
    modes: string[];
    columns: string[];
    mode: string;
    column: string;
    tagsList?: string[];
    sortOrder: string;
    columnName: string;
    difficulty: string;
    quality: string;
  }>(),
  {
    selectedTags: () => [],
    tagsList: () => [],
  },
);

const emit = defineEmits<{
  (
    e: 'apply-filter',
    columnName: string,
    sortOrder: string,
    difficulty: string,
    quality: string,
    selectedTags: string[],
  ): void;
}>();

const level = props.data.level;
const filtersVisible = ref(true);
const showProblemTags = ref(true);

const problemsToShow = computed((): omegaup.Problem[] => {
  if (showProblemTags.value) return props.problems;
  return props.problems.map((problem) => ({
    ...problem,
    tags: [],
  }));
});

const publicQualityTags = computed((): types.TagWithProblemCount[] => {
  const tagNames: Set<string> = new Set(
    props.data.frequentTags.map((x) => x.name),
  );
  return props.data.publicTags.filter((tag) => !tagNames.has(tag.name));
});

const availableTags = computed((): types.TagWithProblemCount[] => {
  const tags: types.TagWithProblemCount[] = props.data.frequentTags;
  const selectedTagNames = new Set<string>(props.selectedTags);
  return tags.concat(
    publicQualityTags.value.filter((tag) => selectedTagNames.has(tag.name)),
  );
});

const title = computed((): string => {
  switch (level) {
    case 'problemLevelBasicKarel':
      return T.problemLevelBasicKarel;
    case 'problemLevelBasicIntroductionToProgramming':
      return T.problemLevelBasicIntroductionToProgramming;
    case 'problemLevelIntermediateMathsInProgramming':
      return T.problemLevelIntermediateMathsInProgramming;
    case 'problemLevelIntermediateDataStructuresAndAlgorithms':
      return T.problemLevelIntermediateDataStructuresAndAlgorithms;
    case 'problemLevelIntermediateAnalysisAndDesignOfAlgorithms':
      return T.problemLevelIntermediateAnalysisAndDesignOfAlgorithms;
    case 'problemLevelAdvancedCompetitiveProgramming':
      return T.problemLevelAdvancedCompetitiveProgramming;
    case 'problemLevelAdvancedSpecializedTopics':
      return T.problemLevelAdvancedSpecializedTopics;
    default:
      return '';
  }
});
</script>

<style scoped>
.title-font {
  font-size: 2rem;
  letter-spacing: 0.01rem;
}

.max-width {
  max-width: 75rem;
}

.filters-sidebar {
  width: 250px;
  min-width: 250px;
  transition: width 0.3s ease, min-width 0.3s ease, opacity 0.2s ease;
  overflow: hidden;
  padding-right: 1rem;
}

.filters-sidebar.filters-hidden {
  width: 0;
  min-width: 0;
  opacity: 0;
  padding-right: 0;
}

.filter-toggle {
  align-self: flex-start;
  flex-shrink: 0;
  margin-right: 0.5rem;
  line-height: 1;
  padding: 0.25rem 0.35rem;
}

.main-content-wrapper {
  min-width: 0;
  flex: 1;
}
</style>

<template>
  <div class="px-3 py-5 p-lg-5">
    <div class="row">
      <div class="col-12 col-md-4 d-flex align-items-center">
        <a href="/problem/collection/" data-nav-problems-collection>{{
          T.problemCollectionBackCollections
        }}</a>
      </div>
      <div class="col mb-4">
        <h1 class="title-font">{{ T.omegaupTitleCollectionsByAuthor }}</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-lg-4 mb-3 mb-lg-0">
        <div class="row">
          <OmegaupProblemFilterAuthors
            :authors="authors"
            :selected-authors="selectedAuthors"
            @new-selected-author="
              (selectedAuthors) =>
                emit(
                  'apply-filter',
                  columnName,
                  sortOrder,
                  difficulty,
                  quality,
                  selectedAuthors,
                )
            "
          />
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
                  selectedAuthors,
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
                  selectedAuthors,
                )
            "
          />
        </div>
      </div>
      <div class="col">
        <div v-if="!problems || problems.length == 0" class="card-body">
          <div class="empty-table-message">
            {{ T.courseAssignmentProblemsEmpty }}
          </div>
        </div>
        <OmegaupProblemBaseList
          v-else
          :problems="problems"
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
          :path="'/problem/collection/author/'"
          @apply-filter="
            (columnName, sortOrder) =>
              emit(
                'apply-filter',
                columnName,
                sortOrder,
                difficulty,
                quality,
                selectedAuthors,
              )
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { omegaup } from '../../omegaup';
import OmegaupProblemFilterAuthors from './FilterAuthors.vue';
import OmegaupProblemBaseList from './BaseList.vue';
import OmegaupProblemFilterDifficulty from './FilterDifficulty.vue';
import OmegaupProblemFilterQuality from './FilterQuality.vue';
import T from '../../lang';
import { types } from '../../api_types';

const props = withDefaults(
  defineProps<{
    data: types.CollectionDetailsByAuthorPayload;
    problems: omegaup.Problem;
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
    tagsList?: string[];
    sortOrder: string;
    columnName: string;
    difficulty: string;
    quality: string;
    selectedAuthors?: string;
  }>(),
  {
    tagsList: () => [],
    selectedAuthors: () => [],
  },
);

const emit = defineEmits<{
  (
    e: 'apply-filter',
    columnName: string,
    sortOrder: string,
    difficulty: string,
    quality: string,
    selectedAuthors: string,
  ): void;
}>();

const authors = props.data.authorsRanking;
</script>

<style scoped>
.title-font {
  font-size: 2rem;
  letter-spacing: 0.01rem;
}

.max-width {
  max-width: 75rem;
}
</style>

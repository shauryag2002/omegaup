<template>
  <div class="container-lg p-3">
    <h2 class="text-center mt-5">
      {{ T.wordsProblems }}
    </h2>
    <div class="d-flex justify-content-end">
      <button
        class="btn btn-primary mb-2"
        type="button"
        @click="showFinderWizard = true"
      >
        {{ T.wizardLinkText }}
      </button>
    </div>
    <div class="d-flex align-items-center search-header-sticky-top">
      <ProblemSearchBar
        class="searchbar-width"
        :language="language"
        :languages="languages"
        :keyword="keyword"
        :tags="tags"
        :only-quality-seal="onlyQualitySeal"
        :search-result-problems="searchResultProblems"
        @update-search-result-problems="
          (query) => emit('update-search-result-problems', query)
        "
      ></ProblemSearchBar>
    </div>
    <!-- TODO: Migrar el problem finder a BS4 (solo para eliminar algunos estilos) -->
    <ProblemFinderWizard
      v-show="showFinderWizard"
      :possible-tags="wizardTags"
      @close="showFinderWizard = false"
      @search-problems="wizardSearch"
    ></ProblemFinderWizard>
    <ProblemBaseList
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
      :tags="tags"
      :sort-order="sortOrder"
      :column-name="columnName"
      :path="'/problem/'"
      @apply-filter="
        (columnName, sortOrder) => emit('apply-filter', columnName, sortOrder)
      "
    ></ProblemBaseList>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import { types } from '../../api_types';

import ProblemFinderWizard from './FinderWizard.vue';
import ProblemSearchBar from './SearchBar.vue';
import ProblemBaseList from './BaseList.vue';

defineProps<{
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
  tags: string[];
  onlyQualitySeal: boolean;
  sortOrder: string;
  columnName: string;
  searchResultProblems: types.ListItem[];
}>();

const emit = defineEmits<{
  (e: 'update-search-result-problems', query: string): void;
  (e: 'apply-filter', columnName: string, sortOrder: string): void;
  (e: 'wizard-search', queryParameters: omegaup.QueryParameters): void;
}>();

const showFinderWizard = ref(false);

function wizardSearch(queryParameters: omegaup.QueryParameters): void {
  emit('wizard-search', queryParameters);
}
</script>

<style>
.form-control {
  max-width: 14rem;
}

.searchbar-width .tags-input-wrapper-default {
  min-width: 20rem;
}

.search-header-sticky-top {
  position: sticky;
  top: 62px;
  z-index: 10;
}
</style>

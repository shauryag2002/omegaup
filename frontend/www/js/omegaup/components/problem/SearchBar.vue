<template>
  <div
    class="card-header d-flex justify-content-between align-items-center container-lg"
  >
    <form
      action="/problem/"
      method="GET"
      class="form-inline d-flex justify-content-center align-items-center flex-wrap form-mobile"
    >
      <div v-if="tags.length !== 0" class="form-group mr-2">
        <div v-for="tag in tags" :key="tag" class="mr-1">
          <input type="hidden" name="tag[]" :value="tag" />
          <span class="badge badge-secondary m-1 p-2">{{
            T[tag] ? T[tag] : tag
          }}</span>
        </div>
        <a class="remove-all-tags" href="/problem/">
          <font-awesome-icon :icon="['fas', 'times']" />
        </a>
      </div>
      <div class="form-group mr-2">
        <OmegaupCommonTypeahead
          data-problem-keyword-search
          :only-existing-tags="false"
          :max-results="10"
          :existing-options="searchResultProblems"
          :options="searchResultProblems"
          v-model:value="currentKeyword"
          :placeholder="T.wordsKeywordSearch"
          @update-existing-options="
            (query) => $emit('update-search-result-problems', query)
          "
        ></OmegaupCommonTypeahead>
        <input type="hidden" name="query" :value="currentKeywordValue" />
      </div>
      <div class="form-group mr-2">
        <label>
          {{ T.wordsFilterByLanguage }}
          <select
            v-model="currentLanguage"
            data-filter-language
            name="language"
            class="ml-2 form-control"
          >
            <option
              v-for="language in languages"
              :key="language"
              :value="language"
            >
              {{ getLanguageText(language) }}
            </option>
          </select>
        </label>
      </div>
      <div class="form-group mr-2">
        <label class="ml-4 large:ml-0">
          <input
            v-model="currentOnlyQualitySeal"
            name="only_quality_seal"
            class="form-check-input"
            type="checkbox"
            :value="true"
          />
          {{ T.qualityFormQualityOnly }}
        </label>
      </div>
      <input
        data-filter-submit-button
        class="btn btn-primary mr-2 button-mobile"
        type="submit"
        :value="T.wordsSearch"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
library.add(faTimes);

const props = defineProps<{
  tags: string[];
  keyword: string;
  language: string;
  languages: string[];
  onlyQualitySeal: boolean;
  searchResultProblems: types.ListItem[];
}>();

defineEmits<{
  (e: 'update-search-result-problems', query: string): void;
}>();

const currentKeyword = ref<types.ListItem>({
  key: props.keyword,
  value: props.keyword,
});
const currentLanguage = ref(props.language);
const currentOnlyQualitySeal = ref(props.onlyQualitySeal);

function getLanguageText(language: string): string {
  if (language === 'all') return T.wordsAll;
  if (language === 'en') return T.wordsEnglish;
  if (language === 'es') return T.wordsSpanish;
  return T.wordsPortuguese;
}

const currentKeywordValue = computed((): null | string => {
  return currentKeyword.value?.value ?? null;
});
</script>

<style lang="scss" scoped>
.form-group {
  label {
    font-weight: bold;
  }
}
.card-header {
  border: 1px solid var(--header-problem-card-color);
  border-bottom: none;
  background-color: var(--header-problem-card-color-no-opacity);
}

@media (max-width: 576px) {
  .button-mobile {
    margin-left: 1rem;
  }
  .form-control {
    margin-left: 0 !important;
  }
}
</style>

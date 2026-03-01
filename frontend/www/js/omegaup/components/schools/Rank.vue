<template>
  <div class="card" data-schools-rank>
    <h5
      class="card-header d-flex justify-content-between align-items-center school-rank-title"
    >
      {{
        showHeader
          ? ui.formatString(T.schoolRankOfTheMonthHeader, {
              count: rank ? rank.length : 0,
            })
          : ui.formatString(T.schoolRankRangeHeader, {
              lowCount: (page - 1) * length + 1,
              highCount: page * length,
            })
      }}

      <a :href="SchoolRankingFeatureGuideURL">
        <font-awesome-icon :icon="['fas', 'question-circle']" />
        {{ T.wordsRankingMeasurement }}
      </a>
    </h5>
    <div v-if="!showHeader" class="card-body form-row">
      <OmegaupCommonTypeahead
        class="col col-md-4 pl-0 pr-2"
        :existing-options="searchResultSchools"
        v-model:value="searchedSchool"
        :max-results="10"
        @update-existing-options="
          (query) => emit('update-search-result-schools', query)
        "
      ></OmegaupCommonTypeahead>
      <button
        class="btn btn-primary form-control col-4 col-md-2"
        type="button"
        @click="onSubmit"
      >
        {{ T.searchSchool }}
      </button>
    </div>
    <table class="table mb-0">
      <thead>
        <tr>
          <th class="text-center" scope="col">#</th>
          <th class="text-center" scope="col">{{ T.profileSchool }}</th>
          <th class="text-center" scope="col">{{ T.wordsScore }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(school, index) in rank" :key="index">
          <th class="text-center" scope="row">
            {{ showHeader ? index + 1 : school.ranking || '' }}
          </th>
          <td class="text-truncate text-center">
            <OmegaupCountryflag
              :country="school.country_id"
            ></OmegaupCountryflag>
            <a :href="`/schools/profile/${school.school_id}/`">{{
              school.name
            }}</a>
          </td>
          <td class="text-center">
            {{ school.score.toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="showHeader" class="card-footer">
      <a href="/rank/schools/">{{ T.rankSeeGeneralRanking }}</a>
    </div>
    <div v-else class="card-footer">
      <OmegaupCommonPaginator
        :pager-items="pagerItems"
      ></OmegaupCommonPaginator>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { omegaup } from '../../omegaup';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import OmegaupCountryflag from '../CountryFlag.vue';
import OmegaupCommonPaginator from '../common/Paginator.vue';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getBlogUrl } from '../../urlHelper';

withDefaults(
  defineProps<{
    page: number;
    length: number;
    showHeader: boolean;
    totalRows: number;
    rank: omegaup.SchoolsRank[];
    pagerItems: types.PageItem[];
    searchResultSchools?: types.SchoolListItem[];
  }>(),
  {
    searchResultSchools: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update-search-result-schools', query: string): void;
}>();

const searchedSchool = ref<null | types.SchoolListItem>(null);

const SchoolRankingFeatureGuideURL = computed<string>(() => {
  // Use the key defined in blog-links-config.json
  return getBlogUrl('SchoolRankingFeatureGuideURL');
});

function onSubmit(): void {
  if (!searchedSchool.value) return;
  window.location.href = `/schools/profile/${encodeURIComponent(
    searchedSchool.value.key,
  )}/`;
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
// FIXME: This prevents wrapping a table cell when the name of the school is too long.
// So, both tables (users rank and the current one) are perfectly aligned.
// Another solution should  be taken in the future.
.text-truncate {
  max-width: 250px;
}

.table-width {
  max-width: 52rem;
  margin: 0 auto;
}

.school-rank-title {
  font-size: 1.25rem;
}

[data-schools-rank] {
  max-width: 52rem;
  margin: 0 auto;
}

[data-schools-rank] .tags-input-wrapper-default {
  padding: 0.35rem 0.25rem 0.7rem 0.25rem;
}
</style>

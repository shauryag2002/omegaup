<template>
  <div>
    <h3 class="text-center mb-4">
      {{
        ui.formatString(T.nominationsRangeHeader, {
          lowCount: (pages - 1) * length + 1,
          highCount: pages * length,
        })
      }}
    </h3>
    <div class="card">
      <div class="card-header">
        <form class="form-group mb-0">
          <div class="form-row">
            <label class="col-form-label">{{ T.wordsSearchBy }}</label>
            <div class="col-md-4 mb-1">
              <select v-model="selectColumn" name="column" class="form-control">
                <option
                  v-for="(columnText, columnIndex) in columns"
                  :key="columnIndex"
                  :value="columnIndex"
                >
                  {{ columnText }}
                </option>
              </select>
            </div>
            <div class="col-md-4 mb-1">
              <OmegaupCommonTypeahead
                v-show="selectColumn == 'problem_alias'"
                :existing-options="searchResultProblems"
                :value.sync="queryProblem"
                :placeholder="T.wordsKeyword"
                @update-existing-options="
                  (query) => emit('update-search-result-problems', query)
                "
              ></OmegaupCommonTypeahead>
              <OmegaupCommonTypeahead
                v-show="
                  selectColumn == 'nominator_username' ||
                  selectColumn == 'author_username'
                "
                :existing-options="searchResultUsers"
                :value.sync="queryUsername"
                :max-results="10"
                @update-existing-options="
                  (query) => emit('update-search-result-users', query)
                "
              ></OmegaupCommonTypeahead>
            </div>
            <button
              class="btn btn-primary mb-1"
              @click.prevent="
                emit('go-to-page', 1, getStatus(), getQuery(), selectColumn)
              "
            >
              {{ T.wordsSearch }}
            </button>
          </div>
        </form>
      </div>
      <div class="card-body">
        <a v-if="isAdmin" href="/group/omegaup:quality-reviewer/edit/#members">
          {{ T.addUsersToReviewerGroup }}
        </a>
        <div v-if="!myView" class="pull-right">
          <label>
            <input
              v-model="showAll"
              type="checkbox"
              @change="
                emit('go-to-page', 1, getStatus(), getQuery(), selectColumn)
              "
            />
            {{ T.qualityNominationShowAll }}
          </label>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr class="text-nowrap">
              <th>
                {{ T.wordsAlias }}
                <OmegaupCommonSortControls
                  ref="sortControlByTitle"
                  column="title"
                  :sort-order="sortOrder"
                  :column-name="columnName"
                  @apply-filter="onApplyFilter"
                ></OmegaupCommonSortControls>
              </th>
              <th v-if="!myView">{{ T.qualityNominationNominatedBy }}</th>
              <th>{{ T.qualityNominationCreatedBy }}</th>
              <th>
                {{ T.wordsSubmissionDate }}
                <OmegaupCommonSortControls
                  ref="sortControlByTime"
                  column="time"
                  :sort-order="sortOrder"
                  :column-name="columnName"
                  @apply-filter="onApplyFilter"
                ></OmegaupCommonSortControls>
              </th>
              <th v-if="!myView" data-name="reason">{{ T.wordsReason }}</th>
              <th class="text-center">{{ T.wordsStatus }}</th>
              <th><!-- view button --></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="nomination in orderedNominations"
              :key="`nomination-${nomination.qualitynomination_id}`"
            >
              <td class="align-middle">
                <a :href="problemUrl(nomination.problem.alias)">{{
                  nomination.problem.title
                }}</a>
              </td>
              <td v-if="!myView" class="align-middle">
                <a :href="userUrl(nomination.nominator.username)">{{
                  nomination.nominator.username
                }}</a>
              </td>
              <td class="align-middle">
                <a :href="userUrl(nomination.author.username)">{{
                  nomination.author.username
                }}</a>
              </td>
              <td class="align-middle">
                {{ nomination.time.toLocaleDateString(T.locale) }}
              </td>
              <td v-if="!myView" class="align-middle">
                {{ nomination.contents.reason }}
              </td>
              <td class="text-center align-middle">{{ nomination.status }}</td>
              <td class="align-middle">
                <a
                  :href="nominationDetailsUrl(nomination.qualitynomination_id)"
                  :class="nomination.problem.title"
                  >{{ T.wordsDetails }}</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <OmegaupCommonPaginator
        :pager-items="pagerItems"
        class="mb-3"
        @page-changed="
          (page) =>
            emit('go-to-page', page, getStatus(), getQuery(), selectColumn)
        "
      ></OmegaupCommonPaginator>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import * as ui from '../../ui';
import OmegaupCommonPaginator from '../common/Paginator.vue';
import { types } from '../../api_types';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';
import OmegaupCommonSortControls from '../common/SortControls.vue';

const props = defineProps<{
  pages: number;
  length: number;
  myView: boolean;
  nominations: types.NominationListItem[];
  pagerItems: types.PageItem[];
  isAdmin: boolean;
  searchResultUsers: types.ListItem[];
  searchResultProblems: types.ListItem[];
}>();

const emit = defineEmits<{
  (
    e: 'go-to-page',
    page: number,
    status: string,
    query: null | string,
    column: string,
  ): void;
  (e: 'update-search-result-problems', query: string): void;
  (e: 'update-search-result-users', query: string): void;
}>();

const showAll = ref(true);

const sortOrder = ref<omegaup.SortOrder>(omegaup.SortOrder.Ascending);
const columnName = ref('title');

const queryProblem = ref<null | types.ListItem>(null);
const queryUsername = ref<null | types.ListItem>(null);
const selectColumn = ref('');
const columns = {
  problem_alias: T.wordsProblem,
  nominator_username: T.qualityNominationNominatedBy,
  author_username: T.qualityNominationCreatedBy,
};

const orderedNominations = computed((): types.NominationListItem[] => {
  const order = sortOrder.value === omegaup.SortOrder.Ascending ? 1 : -1;

  switch (columnName.value) {
    case 'time':
      return props.nominations.sort(
        (a, b) => order * (a.time.getTime() - b.time.getTime()),
      );
    case 'title':
    default:
      return props.nominations.sort(
        (a, b) => order * a.problem.title.localeCompare(b.problem.title),
      );
  }
});

watch(selectColumn, () => {
  queryProblem.value = null;
  queryUsername.value = null;
});

function getQuery(): null | string {
  if (
    selectColumn.value == 'nominator_username' ||
    selectColumn.value == 'author_username'
  ) {
    return queryUsername.value?.key ?? null;
  } else {
    return queryProblem.value?.key ?? null;
  }
}

function getStatus(): string {
  if (showAll.value) {
    return 'all';
  } else {
    return 'open';
  }
}

function problemUrl(problemAlias: string): string {
  return `/arena/problem/${problemAlias}/`;
}

function userUrl(username: string): string {
  return `/profile/${username}/`;
}

function nominationDetailsUrl(nominationId: number): string {
  return `/nomination/${nominationId}/`;
}

function onApplyFilter(newColumnName: string, newSortOrder: string): void {
  columnName.value = newColumnName;

  sortOrder.value =
    newSortOrder === omegaup.SortOrder.Ascending
      ? omegaup.SortOrder.Ascending
      : omegaup.SortOrder.Descending;
}
</script>

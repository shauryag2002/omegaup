<template>
  <div class="py-0 px-0 mx-auto my-0">
    <h2 class="text-center mb-4">
      <span v-if="rank !== 0" class="rank-number">#{{ rank }} </span>
      {{ name }}
    </h2>
    <div class="row mb-3">
      <div class="col-md-4">
        <ul v-if="country" class="list-group mb-3">
          <li class="list-group-item">
            <strong>{{ T.wordsCountry }}:</strong>
            {{ country.name }}
            <omegaup-country-flag :country="country.id"></omegaup-country-flag>
          </li>
          <li v-if="stateName" class="list-group-item">
            <strong>{{ T.profileState }}:</strong> {{ stateName }}
          </li>
        </ul>
        <omegaup-table-paginator
          :column-names="columnNames"
          :items="codersOfTheMonth"
          :items-per-page="3"
          :title="T.codersOfTheMonth"
        >
        </omegaup-table-paginator>
      </div>
      <div class="col-md-8 pl-0">
        <div class="card h-100">
          <div class="card-body">
            <highcharts :options="chartOptions"></highcharts>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <omegaup-table-paginator
          :column-names="userColumnNames"
          :show-page-offset="true"
          :items="schoolUsers"
          :items-per-page="30"
          :title="T.schoolUsers"
          :sort-options="sortOptions"
          @sort-option-change="updateUsers"
        >
          <template #item-data="slotProps">
            <OmegaupUsername
              :username="slotProps.item.toString()"
              :classname="slotProps.item.classname"
              :linkify="true"
            ></OmegaupUsername>
          </template>
        </omegaup-table-paginator>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import * as ui from '../../ui';
import CountryFlag from '../CountryFlag.vue';
import common_GridPaginator from '../common/GridPaginator.vue';
import common_TablePaginator from '../common/TablePaginator.vue';
import OmegaupUsername from '../user/Username.vue';
import { types } from '../../api_types';
import { SchoolCoderOfTheMonth, SchoolUser } from '../../linkable_resource';
import { Chart } from 'highcharts-vue';

const props = defineProps<{
  name: string;
  rank: number;
  country: omegaup.Country;
  stateName: string;
  monthlySolvedProblemsCount: types.SchoolProblemsSolved[];
  users: SchoolUser[];
  codersOfTheMonth: SchoolCoderOfTheMonth;
  chartOptions: Chart;
}>();

const sortBy = ref('solved_problems');
const sortOptions = [
  {
    title: T.profileSolvedProblems,
    value: 'solved_problems',
  },
  {
    title: T.profileCreatedProblems,
    value: 'created_problems',
  },
  {
    title: T.profileOrganizedContests,
    value: 'organized_contests',
  },
];

const columnNames = computed<Array<{ name: string; style: string }>>(() => [
  { name: T.codersOfTheMonthUser, style: '' },
  { name: T.codersOfTheMonthDate, style: 'text-right' },
]);

const userColumnNames = computed<Array<{ name: string; style: string }>>(() => [
  { name: T.profileContestsTablePlace, style: 'col-1 text-left' },
  { name: T.username, style: 'text-center' },
  { name: sortByTableTitle.value, style: 'text-right' },
]);

const schoolUsers = computed<SchoolUser[]>(() => {
  return [...props.users].sort((userA, userB) => {
    if (userA.getDisplayValue() < userB.getDisplayValue()) return 1;
    if (userA.getDisplayValue() > userB.getDisplayValue()) return -1;
    return 0;
  });
});

const sortByTableTitle = computed<string>(() => {
  switch (sortBy.value) {
    case 'solved_problems':
      return T.profileSolvedProblems;
    case 'created_problems':
      return T.profileCreatedProblems;
    case 'organized_contests':
      return T.profileOrganizedContests;
    default:
      return '';
  }
});

function updateUsers(newSortBy: string): void {
  props.users.forEach((user) => (user.displayField = newSortBy));
  sortBy.value = newSortBy;
}
</script>

<style scoped lang="scss">
.list-group-item strong {
  display: inline-block;
  width: 60px;
}

.rank-number {
  color: gray;
}

h2 {
  font-size: 1.8rem;
  letter-spacing: 0.01rem;
}
</style>

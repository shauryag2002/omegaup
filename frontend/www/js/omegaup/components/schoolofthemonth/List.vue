<template>
  <div class="card ranking-width">
    <ul class="nav nav-tabs justify-content-arround">
      <li class="nav-item">
        <a
          href="#"
          class="nav-link"
          data-toggle="tab"
          role="tab"
          aria-controls="allSchoolsOfTheMonth"
          :class="{ active: selectedTab === 'allSchoolsOfTheMonth' }"
          :aria-selected="selectedTab === 'allSchoolsOfTheMonth'"
          @click="selectedTab = 'allSchoolsOfTheMonth'"
        >
          {{ T.schoolsOfTheMonth }}
        </a>
      </li>
      <li class="nav-item">
        <a
          href="#"
          class="nav-link"
          data-toggle="tab"
          role="tab"
          aria-controls="schoolsOfPreviousMonth"
          :class="{ active: selectedTab === 'schoolsOfPreviousMonth' }"
          :aria-selected="selectedTab === 'schoolsOfPreviousMonth'"
          @click="selectedTab = 'schoolsOfPreviousMonth'"
        >
          {{ T.schoolsOfTheMonthRank }}
        </a>
      </li>
      <li class="nav-item">
        <a
          href="#"
          class="nav-link"
          data-toggle="tab"
          role="tab"
          aria-controls="candidatesToSchoolOfTheMonth"
          :class="{
            active: selectedTab === 'candidatesToSchoolOfTheMonth',
          }"
          :aria-selected="selectedTab === 'candidatesToSchoolOfTheMonth'"
          @click="selectedTab = 'candidatesToSchoolOfTheMonth'"
        >
          {{ T.schoolsOfTheMonthCandidates }}
        </a>
      </li>
    </ul>
    <div v-if="isDisabled" class="system-in-maintainance m-5 text-center">
      <OmegaupMarkdown :markdown="T.schoolOfTheMonthSystemInMaintainance" />
      <font-awesome-icon :icon="['fas', 'cogs']" />
    </div>
    <table v-else class="table table-striped table-hover">
      <thead>
        <tr>
          <th scope="col" class="text-center">{{ T.wordsCountryRegion }}</th>
          <th scope="col" class="text-center">{{ T.wordsSchool }}</th>
          <th
            v-if="selectedTab === 'allSchoolsOfTheMonth'"
            scope="col"
            class="text-center"
          >
            {{ T.wordsDate }}
          </th>
          <template v-else-if="selectedTab === 'candidatesToSchoolOfTheMonth'">
            <th scope="col" class="text-center">
              {{ T.rankScore }}
            </th>
            <th v-if="isMentor" scope="col" class="text-center">
              {{ T.wordsActions }}
            </th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(school, index) in visibleSchools" :key="index">
          <td class="text-center">
            <OmegaupCountryFlag :country="school.country_id" />
          </td>
          <td class="text-center">
            <a :href="`/schools/profile/${school.school_id}/`">{{
              school.name
            }}</a>
          </td>
          <td v-if="selectedTab === 'allSchoolsOfTheMonth'" class="text-center">
            {{ school.time }}
          </td>
          <template v-else-if="selectedTab === 'candidatesToSchoolOfTheMonth'">
            <td class="text-center">
              {{ school.score }}
            </td>
            <td v-if="isMentor" class="text-center">
              <button
                v-if="canChooseSchool && !schoolIsSelected"
                class="btn btn-sm btn-primary"
                @click="$emit('select-school', school.school_id)"
              >
                {{ T.schoolOfTheMonthChooseAsSchool }}
              </button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import OmegaupCountryFlag from '../CountryFlag.vue';
import OmegaupMarkdown from '../Markdown.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
library.add(faCogs);

const props = withDefaults(
  defineProps<{
    schoolsOfPreviousMonths: omegaup.SchoolOfTheMonth[];
    schoolsOfPreviousMonth: omegaup.SchoolOfTheMonth[];
    candidatesToSchoolOfTheMonth: omegaup.SchoolOfTheMonth[];
    isMentor: boolean;
    canChooseSchool: boolean;
    schoolIsSelected: boolean;
    isDisabled?: boolean;
  }>(),
  {
    isDisabled: true,
  },
);

defineEmits<{
  (e: 'select-school', schoolId: number): void;
}>();

const selectedTab = ref('allSchoolsOfTheMonth');

const visibleSchools = computed((): omegaup.SchoolOfTheMonth[] => {
  switch (selectedTab.value) {
    case 'allSchoolsOfTheMonth':
    default:
      return props.schoolsOfPreviousMonths;
    case 'schoolsOfPreviousMonth':
      return props.schoolsOfPreviousMonth;
    case 'candidatesToSchoolOfTheMonth':
      return props.candidatesToSchoolOfTheMonth;
  }
});
</script>

<style scoped>
.nav-link.active,
.nav-link:hover {
  border: none;
  border-left: 0.0625rem solid #dee2e6;
  border-right: 0.0625rem solid #dee2e6;
  border-top-left-radius: 0rem;
  border-top-right-radius: 0rem;
}
.nav .nav-tabs {
  border-bottom: 0rem;
}

.nav-link {
  font-weight: medium;
  letter-spacing: 0.022rem;
  padding: 0.65rem 1rem;
}
.ranking-width {
  max-width: 55rem;
  margin: 0 auto;
}
.system-in-maintainance {
  font-size: 180%;
  color: var(--general-in-maintainance-color);
}
</style>

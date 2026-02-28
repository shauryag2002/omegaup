<template>
  <div class="card ranking-width">
    <ul class="nav nav-tabs justify-content-arround" role="tablist">
      <li v-for="tab in availableTabs" :key="tab.id" class="nav-item">
        <a
          :href="getTabName(tab)"
          class="nav-link"
          data-toggle="tab"
          role="tab"
          :aria-controls="tab.id"
          :class="{ active: currentSelectedTab === tab.id }"
          :aria-selected="currentSelectedTab === tab.id"
          @click="getSelectedTab(tab)"
        >
          {{ tab.title }}
        </a>
      </li>
    </ul>
    <component
      :is="currentTabComponent"
      class="tab"
      :coders="visibleCoders"
      :is-mentor="isMentor"
      :can-choose-coder="canChooseCoder && !coderIsSelected"
    >
      <template #button-select-coder="{ coder }">
        <td
          v-if="currentSelectedTab == 'candidatesToCoderOfTheMonth' && isMentor"
          class="text-center align-middle"
        >
          <button
            v-if="canChooseCoder && !coderIsSelected"
            class="btn btn-sm btn-primary"
            @click="$emit('select-coder', coder.username, category)"
          >
            {{
              category == 'all'
                ? T.coderOfTheMonthChooseAsCoder
                : T.coderOfTheMonthFemaleChooseAsCoder
            }}
          </button>
        </td>
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component as VueComponent } from 'vue';
import T from '../../lang';
import OmegaupCodersList from './CodersList.vue';
import OmegaupTopCodersList from './TopCodersList.vue';
import OmegaupCandidatesList from './CandidatesList.vue';
import { types } from '../../api_types';

const props = defineProps<{
  codersOfCurrentMonth: types.CoderOfTheMonthList[];
  codersOfPreviousMonth: types.CoderOfTheMonthList[];
  candidatesToCoderOfTheMonth: types.CoderOfTheMonthList[];
  canChooseCoder: boolean;
  coderIsSelected: boolean;
  isMentor: boolean;
  category: string;
  selectedTab: string;
}>();

defineEmits<{
  (e: 'select-coder', username: string, category: string): void;
}>();

const currentSelectedTab = ref(props.selectedTab);

const componentMap: Record<string, VueComponent> = {
  codersOfTheMonth: OmegaupCodersList,
  codersOfPreviousMonth: OmegaupTopCodersList,
  candidatesToCoderOfTheMonth: OmegaupCandidatesList,
};

const availableTabs = computed((): { id: string; title: string }[] => {
  return [
    {
      id: 'codersOfTheMonth',
      title:
        props.category === 'all'
          ? T.codersOfTheMonth
          : T.codersOfTheMonthFemale,
    },
    {
      id: 'codersOfPreviousMonth',
      title:
        props.category === 'all'
          ? T.codersOfTheMonthRank
          : T.codersOfTheMonthFemaleRank,
    },
    {
      id: 'candidatesToCoderOfTheMonth',
      title:
        props.category === 'all'
          ? T.codersOfTheMonthListCandidate
          : T.codersOfTheMonthFemaleListCandidate,
    },
  ];
});

const visibleCoders = computed((): types.CoderOfTheMonthList[] => {
  switch (currentSelectedTab.value) {
    case 'codersOfTheMonth':
    default:
      return props.codersOfCurrentMonth;
    case 'codersOfPreviousMonth':
      return props.codersOfPreviousMonth;
    case 'candidatesToCoderOfTheMonth':
      return props.candidatesToCoderOfTheMonth;
  }
});

const currentTabComponent = computed((): VueComponent => {
  return componentMap[currentSelectedTab.value] ?? OmegaupCodersList;
});

function getSelectedTab(tab: { id: string; title: string }): void {
  currentSelectedTab.value = tab.id;
  window.location.hash = tab.id;
}

function getTabName(tab: { id: string; title: string }): string {
  return `#${tab.id}`;
}
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
</style>

<template>
  <div>
    <div class="row mb-2 justify-content-center">
      <h2 class="text-center mb-4 col-md-7">{{ T.collectionTitle }}</h2>
    </div>
    <div class="card panel panel-default">
      <div
        class="card-header panel-heading d-flex justify-content-between align-items-center"
      >
        <h5 class="card-title panel-title mb-0">
          {{ T.problemCollectionEducationLevel }}
        </h5>
        <a class="btn btn-primary" href="/problem/" data-nav-problems-all>{{
          T.navAllProblems
        }}</a>
      </div>
      <div class="card-body panel-body">
        <div class="container-fluid px-0">
          <div class="row d-flex justify-content-center">
            <OmegaupProblemCollection
              v-for="(collection, idx) in problemCount"
              :key="idx"
              :title="getName(collection.name)"
              class="educational-level-card"
            >
              <template #icon>
                <FontAwesomeIcon
                  :icon="['fas', getProblemLevelIcon(collection.name)]"
                />
              </template>
              <template #problem-count>
                <p class="card-text">
                  {{
                    ui.formatString(T.problemCollectionProblemCount, {
                      count: collection.problems_per_tag,
                    })
                  }}
                </p>
              </template>
              <template #button>
                <a
                  class="btn btn-primary"
                  :class="{ disabled: collection.problems_per_tag == 0 }"
                  :href="`/problem/collection/${encodeURIComponent(
                    collection.name,
                  )}/`"
                  >{{ T.problemcollectionViewProblems }}</a
                >
              </template>
            </OmegaupProblemCollection>
          </div>
        </div>
      </div>
    </div>
    <div class="card mt-4 panel panel-default">
      <div class="card-header panel-heading">
        <h5 class="card-title panel-title mb-0">
          {{ T.problemCollectionOthers }}
        </h5>
      </div>
      <div class="card-body panel-body">
        <div class="container-fluid">
          <div class="row d-flex justify-content-center">
            <OmegaupProblemCollection :title="T.problemCollectionAuthors">
              <template #icon>
                <FontAwesomeIcon class="mt-3" :icon="['fas', 'users']" />
              </template>
              <template #button>
                <a class="btn btn-primary" href="/problem/collection/author/">{{
                  T.problemcollectionViewProblems
                }}</a>
              </template>
            </OmegaupProblemCollection>
            <OmegaupProblemCollection
              :title="T.problemCollectionRandomLanguageProblem"
            >
              <template #icon>
                <FontAwesomeIcon class="mt-3" :icon="['fas', 'cogs']" />
              </template>
              <template #button>
                <a class="btn btn-primary" href="/problem/random/language/">{{
                  T.problemcollectionViewProblems
                }}</a>
              </template>
            </OmegaupProblemCollection>
            <OmegaupProblemCollection
              :title="T.problemCollectionRandomKarelProblem"
            >
              <template #icon>
                <FontAwesomeIcon class="mt-3" :icon="['fas', 'random']" />
              </template>
              <template #button>
                <a class="btn btn-primary" href="/problem/random/karel/">{{
                  T.problemcollectionViewProblems
                }}</a>
              </template>
            </OmegaupProblemCollection>
            <OmegaupProblemCollection :title="T.problemCollectionSearchProblem">
              <template #icon>
                <FontAwesomeIcon class="mt-3" :icon="['fas', 'search']" />
              </template>
              <template #button>
                <button
                  class="btn btn-primary"
                  @click="showFinderWizard = true"
                >
                  {{ T.wordsSearch }}
                </button>
              </template>
            </OmegaupProblemCollection>
            <!-- TODO: Migrar el problem finder a BS4 (solo para eliminar algunos estilos) -->
            <OmegaupProblemFinderWizard
              v-show="showFinderWizard"
              :possible-tags="allTags"
              @close="showFinderWizard = false"
              @search-problems="emit('search-problems', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import * as ui from '../../ui';
import OmegaupProblemCollection from './CollectionProblem.vue';
import OmegaupProblemFinderWizard from './FinderWizard.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faRobot,
  faLaptopCode,
  faSquareRootAlt,
  faProjectDiagram,
  faSitemap,
  faTrophy,
  faCode,
  faUsers,
  faRandom,
  faSearch,
  faCogs,
} from '@fortawesome/free-solid-svg-icons';
library.add(
  faRobot,
  faLaptopCode,
  faSquareRootAlt,
  faProjectDiagram,
  faSitemap,
  faTrophy,
  faCode,
  faUsers,
  faRandom,
  faSearch,
  faCogs,
);

const problemLevelIcons: { [key: string]: string } = {
  problemLevelBasicKarel: 'robot',
  problemLevelBasicIntroductionToProgramming: 'laptop-code',
  problemLevelIntermediateMathsInProgramming: 'square-root-alt',
  problemLevelIntermediateDataStructuresAndAlgorithms: 'project-diagram',
  problemLevelIntermediateAnalysisAndDesignOfAlgorithms: 'sitemap',
  problemLevelAdvancedCompetitiveProgramming: 'trophy',
  problemLevelAdvancedSpecializedTopics: 'code',
  problemCollectionAuthors: 'users',
  problemCollectionRandomProblem: 'random',
  problemCollectionSearchProblem: 'search',
};

defineProps<{
  levelTags: string[];
  problemCount: { name: string; problems_per_tag: number }[];
  allTags: types.Tag[];
}>();

const emit = defineEmits<{
  (e: 'search-problems', value: unknown): void;
}>();

const showFinderWizard = ref(false);

function getProblemLevelIcon(problemLevel: string): string {
  if (Object.prototype.hasOwnProperty.call(problemLevelIcons, problemLevel))
    return problemLevelIcons[problemLevel];
  return 'icon';
}

function getName(alias: string): string {
  return T[alias];
}
</script>

<style>
.educational-level-card[omegaup-collection-problem] {
  width: 12.5rem !important;
  height: 12.5rem !important;
  position: relative;
  transition: box-shadow 0.3s ease-in-out !important;
}

.educational-level-card[omegaup-collection-problem]:hover {
  box-shadow: 0 0 0.625rem rgba(103, 141, 215, 0.5) !important;
}

/* Apply same hover effect to other collection cards */
[omegaup-collection-problem] {
  transition: box-shadow 0.3s ease-in-out !important;
}

[omegaup-collection-problem]:hover {
  box-shadow: 0 0 0.625rem rgba(103, 141, 215, 0.5) !important;
}

.educational-level-card[omegaup-collection-problem] .card-body {
  min-height: 12.5rem !important;
  height: 12.5rem !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 1rem !important;
}

/* Adjust spacing for problem count to not overlap with button */
.educational-level-card[omegaup-collection-problem] .card-text {
  margin-bottom: 0 !important;
}

.educational-level-card[omegaup-collection-problem] .mt-1 {
  margin-top: auto !important;
}
</style>

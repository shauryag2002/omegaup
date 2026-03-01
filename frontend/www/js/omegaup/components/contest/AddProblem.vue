<template>
  <div class="card problems-container">
    <div class="card-body">
      <form class="form" @submit.prevent="onSubmit">
        <div class="row">
          <div class="form-group col-md-12">
            <label class="font-weight-bold">{{ T.wordsProblem }}</label>
            <input
              v-if="isUpdate"
              :value="title"
              class="form-control"
              disabled="disabled"
            />
            <div v-else class="input-group w-100">
              <div class="input-group-prepend w-25">
                <select v-model="selectedSearchType" class="custom-select">
                  <option
                    v-for="searchType in availableSearchTypes"
                    :key="searchType.key"
                    :value="searchType.key"
                    :selected="selectedSearchType === searchType.key"
                  >
                    {{ searchType.value }}
                  </option>
                </select>
              </div>
              <OmegaupCommonTypeahead
                class="w-75"
                :existing-options="searchResultProblems"
                :activation-threshold="2"
                v-model:value="alias"
                @update-existing-options="
                  (query) =>
                    emit('update-search-result-problems', {
                      query,
                      searchType: selectedSearchType,
                    })
                "
              >
              </OmegaupCommonTypeahead>
            </div>
          </div>
        </div>
        <div v-if="alias" class="row">
          <div class="form-group col-md-6">
            <label for="use-latest-version" class="font-weight-bold"
              >{{ T.contestAddproblemChooseVersion }}
            </label>
            <OmegaupRadioSwitch
              v-model:value="useLatestVersion"
              :selected-value="useLatestVersion"
              :name="'use-latest-version'"
              :text-for-true="T.contestAddproblemLatestVersion"
              :text-for-false="T.contestAddproblemOtherVersion"
            ></OmegaupRadioSwitch>
          </div>
          <div class="form-group col-md-3">
            <label
              v-tooltip="T.contestAddproblemProblemPoints"
              class="font-weight-bold"
              >{{ T.wordsPoints }}
              <FontAwesomeIcon icon="info-circle" />
            </label>
            <input
              v-model="points"
              class="form-control problem-points"
              size="3"
              type="number"
            />
          </div>
          <div class="form-group col-md-3">
            <label
              v-tooltip="T.contestAddproblemContestOrder"
              class="font-weight-bold"
              >{{ T.contestAddproblemProblemOrder }}
              <FontAwesomeIcon icon="info-circle" />
            </label>
            <input
              v-model="order"
              class="form-control"
              max="100"
              size="2"
              type="number"
            />
          </div>
        </div>
        <OmegaupProblemVersions
          v-if="!useLatestVersion && alias !== null"
          v-model="selectedRevision"
          :log="versionLog"
          :published-revision="publishedRevision"
          :show-footer="false"
          @runs-diff="onRunsDiff"
        ></OmegaupProblemVersions>
        <div class="form-group">
          <button
            class="btn btn-primary add-problem"
            type="submit"
            :disabled="addProblemButtonDisabled"
            @click.prevent="onAddProblem"
          >
            {{ addProblemButtonLabel }}
          </button>
          <button
            class="btn btn-secondary mx-3"
            type="reset"
            :disabled="addProblemButtonDisabled"
            @click.prevent="alias = null"
          >
            {{ T.wordsCancel }}
          </button>
        </div>
      </form>
    </div>
    <table class="table table-striped mb-0">
      <thead>
        <tr>
          <th class="text-center">{{ T.contestAddproblemContestOrder }}</th>
          <th class="text-center">{{ T.contestAddproblemProblemName }}</th>
          <th class="text-center">{{ T.contestAddproblemProblemPoints }}</th>
          <th class="text-center">{{ T.wordsActions }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="problem in problems" :key="problem.alias">
          <td class="text-center">{{ problem.order }}</td>
          <td>
            <a :href="`/arena/problem/${problem.alias}/`">{{
              problem.title
            }}</a>
          </td>
          <td class="text-right">{{ problem.points }}</td>
          <td class="text-center">
            <button
              v-tooltip="T.problemEditFormUpdateProblem"
              :data-update-problem="problem.alias"
              class="btn btn-link"
              @click="onEdit(problem)"
            >
              <FontAwesomeIcon icon="edit" />
            </button>
            <button
              v-if="problem.has_submissions"
              v-tooltip="T.cannotRemoveProblemWithSubmissions"
              :data-remove-problem-disabled="problem.alias"
              class="btn btn-link"
              data-toggle="tooltip"
              data-placement="bottom"
            >
              <FontAwesomeIcon icon="trash" class="disabled text-secondary" />
            </button>
            <button
              v-else
              v-tooltip="T.contestAddproblemProblemRemove"
              :data-remove-problem="problem.alias"
              class="btn btn-link"
              @click="onRemove(problem)"
            >
              <FontAwesomeIcon icon="trash" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
export enum SearchTypes {
  ALL = 'all',
  TITLE = 'title',
  ALIAS = 'alias',
  ID = 'problem_id',
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';

import OmegaupProblemVersions from '../problem/Versions.vue';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';
import OmegaupRadioSwitch from '../RadioSwitch.vue';
import 'v-tooltip/dist/v-tooltip.css';
import { VTooltip as vTooltip } from 'v-tooltip';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

interface MappedProblems {
  [problemAlias: string]: {
    problem: types.ProblemsetProblemWithVersions;
    commitVersions: { [commit: string]: types.ProblemVersion };
  };
}

const props = defineProps<{
  contestAlias: string;
  initialPoints: number;
  initialProblems: types.ProblemsetProblemWithVersions[];
  searchResultProblems: types.ListItem[];
}>();

const emit = defineEmits<{
  (
    e: 'add-problem',
    request: { problem: Record<string, unknown>; isUpdate: boolean },
  ): void;
  (
    e: 'update-search-result-problems',
    request: { query: string; searchType: string },
  ): void;
  (
    e: 'get-versions',
    request: {
      target: Record<string, unknown>;
      request: { problemAlias: string | undefined };
    },
  ): void;
  (e: 'remove-problem', alias: string): void;
  (
    e: 'runs-diff',
    alias: string | undefined,
    versions: types.ProblemVersion[],
    selectedCommit: types.ProblemVersion,
  ): void;
}>();

const alias = ref<null | types.ListItem>(null);
const title = ref<null | string>(null);
const points = ref(props.initialPoints);
const order = ref(props.initialProblems.length + 1);
const problems = ref(props.initialProblems);
const versionLog = ref<types.ProblemVersion[]>([]);
const useLatestVersion = ref(true);
const publishedRevision = ref<null | types.ProblemVersion>(null);
const selectedRevision = ref<null | types.ProblemVersion>(null);
const selectedSearchType = ref<SearchTypes>(SearchTypes.ALL);
const availableSearchTypes: types.ListItem[] = [
  { key: SearchTypes.ALL, value: T.contestEditAddProblemSearchByAll },
  { key: SearchTypes.ALIAS, value: T.contestEditAddProblemSearchByAlias },
  { key: SearchTypes.TITLE, value: T.contestEditAddProblemSearchByTitle },
  { key: SearchTypes.ID, value: T.contestEditAddProblemSearchById },
];

const problemMapping = computed(
  (): MappedProblems => {
    let mapping: MappedProblems = {};
    for (const problem of problems.value) {
      const commitVersions: { [commit: string]: types.ProblemVersion } = {};
      for (const version of problem.versions.log) {
        commitVersions[version.commit] = version;
      }
      mapping[problem.alias] = {
        problem,
        commitVersions,
      };
    }
    return mapping;
  },
);

const isUpdate = computed((): boolean => {
  if (!alias.value) return false;
  return !!problemMapping.value[alias.value.key];
});

const addProblemButtonLabel = computed((): string => {
  if (isUpdate.value) {
    return T.wordsUpdateProblem;
  }
  return T.wordsAddProblem;
});

const addProblemButtonDisabled = computed((): boolean => {
  if (useLatestVersion.value) return alias.value === null;
  return !selectedRevision.value;
});

function onGetVersions(problemAlias: string): void {
  const mapping = problemMapping.value[problemAlias];
  versionLog.value = mapping.problem.versions.log;
  const published = mapping.problem.commit;
  const revision = mapping.commitVersions[published];
  selectedRevision.value = revision;
  publishedRevision.value = revision;
  useLatestVersion.value = false;
}

function onSubmit(): void {
  if (!alias.value) return;
  onAddProblem();
}

function onAddProblem(): void {
  emit('add-problem', {
    problem: {
      order: order.value,
      alias: alias.value?.key,
      points: points.value,
      commit: !useLatestVersion.value
        ? selectedRevision.value?.commit
        : undefined,
    },
    isUpdate: isUpdate.value,
  });
  alias.value = null;
  title.value = null;
}

function onEdit(problem: types.ProblemsetProblemWithVersions): void {
  title.value = problem.title;
  alias.value = { key: problem.alias, value: problem.title };
  points.value = problem.points;
  order.value = problem.order;
}

function onRemove(problem: types.ProblemsetProblemWithVersions): void {
  emit('remove-problem', problem.alias);
}

function onRunsDiff(
  versions: types.ProblemVersion[],
  selectedCommit: types.ProblemVersion,
): void {
  let found = false;
  for (const problem of problems.value) {
    if (alias.value?.key === problem.alias) {
      found = true;
      break;
    }
  }
  if (!found) {
    return;
  }
  emit('runs-diff', alias.value?.key, versions, selectedCommit);
}

watch(
  () => props.initialProblems,
  (newValue) => {
    problems.value = newValue;
    order.value = newValue.length + 1;
  },
);

watch(alias, (newProblemAlias) => {
  if (!newProblemAlias) {
    versionLog.value = [];
    selectedRevision.value = null;
    publishedRevision.value = null;
    return;
  }
  if (isUpdate.value) {
    onGetVersions(newProblemAlias.key);
    return;
  }
  emit('get-versions', {
    target: {},
    request: { problemAlias: alias.value?.key },
  });
});
</script>

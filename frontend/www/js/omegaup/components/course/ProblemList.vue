<template>
  <div class="card" data-course-problemlist>
    <div class="card-header">
      <h5>
        {{ addCardHeaderTitleLabel }}
      </h5>
      <span>{{ addCardHeaderDescLabel }}</span>
    </div>
    <div class="card-body">
      <div v-if="problems.length == 0" class="empty-table-message">
        {{ emptyTableLabel }}
      </div>
      <div v-else>
        <table class="table table-striped">
          <thead>
            <tr>
              <th class="text-center">{{ T.contestAddproblemProblemOrder }}</th>
              <th class="text-center">{{ problemTableHeaderLabel }}</th>
              <th class="text-center">{{ pointsTableHeaderLabel }}</th>
              <th class="text-center">{{ T.courseExtraPointsProblem }}</th>
              <th class="text-center">
                {{ T.wordsActions }}
              </th>
            </tr>
          </thead>
          <tbody v-sortable="{ onUpdate: sort }">
            <tr v-for="problem in problems" :key="problem.letter">
              <td class="text-center">
                <button
                  class="btn btn-link"
                  type="button"
                  :title="reorderButtonLabel"
                >
                  <FontAwesomeIcon icon="arrows-alt" />
                </button>
              </td>
              <td class="align-middle text-center">
                <a :href="`/arena/problem/${problem.alias}/`">{{
                  problem.alias
                }}</a>
              </td>
              <td class="align-middle">{{ problem.points }}</td>
              <td class="align-middle text-center">
                {{ problem.is_extra_problem ? T.wordsYes : T.wordsNo }}
              </td>
              <td class="button-column text-center">
                <button
                  class="btn btn-link"
                  :title="T.problemEditFormUpdateProblem"
                  data-edit-problem-version
                  @click.prevent="onEditProblem(problem)"
                >
                  <FontAwesomeIcon icon="edit" />
                </button>
                <button
                  class="btn btn-link"
                  :title="removeButtonLabel"
                  @click.prevent="onRemoveProblem(assignment, problem)"
                >
                  <FontAwesomeIcon icon="trash" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <button
            class="btn btn-primary"
            :disabled="!problemsOrderChanged"
            role="button"
            @click="saveNewOrder"
          >
            {{ T.wordsSaveNewOrder }}
          </button>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <form @submit.prevent="">
        <div class="row">
          <div class="col-md-12">
            <div class="row">
              <div class="form-group col-md-5">
                <span class="faux-label">{{ problemCardFooterLabel }}</span>
                <OmegaupCommonTypeahead
                  :existing-options="searchResultProblems"
                  :activation-threshold="2"
                  :value.sync="problemAlias"
                  @update-existing-options="
                    (query) => emit('update-search-result-problems', query)
                  "
                >
                </OmegaupCommonTypeahead>
                <small class="form-text text-muted">
                  {{ addCardFooterDescLabel }}
                </small>
              </div>
              <div class="form-group col-md-2">
                <span class="faux-label">{{ T.wordsPoints }}</span>
                <input v-model="points" type="number" class="form-control" />
              </div>
              <div class="form-group col-md-5">
                <span class="faux-label"
                  >{{ T.courseExtraPointsProblemLabel }}
                  <FontAwesomeIcon
                    :title="T.courseExtraPointsProblemDesc"
                    icon="info-circle"
                  />
                </span>
                <div class="form-control">
                  <label class="radio-inline"
                    ><input
                      v-model="isExtraProblem"
                      type="radio"
                      :value="true"
                    />{{ T.wordsYes }}</label
                  >
                  <label class="radio-inline ml-3"
                    ><input
                      v-model="isExtraProblem"
                      type="radio"
                      :value="false"
                    />{{ T.wordsNo }}</label
                  >
                </div>
              </div>
              <div class="form-group col-md-5">
                <span class="faux-label">{{
                  T.contestAddproblemChooseVersion
                }}</span>
                <div class="form-control form-group">
                  <div class="form-check form-check-inline">
                    <label class="form-check-label">
                      <input
                        v-model="useLatestVersion"
                        class="form-check-input"
                        data-use-latest-version-true
                        name="use-latest-version"
                        type="radio"
                        :value="true"
                      />{{ T.contestAddproblemLatestVersion }}
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <label class="form-check-label">
                      <input
                        v-model="useLatestVersion"
                        class="form-check-input"
                        data-use-latest-version-false
                        name="use-latest-version"
                        type="radio"
                        :value="false"
                      />{{ T.contestAddproblemOtherVersion }}
                    </label>
                  </div>
                </div>
              </div>
              <OmegaupProblemVersions
                v-if="!useLatestVersion"
                v-model="selectedRevision"
                :log="versionLog"
                :published-revision="publishedRevision"
                :show-footer="false"
                @runs-diff="onRunsDiff"
              ></OmegaupProblemVersions>
            </div>
            <div class="form-group text-right">
              <button
                data-add-problem
                class="btn btn-primary mr-2"
                type="submit"
                :disabled="!problemAlias"
                @click.prevent="
                  onSaveProblem(assignment, {
                    alias: problemAlias.key,
                    points: points,
                    commit: selectedRevision.commit,
                    is_extra_problem: isExtraProblem,
                  })
                "
              >
                {{ addProblemButtonLabel }}
              </button>
              <button
                class="btn btn-secondary"
                type="reset"
                @click.prevent="reset"
              >
                {{ T.wordsCancel }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
    <!-- card-body -->
  </div>
  <!-- card -->
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { omegaup } from '../../omegaup';
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';
import OmegaupProblemVersions from '../problem/Versions.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const props = defineProps<{
  assignments: types.CourseAssignment[];
  assignmentProblems: types.ProblemsetProblem[];
  taggedProblems: omegaup.Problem[];
  selectedAssignment: types.CourseAssignment;
  searchResultProblems: types.ListItem[];
}>();

const emit = defineEmits<{
  (e: 'emit-sort', alias: string | undefined, problems: string[]): void;
  (
    e: 'save-problem',
    assignment: Partial<types.CourseAssignment>,
    problem: types.AddedProblem,
  ): void;
  (
    e: 'emit-remove-problem',
    assignment: Partial<types.CourseAssignment>,
    problem: types.AddedProblem,
  ): void;
  (
    e: 'runs-diff',
    target: any,
    versions: types.ProblemVersion[],
    selectedCommit: types.ProblemVersion,
  ): void;
  (
    e: 'change-alias',
    payload: { target: any; request: { problemAlias: string } },
  ): void;
  (e: 'emit-select-assignment', assignment: types.CourseAssignment): void;
  (e: 'emit-tags', tags: string[]): void;
  (e: 'update-search-result-problems', query: string): void;
}>();

const assignment = ref<Partial<types.CourseAssignment>>(
  props.selectedAssignment,
);
const problems = ref<types.AddedProblem[]>(props.assignmentProblems);
const difficulty = ref('intro');
const topics = ref<string[]>([]);
const taggedProblemAlias = ref('');
const problemAlias = ref<null | types.ListItem>(null);
const points = ref(100);
const showTopicsAndDifficulty = ref(false);
const problemsOrderChanged = ref(false);
const useLatestVersion = ref(true);
const isExtraProblem = ref(false);
const versionLog = ref<types.ProblemVersion[]>([]);
const publishedRevision = ref<null | types.ProblemVersion>(null);
const selectedRevision = ref<null | types.ProblemVersion>(null);

const componentProxy: Record<string, any> = {
  get versionLog() {
    return versionLog.value;
  },
  set versionLog(v: types.ProblemVersion[]) {
    versionLog.value = v;
  },
  get publishedRevision() {
    return publishedRevision.value;
  },
  set publishedRevision(v: types.ProblemVersion | null) {
    publishedRevision.value = v;
  },
  get selectedRevision() {
    return selectedRevision.value;
  },
  set selectedRevision(v: types.ProblemVersion | null) {
    selectedRevision.value = v;
  },
};

const tags = computed((): string[] => {
  const t = topics.value.slice();
  t.push(difficulty.value);
  return t;
});

const addCardHeaderTitleLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.courseAddLecturesAdd
    : T.courseAddProblemsAdd;
});

const addCardHeaderDescLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.courseAddLecturesEditAssignmentDesc
    : T.courseAddProblemsEditAssignmentDesc;
});

const emptyTableLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.courseAssignmentLecturesEmpty
    : T.courseAssignmentProblemsEmpty;
});

const problemTableHeaderLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.contestAddlectureLectureName
    : T.contestAddproblemProblemName;
});

const pointsTableHeaderLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.contestAddlectureLecturePoints
    : T.contestAddproblemProblemPoints;
});

const reorderButtonLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.courseAssignmentLectureReorder
    : T.courseAssignmentProblemReorder;
});

const removeButtonLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.courseAssignmentLectureRemove
    : T.courseAssignmentProblemRemove;
});

const problemCardFooterLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.wordsLecture
    : T.wordsProblem;
});

const addCardFooterDescLabel = computed((): string => {
  return assignment.value.assignment_type === 'lesson'
    ? T.courseAddLecturesAssignmentsDesc
    : T.courseAddProblemsAssignmentsDesc;
});

const addProblemButtonDisabled = computed((): boolean => {
  if (useLatestVersion.value) return !!problemAlias.value;
  return !selectedRevision.value;
});

const addProblemButtonLabel = computed((): string => {
  for (const problem of problems.value) {
    if (problemAlias.value?.key === problem.alias) {
      if (assignment.value.assignment_type === 'lesson') {
        return T.wordsUpdateLecture;
      }
      return T.wordsUpdateProblem;
    }
  }
  if (assignment.value.assignment_type === 'lesson') {
    return T.wordsAddLecture;
  }
  return T.wordsAddProblem;
});

function sort(event: any) {
  problems.value.splice(
    event.newIndex,
    0,
    problems.value.splice(event.oldIndex, 1)[0],
  );
  problemsOrderChanged.value = true;
}

function saveNewOrder() {
  emit(
    'emit-sort',
    assignment.value.alias,
    props.assignmentProblems.map((problem) => problem.alias),
  );
  problemsOrderChanged.value = false;
}

function onSaveProblem(
  assignmentParam: Partial<types.CourseAssignment>,
  problem: types.AddedProblem,
): void {
  emit('save-problem', assignmentParam, problem);
}

function onEditProblem(problem: types.AddedProblem): void {
  problemAlias.value = { key: problem.alias, value: problem.alias };
}

function onRemoveProblem(
  assignmentParam: Partial<types.CourseAssignment>,
  problem: types.AddedProblem,
): void {
  emit('emit-remove-problem', assignmentParam, problem);
}

function onRunsDiff(
  versions: types.ProblemVersion[],
  selectedCommit: types.ProblemVersion,
): void {
  let found = false;
  for (const problem of problems.value) {
    if (problemAlias.value?.key === problem.alias) {
      found = true;
      break;
    }
  }
  if (!found) {
    return;
  }
  emit('runs-diff', componentProxy, versions, selectedCommit);
}

function reset(): void {
  problemAlias.value = null;
  points.value = 100;
  useLatestVersion.value = true;
}

// Watchers
watch(problemAlias, (newProblemAlias: null | types.ListItem) => {
  if (!newProblemAlias) {
    versionLog.value = [];
    selectedRevision.value = publishedRevision.value;
    return;
  }
  emit('change-alias', {
    target: componentProxy,
    request: { problemAlias: newProblemAlias.key },
  });
});

watch(
  publishedRevision,
  (newPublishedRevision: types.ProblemVersion | null) => {
    if (!newPublishedRevision) {
      return;
    }
    useLatestVersion.value =
      newPublishedRevision.commit === versionLog.value[0].commit;
  },
);

watch(useLatestVersion, (newUseLatestVersion: boolean) => {
  if (!newUseLatestVersion) {
    return;
  }
  selectedRevision.value = versionLog.value[0];
});

watch(
  () => props.assignmentProblems,
  (newValue: types.AddedProblem[]) => {
    problems.value = newValue;
  },
);

watch(problems, () => {
  reset();
});

watch(assignment, (newVal) => {
  emit('emit-select-assignment', newVal as types.CourseAssignment);
});

watch(
  () => props.selectedAssignment,
  (newVal: types.CourseAssignment) => {
    assignment.value = newVal;
  },
);

watch(taggedProblemAlias, (newValue: string) => {
  problemAlias.value = { key: newValue, value: newValue };
});

watch(tags, () => {
  emit('emit-tags', tags.value);
});
</script>

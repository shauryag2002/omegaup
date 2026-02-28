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
              <th>{{ problemTableHeaderLabel }}</th>
              <th>{{ pointsTableHeaderLabel }}</th>
              <th>{{ T.contestAddproblemProblemRemove }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="problem in problems" :key="problem.alias">
              <td class="align-middle">
                <a :href="`/arena/problem/${problem.alias}/`">{{
                  problem.alias
                }}</a>
              </td>
              <td class="align-middle">{{ problem.points }}</td>
              <td class="button-column align-middle">
                <button
                  class="btn btn-link"
                  :title="removeButtonLabel"
                  @click.prevent="onRemoveProblem(problem)"
                >
                  <FontAwesomeIcon icon="trash" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-footer" data-course-add-problem>
      <form>
        <div class="row">
          <div class="col-md-12">
            <div class="row">
              <div class="form-group col-md-8">
                <label
                  >{{ problemCardFooterLabel }}
                  <OmegaupCommonTypeahead
                    :existing-options="searchResultProblems"
                    :activation-threshold="2"
                    :value.sync="problemAlias"
                    @update-existing-options="
                      (query) => emit('update-search-result-problems', query)
                    "
                  ></OmegaupCommonTypeahead>
                </label>
                <p class="help-block">
                  {{ addCardFooterDescLabel }}
                </p>
              </div>
              <div class="form-group col-md-4">
                <label
                  >{{ T.wordsPoints }}
                  <input v-model="points" type="number" class="form-control" />
                </label>
              </div>
            </div>
            <div class="form-group text-right">
              <button
                data-add-problem
                class="btn btn-primary mr-2"
                type="submit"
                :disabled="!problemAlias"
                @click.prevent="
                  onAddProblem({ alias: problemAlias.key, points: points })
                "
              >
                {{ addButtonLabel }}
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
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const props = defineProps<{
  assignments: types.CourseAssignment[];
  assignmentProblems: types.ProblemsetProblem[];
  taggedProblems: unknown[];
  selectedAssignment: types.CourseAssignment;
  searchResultProblems: types.ListItem[];
}>();

const emit = defineEmits<{
  (e: 'emit-select-assignment', assignment: types.CourseAssignment): void;
  (e: 'update-search-result-problems', query: string): void;
}>();

const assignment = ref<Partial<types.CourseAssignment>>(
  props.selectedAssignment,
);
const problems = ref<types.AddedProblem[]>(props.assignmentProblems);
const taggedProblemAlias = ref('');
const problemAlias = ref<null | types.ListItem>(null);
const points = ref(100);
const showTopicsAndDifficulty = ref(false);

const addCardHeaderTitleLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.courseAddLecturesAdd
    : T.courseAddProblemsAdd,
);

const addCardHeaderDescLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.courseAddLecturesAddAssignmentDesc
    : T.courseAddProblemsAddAssignmentDesc,
);

const emptyTableLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.courseAssignmentLecturesEmpty
    : T.courseAssignmentProblemsEmpty,
);

const problemTableHeaderLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.contestAddlectureLectureName
    : T.contestAddproblemProblemName,
);

const pointsTableHeaderLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.contestAddlectureLecturePoints
    : T.contestAddproblemProblemPoints,
);

const removeButtonLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.courseAssignmentLectureRemove
    : T.courseAssignmentProblemRemove,
);

const problemCardFooterLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.wordsLecture
    : T.wordsProblem,
);

const addCardFooterDescLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.courseAddLecturesAssignmentsDesc
    : T.courseAddProblemsAssignmentsDesc,
);

const addButtonLabel = computed(() =>
  assignment.value.assignment_type === 'lesson'
    ? T.courseEditAddLectures
    : T.courseEditAddProblems,
);

function onAddProblem(problem: types.AddedProblem): void {
  const problemAlias = { key: problem.alias, value: problem.alias };
  const currentProblem = problems.value.find(
    (problem) => problem.alias === problemAlias.key,
  );
  if (!currentProblem) {
    problems.value.push(problem);
    return;
  }
  currentProblem.points = problem.points;
}

function onRemoveProblem(problem: types.AddedProblem): void {
  const problemAlias = { key: problem.alias, value: problem.alias };
  problems.value = problems.value.filter(
    (problem) => problem.alias !== problemAlias.key,
  );
}

function reset(): void {
  problemAlias.value = null;
  points.value = 100;
}

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

defineExpose({ problems });
</script>

<style lang="scss" scoped>
.form-group > label {
  width: 100%;
}
</style>

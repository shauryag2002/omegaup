<template>
  <div v-show="show" class="omegaup-course-assignmentdetails card">
    <slot name="page-header">
      <div class="card-header">
        <h1>{{ T.wordsContentEdit }} {{ assignment.name }}</h1>
      </div>
    </slot>
    <div class="card-body">
      <form class="form schedule" @submit.prevent="onSubmit">
        <div class="row">
          <div class="form-group col-md-4">
            <label
              >{{ T.wordsTitle }}
              <input
                ref="name"
                v-model="name"
                data-course-assignment-name
                class="form-control name"
                :class="{ 'is-invalid': invalidParameterName === 'name' }"
                size="30"
                type="text"
                required
            /></label>
          </div>
          <div class="form-group col-md-4">
            <label
              >{{ T.courseNewFormShortTitleAlias }}
              <FontAwesomeIcon
                :title="T.courseAssignmentNewFormShortTitleAliasDesc"
                icon="info-circle" />
              <input
                v-model="alias"
                data-course-assignment-alias
                class="form-control alias"
                :class="{
                  'is-invalid': invalidParameterName === 'alias',
                }"
                type="text"
                :disabled="update"
                required
            /></label>
          </div>
          <div class="form-group col-md-4">
            <label
              >{{ T.wordsContentType }}
              <FontAwesomeIcon
                :title="T.courseContentNewFormTypeDesc"
                icon="info-circle"
              />
              <select
                v-model="assignmentType"
                class="form-control"
                :class="{
                  'is-invalid': invalidParameterName === 'assignment_type',
                }"
                required
                @change="onChangeSelect($event)"
              >
                <option value="lesson">
                  {{ T.wordsLesson }}
                </option>
                <option value="homework">
                  {{ T.wordsHomework }}
                </option>
                <option value="test">
                  {{ T.wordsExam }}
                </option>
              </select></label
            >
          </div>
        </div>
        <div class="row">
          <div class="form-group col-md-4">
            <label
              >{{ T.courseNewFormStartDate }}
              <FontAwesomeIcon
                :title="T.courseAssignmentNewFormStartDateDesc"
                icon="info-circle" />
              <OmegaupDatetimepicker
                v-model="startTime"
                data-course-start-date
                :enabled="!assignment.has_runs"
                :finish="finishTimeCourse"
                :start="startTimeCourse"
                :is-invalid="invalidParameterName === 'start_time'"
              ></OmegaupDatetimepicker
            ></label>
          </div>
          <div class="form-group col-md-4">
            <span class="faux-label"
              >{{ T.courseNewFormUnlimitedDuration }}
              <FontAwesomeIcon
                :title="T.courseNewFormUnlimitedDurationDesc"
                icon="info-circle"
              />
            </span>
            <div
              class="form-control container-fluid"
              :class="{
                'is-invalid': invalidParameterName === 'unlimited_duration',
              }"
            >
              <div class="form-check form-check-inline">
                <label class="form-check-label"
                  ><input
                    v-model="unlimitedDuration"
                    class="form-check-input"
                    type="radio"
                    :value="true"
                    :disabled="!unlimitedDurationCourse"
                  />{{ T.wordsYes }}</label
                >
              </div>
              <div class="form-check form-check-inline">
                <label class="form-check-label">
                  <input
                    v-model="unlimitedDuration"
                    class="form-check-input"
                    type="radio"
                    :value="false"
                    :disabled="!unlimitedDurationCourse"
                  />{{ T.wordsNo }}</label
                >
              </div>
            </div>
          </div>
          <div class="form-group col-md-4">
            <label
              >{{ T.courseNewFormEndDate }}
              <FontAwesomeIcon
                :title="T.courseAssignmentNewFormEndDateDesc"
                icon="info-circle" />
              <OmegaupDatetimepicker
                v-model="finishTime"
                data-course-end-date
                :enabled="!unlimitedDuration"
                :readonly="false"
                :finish="finishTimeCourse"
                :start="startTimeCourse"
                :is-invalid="invalidParameterName === 'finish_time'"
              ></OmegaupDatetimepicker
            ></label>
          </div>
        </div>
        <div class="row">
          <div class="form-group container-fluid">
            <label
              >{{ T.courseNewFormDescription }}
              <textarea
                v-model="description"
                data-course-assignment-description
                class="form-control"
                :class="{
                  'is-invalid': invalidParameterName === 'description',
                }"
                cols="30"
                rows="5"
                required
              ></textarea>
            </label>
          </div>
        </div>
        <template v-if="shouldAddProblems">
          <OmegaupCourseScheduledProblemList
            v-if="assignmentFormMode === AssignmentFormMode.New"
            ref="scheduledProblemListRef"
            :assignment-problems="assignmentProblems"
            :tagged-problems="taggedProblems"
            :selected-assignment="assignment"
            :search-result-problems="searchResultProblems"
            @emit-tags="(tags) => emit('tags-problems', tags)"
            @update-search-result-problems="
              (query) => emit('update-search-result-problems', query)
            "
          ></OmegaupCourseScheduledProblemList>
          <OmegaupCourseProblemList
            v-else
            :assignment-problems="assignmentProblems"
            :tagged-problems="taggedProblems"
            :selected-assignment="assignment"
            :assignment-form-mode="assignmentFormMode"
            @update:assignment-form-mode="
              (val) => emit('update:assignmentFormMode', val)
            "
            :search-result-problems="searchResultProblems"
            @update-search-result-problems="
              (query) => emit('update-search-result-problems', query)
            "
            @save-problem="
              (assignment, problem) => emit('add-problem', assignment, problem)
            "
            @emit-remove-problem="
              (assignment, problem) =>
                emit('remove-problem', assignment, problem)
            "
            @emit-select-assignment="
              (assignment) => emit('select-assignment', assignment)
            "
            @emit-sort="
              (assignmentAlias, problemsAlias) =>
                emit('sort-problems', assignmentAlias, problemsAlias)
            "
            @emit-tags="(tags) => emit('tags-problems', tags)"
            @change-alias="
              ({ request, target }) =>
                emit('get-versions', {
                  target,
                  request: {
                    ...request,
                    problemsetId: assignment.problemset_id,
                  },
                })
            "
          ></OmegaupCourseProblemList>
        </template>
        <div class="form-group text-right mt-3">
          <button
            data-schedule-assignment
            class="btn btn-primary submit mr-2"
            type="submit"
          >
            <template v-if="update">
              {{ T.courseAssignmentNewFormUpdate }}
            </template>
            <template v-else>
              {{ T.courseAssignmentNewFormSchedule }}
            </template>
          </button>
          <slot name="cancel-button">
            <button
              class="btn btn-secondary"
              type="reset"
              @click.prevent="onCancel"
            >
              {{ T.wordsBack }}
            </button>
          </slot>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { omegaup } from '../../omegaup';
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupCourseProblemList from './ProblemList.vue';
import OmegaupCourseScheduledProblemList from './ScheduledProblemList.vue';
import OmegaupDatetimepicker from '../DateTimePicker.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const AssignmentFormMode = omegaup.AssignmentFormMode;

interface UpdateParams {
  name: string;
  description: string;
  assignment_type: string;
  unlimited_duration?: boolean;
  finish_time?: number;
  start_time?: number;
  assignment: string;
  course: string;
}

interface AddParams {
  name: string;
  description: string;
  assignment_type: string;
  unlimited_duration?: boolean;
  finish_time?: number;
  start_time: number;
  alias: string;
  course_alias: string;
  problems: string;
}

const props = withDefaults(
  defineProps<{
    assignmentFormMode?: omegaup.AssignmentFormMode;
    assignment: types.CourseAssignment;
    finishTimeCourse: Date;
    startTimeCourse: Date;
    courseAlias: string;
    scheduledAssignmentProblems?: types.ProblemsetProblem[];
    assignmentProblems: types.ProblemsetProblem[];
    taggedProblems: omegaup.Problem[];
    shouldAddProblems?: boolean;
    unlimitedDurationCourse?: boolean;
    invalidParameterName?: string;
    searchResultProblems: types.ListItem[];
  }>(),
  {
    assignmentFormMode: omegaup.AssignmentFormMode.Default,
    scheduledAssignmentProblems: () => [],
    shouldAddProblems: true,
    unlimitedDurationCourse: false,
    invalidParameterName: '',
  },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'add-assignment', params: AddParams): void;
  (e: 'update-assignment', params: UpdateParams): void;
  (e: 'tags-problems', tags: string[]): void;
  (e: 'update-search-result-problems', query: string): void;
  (e: 'update:assignmentFormMode', mode: omegaup.AssignmentFormMode): void;
  (
    e: 'add-problem',
    assignment: types.CourseAssignment,
    problem: types.ProblemsetProblem,
  ): void;
  (
    e: 'remove-problem',
    assignment: types.CourseAssignment,
    problem: types.ProblemsetProblem,
  ): void;
  (e: 'select-assignment', assignment: types.CourseAssignment): void;
  (e: 'sort-problems', assignmentAlias: string, problemsAlias: string): void;
  (e: 'get-versions', payload: { target: any; request: any }): void;
}>();

const scheduledProblemListRef = ref<InstanceType<
  typeof OmegaupCourseScheduledProblemList
> | null>(null);

const alias = ref(props.assignment.alias || '');
const assignmentType = ref(props.assignment.assignment_type || 'homework');
const description = ref(props.assignment.description || '');
const name = ref(props.assignment.name || '');
const startTime = ref(props.assignment.start_time || new Date());
const finishTime = ref(props.assignment.finish_time || new Date());
const unlimitedDuration = ref(!props.assignment.finish_time);

const show = computed((): boolean => {
  switch (props.assignmentFormMode) {
    case omegaup.AssignmentFormMode.New:
      return true;
    case omegaup.AssignmentFormMode.Edit:
      return true;
    case omegaup.AssignmentFormMode.Default:
      return false;
    default:
      return false;
  }
});

const update = computed((): boolean => {
  switch (props.assignmentFormMode) {
    case omegaup.AssignmentFormMode.New:
      return false;
    case omegaup.AssignmentFormMode.Edit:
      return true;
    case omegaup.AssignmentFormMode.Default:
      return true;
    default:
      return true;
  }
});

const updateParams = computed(
  (): UpdateParams => {
    const params: UpdateParams = {
      name: name.value,
      description: description.value,
      assignment_type: assignmentType.value,
      assignment: alias.value,
      course: props.courseAlias,
    };
    if (unlimitedDuration.value) {
      params.unlimited_duration = true;
    } else {
      params.finish_time = finishTime.value.getTime() / 1000;
    }
    if (!props.assignment.has_runs) {
      params.start_time = startTime.value.getTime() / 1000;
    }
    return params;
  },
);

const addParams = computed(
  (): AddParams => {
    const params: AddParams = {
      name: name.value,
      description: description.value,
      assignment_type: assignmentType.value,
      alias: alias.value,
      course_alias: props.courseAlias,
      start_time: startTime.value.getTime() / 1000,
      problems: JSON.stringify(scheduledProblemListRef.value?.problems ?? []),
    };
    if (unlimitedDuration.value) {
      params.unlimited_duration = true;
    } else {
      params.finish_time = finishTime.value.getTime() / 1000;
    }
    return params;
  },
);

function reset(): void {
  alias.value = props.assignment.alias;
  assignmentType.value = props.assignment.assignment_type || 'homework';
  description.value = props.assignment.description;
  finishTime.value = props.assignment.finish_time || new Date();
  name.value = props.assignment.name;
  startTime.value = props.assignment.start_time || new Date();
  unlimitedDuration.value = !props.assignment.finish_time;
}

function onAddSubmit(): void {
  emit('add-assignment', addParams.value);
}

function onUpdateSubmit(): void {
  emit('update-assignment', updateParams.value);
}

function onCancel(): void {
  emit('cancel');
  reset();
}

function onSubmit(): void {
  update.value ? onUpdateSubmit() : onAddSubmit();
}

function onChangeSelect(event: Event): void {
  props.assignment.assignment_type = (event.target as HTMLSelectElement).value;
}

watch(
  () => props.assignment,
  () => {
    reset();
  },
);

watch(show, () => {
  reset();
});
</script>

<style lang="scss" scoped>
.omegaup-course-assignmentdetails .form-group > label {
  width: 100%;
}
</style>

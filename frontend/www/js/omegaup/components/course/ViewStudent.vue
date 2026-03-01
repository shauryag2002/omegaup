<template>
  <div class="omegaup-course-viewstudent card">
    <div class="card-header">
      <h2>
        <a :href="courseUrl">{{ course.name }}</a>
      </h2>
    </div>
    <div class="card-body">
      <form>
        <div class="form-group col-md-3">
          <label>{{ T.courseStudentSelectStudent }}</label>
          <select
            v-model="selectedStudent"
            class="ml-1 form-control"
            data-student
          >
            <option
              v-for="student in students"
              :key="student.username"
              :value="student.username"
            >
              {{ student.name || student.username }}
            </option>
          </select>
        </div>
      </form>
      <form>
        <div class="form-group col-md-3">
          <label>{{ T.courseStudentSelectAssignment }}</label>
          <select
            v-model="selectedAssignment"
            class="ml-1 form-control"
            data-assignment
          >
            <option
              v-for="assignment in assignments"
              :key="assignment.alias"
              :value="assignment.alias"
            >
              {{ assignment.name }}
            </option>
          </select>
        </div>
      </form>
      <div v-if="selectedAssignment">
        <OmegaupMarkdown
          :markdown="getAssignmentDescription(selectedAssignment)"
        ></OmegaupMarkdown>
        <hr />
        <div class="card">
          <div class="card-header">
            <template v-if="points(selectedAssignment) === 0">
              {{ T.studentProgressOnlyLecturesDescription }}
            </template>
            <ul v-else class="nav nav-pills card-header-pills">
              <li
                v-for="problem in problemsWithPoints"
                :key="problem.alias"
                class="nav-item"
                role="presentation"
              >
                <a
                  aria-controls="home"
                  data-toggle="tab"
                  href="#home"
                  class="nav-link"
                  :class="{
                    active:
                      selectedProblem &&
                      problem.alias === selectedProblem.alias,
                  }"
                  role="tab"
                  :data-problem-alias="problem.alias"
                  @click="selectedProblem = problem"
                >
                  <template v-if="problem.runs.length > 0">
                    {{ bestScore(problem) * problem.points }} /
                    {{ problem.points }}
                  </template>
                  <template v-if="problem.is_extra_problem">
                    {{ T.studentProgressExtraProblem }}
                  </template>
                  <template
                    v-if="problem.runs.length > 0 || problem.is_extra_problem"
                    >-</template
                  >
                  {{ problem.title }} ({{ problem.runs.length }})
                </a>
              </li>
            </ul>
          </div>
          <div v-if="!selectedProblem">
            <div class="empty-category px-10 py-10"></div>
          </div>
          <div v-else-if="selectedProblem.runs.length === 0">
            <div class="empty-table-message px-10 py-10">
              {{ T.courseAssignmentProblemRunsEmpty }}
            </div>
          </div>
          <template v-else>
            <div class="card-body pb-0">
              <h5 class="card-title">
                {{ T.arenaCommonCode }}
              </h5>
              <pre class="m-0"><code>{{ selectedRunSource }}</code></pre>
            </div>
            <div class="card-body pb-0">
              <template v-if="selectedRun">
                <h5>{{ T.feedbackTitle }}</h5>
                <pre
                  class="border rounded rounded-lg p-2 m-0"
                  :class="{ 'bg-light': selectedRun.feedback == null }"
                  >{{
                    selectedRun.feedback
                      ? selectedRun.feedback.feedback
                      : T.feedbackNotSentYet
                  }}</pre
                >
                <div v-if="selectedRun.feedback && selectedRun.feedback.author">
                  {{
                    ui.formatString(T.feedbackLeftBy, {
                      date: time.formatDate(selectedRun.feedback.date),
                    })
                  }}
                  <OmegaupUserUsername
                    :username="selectedRun.feedback.author"
                    :classname="selectedRun.feedback.author_classname"
                    :linkify="true"
                  ></OmegaupUserUsername>
                </div>
                <div class="mt-3">
                  <a
                    class="btn btn-sm btn-primary"
                    role="button"
                    data-show-feedback-form
                    @click="showFeedbackForm = !showFeedbackForm"
                    >{{ T.submissionFeedbackSendButton }}</a
                  >
                  <div v-show="showFeedbackForm" class="form-group">
                    <p>{{ T.submissionFeedbackAnimationButton }}</p>
                    <img
                      src="/media/submission_feedback_demo.gif"
                      :alt="T.submissionFeedbackDemoAlt"
                    />
                  </div>
                </div>
              </template>
              <h5 class="card-title mt-3 mb-2">
                {{ T.wordsSubmissions }}
              </h5>
              <table class="table table-hover student-runs-table">
                <thead>
                  <tr>
                    <th class="text-center">{{ T.wordsTime }}</th>
                    <th class="text-center">{{ T.wordsStatus }}</th>
                    <th class="numeric">{{ T.wordsPercentage }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="run in selectedProblem.runs"
                    :key="run.guid"
                    :class="{
                      'table-active':
                        selectedRun && run.guid === selectedRun.guid,
                    }"
                    :data-run-guid="run.guid"
                    @click="selectedRun = run"
                  >
                    <td class="text-center">
                      {{ time.formatDateTime(run.time) }}
                    </td>
                    <td class="text-center">{{ run.verdict }}</td>
                    <td class="numeric">{{ 100 * run.score }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { omegaup } from '../../omegaup';
import { types } from '../../api_types';

import OmegaupMarkdown from '../problem/ProblemMarkdown.vue';
import OmegaupUserUsername from '../user/Username.vue';

import T from '../../lang';
import * as ui from '../../ui';
import * as time from '../../time';

const props = withDefaults(
  defineProps<{
    assignments: omegaup.Assignment[];
    course: types.CourseDetails;
    student: types.StudentProgress;
    assignment: types.CourseAssignment;
    problem: null | types.CourseProblem;
    problems: types.CourseProblem[];
    students: types.StudentProgress[];
    feedback: string | null;
  }>(),
  {
    problem: null,
    feedback: null,
  },
);

const emit = defineEmits<{
  (
    e: 'set-feedback',
    value: {
      guid: string | undefined;
      feedback: string | null;
      isUpdate: boolean;
      assignmentAlias: string | null;
      studentUsername: string | null;
    },
  ): void;
  (
    e: 'update',
    value: {
      student: string | null;
      assignmentAlias: string | null;
    },
  ): void;
  (
    e: 'push-state',
    state: Record<string, unknown>,
    title: string,
    url: string,
  ): void;
}>();

const selectedAssignment = ref<string | null>(props.assignment?.alias ?? null);
const selectedProblem = ref<Partial<types.CourseProblem> | null>(props.problem);
const selectedStudent = ref<string | null>(props.student?.username ?? null);
const selectedRun = ref<Partial<types.CourseRun> | null>(null);
const showFeedbackForm = ref(false);
const updatedFeedback = ref<string | null>(props.feedback);

const problemsWithPoints = computed((): types.CourseProblem[] => {
  return props.problems.filter(
    (problem: types.CourseProblem) => problem.points !== 0,
  );
});

const selectedRunSource = computed((): string => {
  return selectedRun.value?.source ?? '';
});

const courseUrl = computed((): string => {
  return `/course/${props.course.alias}/`;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function points(assignmentAlias: string): number {
  return props.problems.reduce(
    (accumulator: number, problem: types.CourseProblem) =>
      accumulator + problem.points,
    0,
  );
}

function getAssignmentDescription(assignmentAlias: string): string {
  const assignment = props.assignments.find(
    (assignment) => assignment.alias === assignmentAlias,
  );
  return assignment?.description ?? '';
}

function bestRun(
  problem: omegaup.CourseProblem,
): omegaup.CourseProblemRun | null {
  let best = null;
  for (let run of problem.runs) {
    if (
      !best ||
      best.score < run.score ||
      (best.score == run.score && best.penalty > run.penalty)
    ) {
      best = run;
    }
  }
  return best;
}

function bestScore(problem: omegaup.CourseProblem): number {
  const best = bestRun(problem);
  return (best && best.score) || 0.0;
}

function sendFeedback(): void {
  if (updatedFeedback.value != null && updatedFeedback.value.length < 2) {
    return;
  }
  emit('set-feedback', {
    guid: selectedRun.value?.guid,
    feedback: updatedFeedback.value,
    isUpdate: selectedRun.value?.feedback != null,
    assignmentAlias: selectedAssignment.value,
    studentUsername: selectedStudent.value,
  });
  updatedFeedback.value = '';
  showFeedbackForm.value = false;
}

onMounted(() => {
  window.addEventListener('popstate', (ev: PopStateEvent) => {
    if (selectedStudent.value !== null) {
      return;
    }
    selectedStudent.value = ev.state?.student ?? props.student.username;
  });
});

watch(selectedStudent, (newVal?: string, oldVal?: string) => {
  emit('update', {
    student: selectedStudent.value,
    assignmentAlias: selectedAssignment.value,
  });
  if (!newVal || newVal === oldVal) {
    return;
  }
  let url: string = '';
  if (selectedAssignment.value !== null) {
    url = `/course/${props.course.alias}/student/${newVal}/assignment/${selectedAssignment.value}/#${selectedProblem.value?.alias}`;
  } else {
    url = `/course/${props.course.alias}/student/${newVal}/`;
  }
  emit('push-state', { student: newVal }, document.title, url);
});

watch(selectedAssignment, (newVal?: string, oldVal?: string) => {
  emit('update', {
    student: selectedStudent.value,
    assignmentAlias: selectedAssignment.value,
  });
  if (!newVal || newVal === oldVal) {
    return;
  }
  let url: string = '';
  if (selectedProblem.value !== null) {
    url = `/course/${props.course.alias}/student/${selectedStudent.value}/assignment/${newVal}/#${selectedProblem.value?.alias}`;
  } else {
    url = `/course/${props.course.alias}/student/${selectedStudent.value}/assignment/${newVal}/`;
  }
  emit('push-state', { student: selectedStudent.value }, document.title, url);
});

watch(
  () => props.problems,
  (newVal: types.CourseProblem[]) => {
    selectedProblem.value = null;
    if (newVal.length === 0) {
      return;
    }
    const found = newVal.find((problem) => problem.points !== 0);
    if (!found) {
      return;
    }
    selectedProblem.value = found;
    selectedRun.value = found.runs?.[0] ?? null;
  },
);

watch(selectedProblem, (newVal) => {
  const val = newVal as types.CourseProblem;
  selectedRun.value = val?.runs?.[0] ?? null;
  window.location.hash = `#${selectedProblem.value?.alias}`;
});

watch(selectedRun, (newVal: Partial<types.CourseRun> | null = null) => {
  if (newVal == null || newVal.feedback == null) {
    updatedFeedback.value = null;
    return;
  }
  updatedFeedback.value = newVal.feedback.feedback;
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.student-runs-table tbody tr {
  cursor: pointer;
}
</style>

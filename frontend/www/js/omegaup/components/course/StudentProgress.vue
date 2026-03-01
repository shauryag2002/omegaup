<template>
  <tr :class="studentProgress.username">
    <th scope="row" class="text-center align-middle">
      <a :href="studentProgressUrl">
        <OmegaupUserUsername
          :classname="studentProgress.classname"
          :username="studentProgress.username"
          :name="studentProgress.name"
          :country="studentProgress.country_id"
        ></OmegaupUserUsername>
      </a>
    </th>
    <td data-global-score class="text-center font-weight-bold align-middle">
      <span class="d-block"
        >{{ studentProgress.courseProgress.toFixed(0) }}%</span
      >
      <span class="d-block">{{
        ui.formatString(T.studentProgressPoints, {
          points: studentProgress.courseScore.toFixed(0),
        })
      }}</span>
    </td>
    <td
      v-for="assignment in assignmentsProblems"
      :key="assignment.alias"
      class="flex-column text-center align-middle text-nowrap justify-content-center align-items-center"
    >
      <span class="d-block">{{
        assignment.points === 0
          ? T.courseWithoutProblems
          : getProgressByAssignment(assignment.alias)
      }}</span>
      <span class="d-block">{{ getPointsByAssignment(assignment.alias) }}</span>
      <div class="d-flex justify-content-center mt-1">
        <div class="d-flex" :class="{ invisible: assignment.points === 0 }">
          <a
            v-for="problem in assignment.problems"
            :key="problem.alias"
            v-tooltip="getProgressTooltipDescription(assignment.alias, problem)"
            :class="getProblemColor(assignment.alias, problem)"
            data-toggle="tooltip"
            data-placement="bottom"
            :href="
              getStudentProgressUrlWithAssignmentAndProblem(
                assignment.alias,
                problem.alias,
              )
            "
          ></a>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { types } from '../../api_types';
import * as ui from '../../ui';
import T from '../../lang';
import 'floating-vue/dist/style.css';
import { vTooltip } from 'floating-vue';
import OmegaupUserUsername from '../user/Username.vue';

const props = defineProps<{
  courseAlias: string;
  studentProgress: types.StudentProgressInCourse;
  assignmentsProblems: types.AssignmentsProblemsPoints[];
}>();

function getProgressByAssignment(assignmentAlias: string): string {
  const score =
    assignmentAlias in props.studentProgress.assignments
      ? props.studentProgress.assignments[assignmentAlias].progress
      : 0;
  return `${score.toFixed(0)}%`;
}

function getPointsByAssignment(assignmentAlias: string): string {
  const score =
    assignmentAlias in props.studentProgress.assignments
      ? props.studentProgress.assignments[assignmentAlias].score
      : 0;
  return ui.formatString(T.studentProgressPoints, {
    points: score.toFixed(0),
  });
}

function getProgressByAssignmentProblem(
  assignmentAlias: string,
  problemAlias: string,
): string {
  const score =
    assignmentAlias in props.studentProgress.assignments &&
    problemAlias in props.studentProgress.assignments[assignmentAlias].problems
      ? props.studentProgress.assignments[assignmentAlias].problems[
          problemAlias
        ].progress
      : 0;
  return score.toFixed(0);
}

function getPointsByAssignmentProblem(
  assignmentAlias: string,
  problemAlias: string,
): string {
  const score =
    assignmentAlias in props.studentProgress.assignments &&
    problemAlias in props.studentProgress.assignments[assignmentAlias].problems
      ? props.studentProgress.assignments[assignmentAlias].problems[
          problemAlias
        ].progress
      : 0;
  return score.toFixed(0);
}

function getProblemColor(
  assignmentAlias: string,
  problem: {
    alias: string;
    isExtraProblem: boolean;
    order: number;
    points: number;
    title: string;
  },
): string {
  if (problem.points === 0) {
    return 'invisible';
  }

  const problemProgress =
    assignmentAlias in props.studentProgress.assignments &&
    problem.alias in props.studentProgress.assignments[assignmentAlias].problems
      ? props.studentProgress.assignments[assignmentAlias].problems[
          problem.alias
        ].progress
      : 0;
  if (problemProgress > 70) return 'box bg-green';
  if (problemProgress >= 50) return 'box bg-yellow';
  if (problemProgress > 0) return 'box bg-red';
  return 'box bg-black';
}

function getProgressTooltipDescription(
  assignmentAlias: string,
  problem: {
    alias: string;
    isExtraProblem: boolean;
    order: number;
    points: number;
    title: string;
  },
): string {
  return ui.formatString(T.studentProgressTooltipDescription, {
    problem: problem.title,
    score: getPointsByAssignmentProblem(assignmentAlias, problem.alias),
    progress: getProgressByAssignmentProblem(assignmentAlias, problem.alias),
    points: problem.points,
  });
}

const studentProgressUrl = computed<string>(() => {
  return `/course/${props.courseAlias}/student/${props.studentProgress.username}/`;
});

function getStudentProgressUrlWithAssignmentAndProblem(
  selectedAssignment: string,
  selectedProblem: string,
): string {
  return `/course/${props.courseAlias}/student/${props.studentProgress.username}/assignment/${selectedAssignment}/#${selectedProblem}`;
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.box {
  width: 20px;
  height: 20px;
  border: 1px solid $omegaup-dark-grey;
}

.bg-green {
  background: $omegaup-green;
}

.bg-yellow {
  background: yellow;
}

.bg-red {
  background: red;
}

.bg-black {
  background: $omegaup-grey;
}
</style>

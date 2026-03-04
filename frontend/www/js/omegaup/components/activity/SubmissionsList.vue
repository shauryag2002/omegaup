<template>
  <div class="row">
    <div class="col-md-12 no-right-padding">
      <div class="card mb-5">
        <div class="card-header">
          <h2 class="card-title">{{ T.profileSolvedProblems }}</h2>
        </div>
        <table
          v-for="(problems, user) in groupedSolvedProblems"
          class="table table-striped"
        >
          <thead>
            <tr>
              <th :colspan="NUM_COLUMNS">{{ user }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="groups in problems">
              <td v-for="problem in groups">
                <a :href="`/arena/problem/${problem.alias}/`">{{
                  problem.title
                }}</a>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-show="!solvedProblems">
          <img src="/media/wait.gif" :alt="T.wordsLoading" />
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">{{ T.profileUnsolvedProblems }}</h2>
        </div>
        <table
          v-for="(problems, user) in groupedUnsolvedProblems"
          class="table table-striped"
        >
          <thead>
            <tr>
              <th :colspan="NUM_COLUMNS">{{ user }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="groups in problems">
              <td v-for="problem in groups">
                <a :href="`/arena/problem/${problem.alias}/`">{{
                  problem.title
                }}</a>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-show="!unsolvedProblems">
          <img src="/media/wait.gif" :alt="T.wordsLoading" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';

interface CourseProblems {
  [user: string]: omegaup.Problem[];
}

interface GroupedCourseProblems {
  [user: string]: omegaup.Problem[][];
}

const props = defineProps<{
  solvedProblems: CourseProblems;
  unsolvedProblems: CourseProblems;
}>();

const NUM_COLUMNS = 3;

function groupElements(elements: CourseProblems): GroupedCourseProblems {
  let groups: GroupedCourseProblems = {};
  for (let user in elements) {
    groups[user] = [];
    for (let i = 0; i < elements[user].length; i += NUM_COLUMNS) {
      groups[user].push(elements[user].slice(i, i + NUM_COLUMNS));
    }
  }
  return groups;
}

const groupedSolvedProblems = computed((): GroupedCourseProblems => {
  return groupElements(props.solvedProblems);
});

const groupedUnsolvedProblems = computed((): GroupedCourseProblems => {
  return groupElements(props.unsolvedProblems);
});
</script>

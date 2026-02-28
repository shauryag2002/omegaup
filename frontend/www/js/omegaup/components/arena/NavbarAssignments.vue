<template>
  <div class="w-100 mt-2">
    <button
      class="btn btn-primary col-md-12 col-sm-12 col-xs-12 mb-2"
      :disabled="previousAssignment === null"
      :title="previousAssignment !== null ? previousAssignment.name : ''"
      role="button"
      @click="$emit('navigate-to-assignment', previousAssignment.alias)"
    >
      <font-awesome-icon
        v-if="previousAssignment !== null"
        :icon="['fas', 'chevron-circle-left']"
      />
      {{ previousAssignment !== null ? previousAssignment.name : '-' }}
    </button>
    <button
      class="btn btn-primary col-md-12 col-sm-12 col-xs-12"
      :disabled="nextAssignment === null"
      :title="nextAssignment !== null ? nextAssignment.name : ''"
      role="button"
      @click="$emit('navigate-to-assignment', nextAssignment.alias)"
    >
      {{ nextAssignment !== null ? nextAssignment.name : '-' }}
      <font-awesome-icon
        v-if="nextAssignment !== null"
        :icon="['fas', 'chevron-circle-right']"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faChevronCircleLeft,
  faChevronCircleRight,
} from '@fortawesome/free-solid-svg-icons';
library.add(faChevronCircleLeft);
library.add(faChevronCircleRight);

const props = defineProps<{
  assignments: omegaup.Assignment[];
  currentAssignment: omegaup.Assignment;
}>();

defineEmits<{
  (e: 'navigate-to-assignment', alias: string): void;
}>();

const currentAssignmentIndex = computed((): number => {
  return props.assignments.findIndex(
    (assignment) => assignment.alias === props.currentAssignment.alias,
  );
});

const previousAssignment = computed((): omegaup.Assignment | null => {
  if (currentAssignmentIndex.value === 0) {
    return null;
  }
  return props.assignments[currentAssignmentIndex.value - 1];
});

const nextAssignment = computed((): omegaup.Assignment | null => {
  if (currentAssignmentIndex.value === props.assignments.length - 1) {
    return null;
  }
  return props.assignments[currentAssignmentIndex.value + 1];
});
</script>

<style>
.navbar-assignments > button {
  margin-bottom: 0.5em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

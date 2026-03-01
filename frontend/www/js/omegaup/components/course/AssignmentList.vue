<template>
  <div class="omegaup-course-assignmentlist card">
    <h3 class="card-header">{{ T.wordsCourseContent }}</h3>
    <div class="card-body">
      <div v-if="content.length === 0" class="card-body">
        <div class="empty-table-message">
          {{ T.courseContentEmpty }}
        </div>
      </div>
      <table v-else class="table table-striped">
        <thead>
          <tr>
            <td></td>
            <th>{{ T.wordsContentType }}</th>
            <th>{{ T.wordsName }}</th>
            <th class="text-center">{{ T.wordsActions }}</th>
          </tr>
        </thead>
        <tbody v-sortable="{ onUpdate: sortContent }">
          <tr v-for="assignment in content" :key="assignment.alias">
            <td>
              <button
                v-tooltip="T.courseAssignmentReorder"
                class="btn btn-link"
              >
                <FontAwesomeIcon icon="arrows-alt" />
              </button>
            </td>
            <td class="align-middle">
              <template v-if="assignment.assignment_type === 'homework'">
                <FontAwesomeIcon icon="file-alt" />
                <span class="ml-2">{{ T.wordsHomework }}</span>
              </template>
              <template v-else-if="assignment.assignment_type === 'lesson'">
                <FontAwesomeIcon icon="chalkboard-teacher" />
                <span class="ml-2">{{ T.wordsLesson }}</span>
              </template>
              <template v-else>
                <FontAwesomeIcon icon="list-alt" />
                <span class="ml-2">{{ T.wordsExam }}</span>
              </template>
            </td>
            <td class="align-middle">
              <a :href="assignmentUrl(assignment)">{{ assignment.name }}</a>
            </td>
            <td class="text-center">
              <button
                v-tooltip="T.courseAssignmentEdit"
                data-course-edit-content-button
                class="btn btn-link"
                @click="emit('emit-edit', assignment)"
              >
                <FontAwesomeIcon icon="edit" />
              </button>
              <button
                v-tooltip="T.courseAddProblemsAdd"
                class="btn btn-link"
                @click="emit('emit-add-problems', assignment)"
              >
                <FontAwesomeIcon icon="list-alt" />
              </button>
              <button
                v-if="assignment.has_runs"
                v-tooltip="T.assignmentRemoveAlreadyHasRuns"
                class="btn btn-link"
                data-toggle="tooltip"
                data-placement="bottom"
              >
                <FontAwesomeIcon icon="trash" class="disabled" />
              </button>
              <button
                v-else
                v-tooltip="T.courseAssignmentDelete"
                class="btn btn-link"
                @click="emit('emit-delete', assignment)"
              >
                <FontAwesomeIcon icon="trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div>
        <button
          v-if="content.length > 1"
          class="btn btn-primary"
          :class="{ disabled: !contentOrderChanged }"
          role="button"
          @click="saveNewOrder"
        >
          {{ T.wordsSaveNewOrder }}
        </button>
      </div>
    </div>
    <div
      v-show="assignmentFormMode === AssignmentFormMode.Default"
      class="card-footer"
    >
      <form class="new">
        <div class="row">
          <div class="form-group col-md-12 mb-0">
            <div class="text-right">
              <button
                data-course-add-new-content
                class="btn btn-primary"
                type="submit"
                @click.prevent="emit('emit-new')"
              >
                {{ T.courseAddContent }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { omegaup } from '../../omegaup';
import { types } from '../../api_types';
import T from '../../lang';
import 'floating-vue/dist/style.css';
import { vTooltip } from 'floating-vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const AssignmentFormMode = omegaup.AssignmentFormMode;

const props = defineProps<{
  content: types.CourseAssignment[];
  courseAlias: string;
  assignmentFormMode: omegaup.AssignmentFormMode;
}>();

const emit = defineEmits<{
  (e: 'emit-edit', assignment: types.CourseAssignment): void;
  (e: 'emit-add-problems', assignment: types.CourseAssignment): void;
  (e: 'emit-delete', assignment: types.CourseAssignment): void;
  (e: 'emit-new'): void;
  (e: 'emit-sort-content', courseAlias: string, aliases: string[]): void;
}>();

const contentOrderChanged = ref(false);
const currentContent = ref(props.content);

function assignmentUrl(assignment: omegaup.Assignment): string {
  return `/course/${props.courseAlias}/assignment/${assignment.alias}/`;
}

function sortContent(event: any): void {
  currentContent.value.splice(
    event.newIndex,
    0,
    currentContent.value.splice(event.oldIndex, 1)[0],
  );
  contentOrderChanged.value = true;
}

function saveNewOrder(): void {
  contentOrderChanged.value = false;
  emit(
    'emit-sort-content',
    props.courseAlias,
    currentContent.value.map(
      (assignment: types.CourseAssignment) => assignment.alias,
    ),
  );
}

watch(
  () => props.content,
  (newValue: types.CourseAssignment[]) => {
    currentContent.value = newValue;
  },
);
</script>

<style lang="scss" scoped>
.disabled {
  color: lightgrey;
}

.table td {
  vertical-align: middle;
}
</style>

<template>
  <div class="omegaup-course-addstudent card">
    <div class="card-body">
      <form
        class="form"
        @submit.prevent="
          emit('emit-add-student', { participant, participants });
          participants = '';
        "
      >
        <div class="form-group">
          <p class="card-title">{{ T.courseEditAddStudentsDescription }}</p>
          <div class="d-flex align-items-center">
            <OmegaupCommonTypeahead
              class="w-100"
              :existing-options="searchResultUsers"
              v-model:value="participant"
              :max-results="10"
              @update-existing-options="
                (query) => emit('update-search-result-users', query)
              "
            ></OmegaupCommonTypeahead>
            <button
              class="btn btn-secondary add-participant ml-2"
              :disabled="!participant"
              @click.prevent="addParticipantToList"
            >
              {{ T.courseEditAddStudentsAdd }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>{{ T.wordsMultipleUser }}</label>
          <textarea
            v-model="participants"
            data-course-multiple-students-add
            class="form-control participants"
            rows="4"
          ></textarea>
        </div>
        <div class="form-group float-right">
          <button
            class="btn btn-primary user-add-bulk"
            :disabled="participants === ''"
            type="submit"
          >
            {{ T.wordsAddStudents }}
          </button>
        </div>
      </form>
      <div v-if="students.length == 0">
        <div class="empty-category">
          {{ T.courseStudentsEmpty }}
        </div>
      </div>
      <table v-else class="table table-striped table-over">
        <thead>
          <tr>
            <th>{{ T.courseEditAddStudentsStudent }}</th>
            <th class="align-right">
              {{ T.contestEditRegisteredAdminDelete }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.username">
            <td data-uploaded-students>
              <a :href="studentProgressUrl(student)">{{
                student.name || student.username
              }}</a>
            </td>
            <td>
              <button
                class="close"
                type="button"
                @click="emit('emit-remove-student', student)"
              >
                ×
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="students.length > 0" class="float-right">
        <a class="btn btn-primary" :href="studentsProgressUrl()">
          {{ T.courseStudentsProgress }}
        </a>
      </div>
    </div>
    <OmegaupCommonRequests
      :data="identityRequests"
      :text-add-participant="T.wordsAddStudent"
      @accept-request="(request) => emit('accept-request', request)"
      @deny-request="(request) => emit('deny-request', request)"
    ></OmegaupCommonRequests>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';
import OmegaupCommonRequests from '../common/Requests.vue';

const props = defineProps<{
  courseAlias: string;
  students: types.CourseStudent[];
  identityRequests?: types.IdentityRequest[];
  searchResultUsers: types.ListItem[];
}>();

const emit = defineEmits<{
  (
    e: 'emit-add-student',
    payload: { participant: types.ListItem | null; participants: string },
  ): void;
  (e: 'update-search-result-users', query: string): void;
  (e: 'emit-remove-student', student: types.CourseStudent): void;
  (e: 'accept-request', request: types.IdentityRequest): void;
  (e: 'deny-request', request: types.IdentityRequest): void;
}>();

const studentUsername = ref('');
const participant = ref<types.ListItem | null>(null);
const participants = ref('');
const requests = ref<types.IdentityRequest[]>([]);

function studentProgressUrl(student: types.CourseStudent): string {
  return `/course/${props.courseAlias}/student/${student.username}/`;
}

function studentsProgressUrl(): string {
  return `/course/${props.courseAlias}/students/`;
}

function addParticipantToList(): void {
  if (participants.value.length) {
    participants.value += '\n';
  }
  participants.value += participant.value?.key;

  participant.value = null;
}

watch(
  () => props.identityRequests,
  (newVal) => {
    if (newVal) {
      requests.value = newVal;
    }
  },
);
</script>

<style>
.omegaup-course-addstudent th.align-right {
  text-align: right;
}
</style>

<template>
  <div class="course-edit">
    <div class="page-header">
      <h1>
        {{ readOnly ? T.omegaupTitleCourseDetails : T.wordsEditCourse }}
        <span
          data-course-name
          :class="{ 'text-secondary': data.course.archived }"
          >{{ data.course.name }}</span
        >
        <small>
          &ndash;
          <a :href="courseURL">
            {{ T.courseEditGoToCourse }}
          </a>
        </small>
      </h1>
    </div>
    <ul v-if="!readOnly" class="nav nav-pills mt-4">
      <li class="nav-item" role="presentation">
        <a
          href="#course"
          class="nav-link"
          data-tab-course
          :class="{ active: showTab === 'course' }"
          @click="showTab = 'course'"
          >{{ T.courseEdit }}</a
        >
      </li>
      <li class="nav-item" role="presentation" data-course-edit-content>
        <a
          href="#content"
          class="nav-link"
          data-tab-content
          :class="{ active: showTab === 'content' }"
          @click="onSelectAssignmentTab"
          >{{ T.wordsContent }}</a
        >
      </li>
      <li class="nav-item" role="presentation" data-course-edit-admission-mode>
        <a
          href="#admission-mode"
          class="nav-link"
          data-tab-admission-mode
          :class="{ active: showTab === 'admission-mode' }"
          @click="showTab = 'admission-mode'"
          >{{ T.contestNewFormAdmissionMode }}</a
        >
      </li>
      <li class="nav-item" role="presentation" data-course-edit-students>
        <a
          href="#students"
          class="nav-link"
          data-tab-students
          :class="{ active: showTab === 'students' }"
          @click="showTab = 'students'"
          >{{ T.courseEditStudents }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          href="#admins"
          class="nav-link"
          data-tab-admins
          :class="{ active: showTab === 'admins' }"
          @click="showTab = 'admins'"
          >{{ T.courseEditAdmins }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          href="#clone"
          class="nav-link"
          data-tab-clone
          :class="{ active: showTab === 'clone' }"
          @click="showTab = 'clone'"
          >{{ T.courseEditClone }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          href="#archive"
          class="nav-link"
          data-tab-archive
          :class="{ active: showTab === 'archive' }"
          @click="showTab = 'archive'"
          >{{ T.courseEditArchive }}</a
        >
      </li>
    </ul>

    <div class="tab-content mt-2">
      <div v-if="showTab === 'course'" class="tab-pane active" role="tabpanel">
        <OmegaupCourseForm
          :update="true"
          :course="data.course"
          :all-languages="data.allLanguages"
          :search-result-schools="searchResultSchools"
          :read-only="readOnly"
          :invalid-parameter-name="invalidParameterName"
          @emit-cancel="onCancel"
          @submit="(request) => emit('submit-edit-course', request)"
          @update-search-result-schools="
            (query) => emit('update-search-result-schools', query)
          "
          @invalid-languages="emit('invalid-languages')"
          @clear-language-error="emit('clear-language-error')"
        ></OmegaupCourseForm>
      </div>

      <div
        v-if="showTab === 'content'"
        data-content-tab
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupCourseAssignmentList
          :content="assignments"
          :course-alias="data.course.alias"
          :assignment-form-mode="assignmentFormMode"
          @emit-new="onNewAssignment"
          @emit-edit="(assignment) => onEditAssignment(assignment)"
          @emit-add-problems="(assignment) => onAddProblems(assignment)"
          @emit-delete="(assignment) => emit('delete-assignment', assignment)"
          @emit-sort-content="
            (courseAlias, contentAliases) =>
              emit('sort-content', courseAlias, contentAliases)
          "
        ></OmegaupCourseAssignmentList>
        <OmegaupCourseAssignmentDetails
          ref="assignmentDetailsRef"
          :unlimited-duration-course="!data.course.finish_time"
          :finish-time-course="data.course.finish_time"
          :start-time-course="data.course.start_time"
          :assignment="assignment"
          :assignment-problems="assignmentProblems"
          :tagged-problems="data.taggedProblems"
          :invalid-parameter-name="invalidParameterName"
          v-model:assignment-form-mode="assignmentFormMode"
          :course-alias="data.course.alias"
          :search-result-problems="searchResultProblems"
          @update-search-result-problems="
            (query) => emit('update-search-result-problems', query)
          "
          @add-problem="
            (assignment, problem) => emit('add-problem', assignment, problem)
          "
          @emit-add-problem="
            (assignment, problemAlias) =>
              emit('add-problem', assignment, problemAlias)
          "
          @emit-select-assignment="
            (assignment) => emit('select-assignment', assignment)
          "
          @remove-problem="
            (assignment, problem) => emit('remove-problem', assignment, problem)
          "
          @sort-problems="
            (assignmentAlias, problemsAlias) =>
              emit('sort-problems', assignmentAlias, problemsAlias)
          "
          @cancel="onResetAssignmentForm"
          @add-assignment="(params) => emit('add-assignment', params)"
          @update-assignment="(params) => emit('update-assignment', params)"
          @get-versions="(request) => emit('get-versions', request)"
        >
          <template #page-header><span></span></template>
          <template #cancel-button>
            <button
              class="btn btn-secondary"
              type="reset"
              @click.prevent="onResetAssignmentForm"
            >
              {{ T.wordsCancel }}
            </button></template
          ></OmegaupCourseAssignmentDetails
        >
      </div>

      <div
        v-if="showTab === 'admission-mode'"
        data-admission-mode-tab
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupCourseAdmisionMode
          :admission-mode="data.course.admission_mode"
          :should-show-public-option="data.course.is_curator"
          :course-alias="data.course.alias"
          :show-in-public-courses-list="data.course.recommended"
          @update-admission-mode="
            (request) => emit('update-admission-mode', request)
          "
        ></OmegaupCourseAdmisionMode>
      </div>

      <div
        v-if="showTab === 'students'"
        data-students-tab
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupCourseAddStudents
          :students="data.students"
          :course-alias="data.course.alias"
          :identity-requests="data.identityRequests"
          :search-result-users="searchResultUsers"
          @emit-add-student="
            (participants) => emit('add-student', participants)
          "
          @emit-remove-student="(student) => emit('remove-student', student)"
          @accept-request="(request) => emit('accept-request', request)"
          @deny-request="(request) => emit('deny-request', request)"
          @update-search-result-users="
            (query) => emit('update-search-result-users', query)
          "
        ></OmegaupCourseAddStudents>
      </div>

      <div
        v-if="showTab === 'admins'"
        class="tab-pane active pane-admins d-flex row"
        role="tabpanel"
      >
        <div class="col-md-6">
          <OmegaupCommonAdmins
            :admins="data.admins"
            :search-result-users="searchResultUsers"
            @add-admin="(username) => emit('add-admin', username)"
            @remove-admin="(username) => emit('remove-admin', username)"
            @update-search-result-users="
              (query) => emit('update-search-result-users', query)
            "
          ></OmegaupCommonAdmins>
        </div>
        <div class="col-md-6">
          <OmegaupCommonGroupadmins
            :group-admins="data.groupsAdmins"
            :search-result-groups="searchResultGroups"
            @add-group-admin="
              (groupAlias) => emit('add-group-admin', groupAlias)
            "
            @remove-group-admin="
              (groupAlias) => emit('remove-group-admin', groupAlias)
            "
            @update-search-result-groups="
              (query) => emit('update-search-result-groups', query)
            "
          ></OmegaupCommonGroupadmins>
        </div>
        <div class="col-md-6">
          <OmegaupCommonTeachingAssistants
            :teaching-assistants="data.teachingAssistants"
            :search-result-users="searchResultUsers"
            @add-teaching-assistant="
              (username) => emit('add-teaching-assistant', username)
            "
            @remove-teaching-assistant="
              (username) => emit('remove-teaching-assistant', username)
            "
            @update-search-result-users="
              (query) => emit('update-search-result-users', query)
            "
          ></OmegaupCommonTeachingAssistants>
        </div>
        <div class="col-md-6">
          <OmegaupCommonGroupTeachingAssistants
            :group-teaching-assistants="data.groupsTeachingAssistants"
            :search-result-groups="searchResultGroups"
            @add-group-teaching-assistant="
              (groupAlias) => emit('add-group-teaching-assistant', groupAlias)
            "
            @remove-group-teaching-assistant="
              (groupAlias) =>
                emit('remove-group-teaching-assistant', groupAlias)
            "
            @update-search-result-groups="
              (query) => emit('update-search-result-groups', query)
            "
          ></OmegaupCommonGroupTeachingAssistants>
        </div>
      </div>

      <div v-if="showTab === 'clone'" class="tab-pane active" role="tabpanel">
        <div class="card">
          <div class="card-body">
            <OmegaupCourseClone
              class="mb-4"
              :initial-alias="data.course.alias"
              :initial-name="data.course.name"
              @clone="
                (alias, name, startTime) =>
                  emit('clone', alias, name, startTime)
              "
            ></OmegaupCourseClone>
            <OmegaupCourseGenerateLinkClone
              v-if="data.course.admission_mode !== admissionMode.Public"
              :alias="data.course.alias"
              :token="token"
              @generate-link="(alias) => emit('generate-link', alias)"
            ></OmegaupCourseGenerateLinkClone>
          </div>
        </div>
      </div>
      <div v-if="showTab === 'archive'" class="tab-pane active" role="tabpanel">
        <OmegaupCommonArchive
          :already-archived="alreadyArchived"
          :archive-button-description="
            alreadyArchived ? T.wordsUnarchiveCourse : T.wordsArchiveCourse
          "
          :archive-confirm-text="T.courseArchiveConfirmText"
          :archive-header-title="T.wordsArchiveCourse"
          :archive-help-text="T.courseArchiveHelpText"
          @archive="onArchiveCourse"
        ></OmegaupCommonArchive>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import OmegaupCourseForm from './Form.vue';
import OmegaupCourseAssignmentList from './AssignmentList.vue';
import OmegaupCommonArchive from '../common/Archive.vue';
import OmegaupCourseAssignmentDetails from './AssignmentDetails.vue';
import OmegaupCourseAdmisionMode from './AdmissionMode.vue';
import OmegaupCourseAddStudents from './AddStudents.vue';
import OmegaupCommonAdmins from '../common/Admins.vue';
import OmegaupCommonGroupadmins from '../common/GroupAdmins.vue';
import OmegaupCommonTeachingAssistants from '../common/TeachingAssistants.vue';
import OmegaupCommonGroupTeachingAssistants from '../common/GroupTeachingAssistants.vue';
import OmegaupCourseClone from './Clone.vue';
import OmegaupCourseGenerateLinkClone from './GenerateLinkClone.vue';
import T from '../../lang';
import type { types } from '../../api_types';
import { omegaup } from '../../omegaup';
import { AdmissionMode } from '../common/Publish.vue';

const now = new Date();
const finishTime = new Date();
finishTime.setHours(finishTime.getHours() + 5);
const defaultStartTime = now;
const defaultFinishTime = finishTime;
const availableTabs = [
  'course',
  'content',
  'problems',
  'admission-mode',
  'students',
  'admins',
  'clone',
];
const emptyAssignment: types.CourseAssignment = {
  problemset_id: 0,
  alias: '',
  description: '',
  name: '',
  has_runs: false,
  max_points: 0,
  start_time: defaultStartTime,
  finish_time: defaultFinishTime,
  opened: false,
  order: 1,
  scoreboard_url: '',
  scoreboard_url_admin: '',
  assignment_type: 'homework',
  problemCount: 0,
};

const props = defineProps<{
  data: types.CourseEditPayload;
  invalidParameterName: string;
  initialTab: string;
  searchResultUsers: types.ListItem[];
  searchResultProblems: types.ListItem[];
  searchResultGroups: types.ListItem[];
  searchResultTeachingAssistants: types.ListItem[];
  searchResultGroupsTeachingAssistants: types.ListItem[];
  searchResultSchools: types.SchoolListItem[];
  readOnly: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit-edit-course', request: unknown): void;
  (e: 'update-search-result-schools', query: string): void;
  (e: 'invalid-languages'): void;
  (e: 'clear-language-error'): void;
  (e: 'delete-assignment', assignment: types.CourseAssignment): void;
  (e: 'sort-content', courseAlias: string, contentAliases: string[]): void;
  (e: 'update-search-result-problems', query: string): void;
  (
    e: 'add-problem',
    assignment: types.CourseAssignment,
    problem: unknown,
  ): void;
  (e: 'select-assignment', assignment: types.CourseAssignment): void;
  (
    e: 'remove-problem',
    assignment: types.CourseAssignment,
    problem: unknown,
  ): void;
  (e: 'sort-problems', assignmentAlias: string, problemsAlias: string[]): void;
  (e: 'add-assignment', params: unknown): void;
  (e: 'update-assignment', params: unknown): void;
  (e: 'get-versions', request: unknown): void;
  (e: 'update-admission-mode', request: unknown): void;
  (e: 'add-student', participants: unknown): void;
  (e: 'remove-student', student: unknown): void;
  (e: 'accept-request', request: unknown): void;
  (e: 'deny-request', request: unknown): void;
  (e: 'update-search-result-users', query: string): void;
  (e: 'add-admin', username: string): void;
  (e: 'remove-admin', username: string): void;
  (e: 'add-group-admin', groupAlias: string): void;
  (e: 'remove-group-admin', groupAlias: string): void;
  (e: 'update-search-result-groups', query: string): void;
  (e: 'add-teaching-assistant', username: string): void;
  (e: 'remove-teaching-assistant', username: string): void;
  (e: 'add-group-teaching-assistant', groupAlias: string): void;
  (e: 'remove-group-teaching-assistant', groupAlias: string): void;
  (e: 'clone', alias: string, name: string, startTime: Date): void;
  (e: 'generate-link', alias: string): void;
  (e: 'archive-course', alias: string, archive: boolean): void;
  (e: 'cancel', courseURL: string): void;
}>();

const assignmentDetailsRef = ref<InstanceType<
  typeof OmegaupCourseAssignmentDetails
> | null>(null);

const showTab = ref(props.initialTab);
const alreadyArchived = ref(props.data.course.archived);
const assignmentProblems = ref(props.data.assignmentProblems);
const assignments = ref(props.data.course.assignments);
const assignmentFormMode = ref<omegaup.AssignmentFormMode>(
  omegaup.AssignmentFormMode.Default,
);
const assignment = ref(emptyAssignment);
const token = ref('');
const admissionMode = AdmissionMode;

const courseURL = computed(() => `/course/${props.data.course.alias}/`);

function onNewAssignment(): void {
  assignmentFormMode.value = omegaup.AssignmentFormMode.New;
  assignment.value = emptyAssignment;
  assignmentProblems.value = [];
  nextTick(() => {
    assignmentDetailsRef.value?.$el.scrollIntoView();
    (assignmentDetailsRef.value?.$refs.name as HTMLElement)?.focus();
  });
}

function onEditAssignment(editAssignment: types.CourseAssignment): void {
  assignmentFormMode.value = omegaup.AssignmentFormMode.Edit;
  assignment.value = editAssignment;
  emit('select-assignment', assignment.value);
  nextTick(() => {
    assignmentDetailsRef.value?.$el.scrollIntoView();
    (assignmentDetailsRef.value?.$refs.name as HTMLElement)?.focus();
  });
}

function onAddProblems(addAssignment: types.CourseAssignment): void {
  assignmentFormMode.value = omegaup.AssignmentFormMode.Edit;
  assignment.value = addAssignment;
  emit('select-assignment', addAssignment);
  nextTick(() => {
    assignmentDetailsRef.value?.$el.scrollIntoView();
  });
}

function onCancel(): void {
  emit('cancel', courseURL.value);
}

function onResetAssignmentForm(): void {
  assignmentFormMode.value = omegaup.AssignmentFormMode.Default;
  window.scrollTo(0, 0);
}

function onSelectAssignmentTab(): void {
  showTab.value = 'content';
  onResetAssignmentForm();
}

function onArchiveCourse(archive: boolean): void {
  emit('archive-course', props.data.course.alias, archive);
  alreadyArchived.value = archive;
}

watch(
  () => props.initialTab,
  (newValue: string) => {
    if (!availableTabs.includes(props.initialTab)) {
      showTab.value = 'course';
      return;
    }
    showTab.value = newValue;
  },
);
</script>

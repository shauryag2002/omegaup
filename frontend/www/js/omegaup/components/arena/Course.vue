<template>
  <OmegaupArena
    :active-tab="activeTab"
    :title="currentAssignment.name"
    :should-show-runs="isAdmin"
    :should-show-ranking="showRanking"
    @update:activeTab="(selectedTab) => emit('update:activeTab', selectedTab)"
  >
    <template #socket-status>
      <sup :class="socketClass" :title="socketStatusTitle">{{
        socketStatus
      }}</sup>
    </template>
    <template #clock>
      <div v-if="!deadline" class="clock">{{ INF }}</div>
      <template v-else>
        <OmegaupCountdown
          v-show="currentAssignment.start_time > now"
          :target-time="currentAssignment.start_time"
          :countdown-format="omegaup.CountdownFormat.AssignmentHasNotStarted"
          @finish="now = new Date()"
        />
        <OmegaupCountdown
          v-show="currentAssignment.start_time < now"
          class="clock"
          :target-time="deadline"
          @finish="now = new Date()"
        />
      </template>
    </template>
    <template #arena-problems>
      <div data-course>
        <div class="tab navleft">
          <div class="navbar">
            <OmegaupArenaNavbarProblems
              :problems="problems"
              :active-problem="activeProblemAlias"
              :in-assignment="true"
              :course-alias="course.alias"
              :course-name="course.name"
              :current-assignment="currentAssignment"
              :digits-after-decimal-point="2"
              @disable-active-problem="activeProblem = null"
              @navigate-to-problem="onNavigateToProblem"
            />
            <OmegaupArenaNavbarAssignments
              :assignments="course.assignments"
              :current-assignment="currentAssignment"
              @navigate-to-assignment="
                (assignmentAliasToShow) =>
                  emit('navigate-to-assignment', {
                    assignmentAliasToShow,
                    courseAlias: course.alias,
                  })
              "
            />
          </div>
          <OmegaupArenaSummary
            v-if="activeProblem === null"
            :title="currentAssignment.name"
            :description="currentAssignment.description"
            :start-time="currentAssignment.start_time"
            :finish-time="currentAssignment.finish_time"
            :admin="currentAssignment.director"
          />
          <div v-else class="problem main">
            <OmegaupProblemDetails
              :user="{ loggedIn: true, admin: false, reviewer: false }"
              :next-submission-timestamp="currentNextSubmissionTimestamp"
              :next-execution-timestamp="currentNextExecutionTimestamp"
              :problem="problemInfo"
              :nomination-status="
                problemInfo ? problemInfo.nominationStatus : null
              "
              :popup-displayed="problemDetailsPopup"
              :request-feedback="true"
              :active-tab="'problems'"
              :languages="course.languages"
              :runs="runs"
              :guid="guid"
              :run-details-data="runDetailsData"
              :problem-alias="problemAlias"
              :in-contest-or-course="true"
              :feedback-map="feedbackMap"
              :feedback-thread-map="feedbackThreadMap"
              @request-feedback="(guid) => emit('request-feedback', guid)"
              @update:activeTab="
                (selectedTab) =>
                  emit('reset-hash', { selectedTab, problemAlias })
              "
              @submit-run="onRunSubmitted"
              @execute-run="onRunExecuted"
              @show-run="onRunDetails"
              @submit-promotion="(request) => emit('submit-promotion', request)"
              @dismiss-promotion="
                (qualityPromotionComponent, isDismissed) =>
                  emit('dismiss-promotion', {
                    solved: qualityPromotionComponent.solved,
                    tried: qualityPromotionComponent.tried,
                    isDismissed,
                  })
              "
              @new-submission-popup-displayed="
                emit('new-submission-popup-displayed')
              "
            >
              <template #quality-nomination-buttons>
                <div></div>
              </template>
              <template #best-solvers-list>
                <div></div>
              </template>
              <template #feedback="{ guid, isAdmin, feedback }">
                <OmegaupSubmissionFeedback
                  :guid="guid"
                  :is-admin="isAdmin"
                  :feedback-options="feedback"
                  @set-feedback="(request) => emit('set-feedback', request)"
                />
              </template>
            </OmegaupProblemDetails>
          </div>
        </div>
      </div>
    </template>
    <template v-if="scoreboard" #arena-scoreboard>
      <OmegaupArenaScoreboard
        :show-invited-users-filter="false"
        :problems="scoreboard.problems"
        :ranking="scoreboard.ranking"
        :last-updated="scoreboard.time"
      >
        <template #scoreboard-header><div></div></template>
      </OmegaupArenaScoreboard>
    </template>
    <template v-if="isAdmin" #arena-runs>
      <OmegaupArenaRunsForCourses
        :show-all-runs="true"
        :contest-alias="currentAssignment.alias"
        :runs="allRuns"
        :total-runs="totalRuns"
        :show-problem="true"
        :show-details="true"
        :show-disqualify="true"
        :show-filters="true"
        :show-rejudge="true"
        :show-user="true"
        :items-per-page="100"
        :problemset-problems="Object.values(problems)"
        :search-result-users="searchResultUsers"
        :search-result-problems="searchResultProblems"
        @details="onRunAdminDetails"
        @rejudge="(run) => emit('rejudge', run)"
        @disqualify="(run) => emit('disqualify', run)"
        @requalify="(run) => emit('requalify', run)"
        @filter-changed="(request) => emit('apply-filter', request)"
        @update-search-result-users-contest="
          (request) => emit('update-search-result-users-assignment', request)
        "
      >
        <template #title><div></div></template>
        <template #runs><div></div></template>
      </OmegaupArenaRunsForCourses>
      <OmegaupOverlay
        v-if="isAdmin"
        :show-overlay="currentPopupDisplayed !== PopupDisplayed.None"
        @hide-overlay="onPopupDismissed"
      >
        <template #popup>
          <OmegaupArenaRundetailsPopup
            v-show="currentPopupDisplayed === PopupDisplayed.RunDetails"
            :data="currentRunDetailsData"
            @dismiss="onPopupDismissed"
          >
            <template #feedback="{ guid, isAdmin, feedback }">
              <OmegaupSubmissionFeedback
                :guid="guid"
                :is-admin="isAdmin"
                :feedback-options="feedback"
                @set-feedback="(request) => emit('set-feedback', request)"
              />
            </template>
            <template #code-view="{ guid }">
              <OmegaupArenaFeedbackCodeView
                :language="language"
                :value="source"
                :readonly="false"
                :feedback-map="feedbackMap"
                :feedback-thread-map="feedbackThreadMap"
                :current-user-class-name="currentUserClassName"
                :current-username="currentUsername"
                @save-feedback-list="
                  (feedbackList) =>
                    emit('save-feedback-list', { feedbackList, guid })
                "
                @submit-feedback-thread="
                  (feedback) =>
                    emit('submit-feedback-thread', { feedback, guid })
                "
              />
            </template>
          </OmegaupArenaRundetailsPopup>
        </template>
      </OmegaupOverlay>
    </template>
    <template #arena-clarifications>
      <div class="container">
        <OmegaupArenaClarificationList
          :problems="problems"
          :users="users"
          :problem-alias="problems.length != 0 ? problems[0].alias : null"
          :username="isAdmin && users.length != 0 ? users[0].username : null"
          :clarifications="currentClarifications"
          :is-admin="isAdmin"
          :allow-filter-by-assignment="true"
          :show-new-clarification-popup="showNewClarificationPopup"
          @new-clarification="(request) => emit('new-clarification', request)"
          @clarification-response="
            (request) => emit('clarification-response', request)
          "
          @update:activeTab="
            (selectedTab) => emit('update:activeTab', selectedTab)
          "
        >
          <template #table-title>
            <th class="text-center" scope="col">{{ T.wordsHomework }}</th>
            <th class="text-center" scope="col">{{ T.wordsProblem }}</th>
          </template>
        </OmegaupArenaClarificationList>
      </div>
    </template>
  </OmegaupArena>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import { omegaup } from '../../omegaup';
import OmegaupArena from './Arena.vue';
import OmegaupArenaClarificationList from './ClarificationList.vue';
import OmegaupArenaNavbarAssignments from './NavbarAssignments.vue';
import OmegaupArenaNavbarProblems from './NavbarProblems.vue';
import OmegaupArenaRuns from './Runs.vue';
import OmegaupArenaRunsForCourses from '../arena/RunsForCourses.vue';
import OmegaupArenaRundetailsPopup from '../arena/RunDetailsPopup.vue';
import OmegaupOverlay from '../Overlay.vue';
import OmegaupArenaScoreboard from './Scoreboard.vue';
import OmegaupArenaSummary from './Summary.vue';
import OmegaupCountdown from '../Countdown.vue';
import OmegaupProblemDetails from '../problem/Details.vue';
import { PopupDisplayed } from '../problem/Details.vue';
import OmegaupSubmissionFeedback from '../submissions/Feedback.vue';
import { SocketStatus } from '../../arena/events_socket';
import { SubmissionRequest } from '../../arena/submissions';
import OmegaupArenaFeedbackCodeView from './FeedbackCodeView.vue';
import { ArenaCourseFeedback } from './Feedback.vue';

const props = withDefaults(
  defineProps<{
    course: types.CourseDetails;
    currentAssignment: types.ArenaAssignment;
    problems: types.NavbarProblemsetProblem[];
    users?: types.ContestUser[];
    problem?: types.NavbarProblemsetProblem | null;
    problemInfo?: types.ProblemDetails | null;
    clarifications?: types.Clarification[];
    activeTab: string;
    guid?: null | string;
    problemAlias?: null | string;
    socketStatus?: SocketStatus;
    showNewClarificationPopup?: boolean;
    scoreboard?: null | types.Scoreboard;
    popupDisplayed?: PopupDisplayed;
    runs?: types.Run[];
    allRuns?: null | types.Run[];
    runDetailsData?: types.RunDetails | null;
    nextSubmissionTimestamp?: Date | null;
    nextExecutionTimestamp?: Date | null;
    shouldShowFirstAssociatedIdentityRunWarning?: boolean;
    showRanking?: boolean;
    totalRuns: number;
    searchResultUsers: types.ListItem[];
    feedbackMap?: Map<number, ArenaCourseFeedback>;
    feedbackThreadMap?: Map<number, ArenaCourseFeedback>;
    currentUsername: string;
    currentUserClassName: string;
  }>(),
  {
    users: () => [],
    problem: null,
    problemInfo: null,
    clarifications: () => [],
    guid: null,
    problemAlias: null,
    socketStatus: SocketStatus.Waiting,
    showNewClarificationPopup: false,
    scoreboard: null,
    popupDisplayed: PopupDisplayed.None,
    runs: () => [],
    allRuns: null,
    runDetailsData: null,
    nextSubmissionTimestamp: null,
    nextExecutionTimestamp: null,
    shouldShowFirstAssociatedIdentityRunWarning: false,
    showRanking: false,
    feedbackMap: () => new Map<number, ArenaCourseFeedback>(),
    feedbackThreadMap: () => new Map<number, ArenaCourseFeedback>(),
  },
);

const emit = defineEmits<{
  (e: 'update:activeTab', selectedTab: string): void;
  (
    e: 'navigate-to-assignment',
    payload: { assignmentAliasToShow: string; courseAlias: string },
  ): void;
  (
    e: 'navigate-to-problem',
    payload: { problem: types.NavbarProblemsetProblem },
  ): void;
  (e: 'submit-run', payload: object): void;
  (e: 'execute-run', payload: { target: object }): void;
  (e: 'show-run', payload: object): void;
  (
    e: 'reset-hash',
    payload: { selectedTab: string; alias: string | null },
  ): void;
  (e: 'rejudge', run: types.Run): void;
  (e: 'disqualify', run: types.Run): void;
  (e: 'requalify', run: types.Run): void;
  (e: 'apply-filter', request: object): void;
  (e: 'update-search-result-users-assignment', request: object): void;
  (e: 'new-clarification', request: object): void;
  (e: 'clarification-response', request: object): void;
  (e: 'new-submission-popup-displayed'): void;
  (e: 'submit-promotion', request: object): void;
  (e: 'dismiss-promotion', payload: object): void;
  (e: 'set-feedback', request: object): void;
  (e: 'save-feedback-list', payload: object): void;
  (e: 'submit-feedback-thread', payload: object): void;
  (e: 'request-feedback', guid: string): void;
}>();

const INF = '∞';

const isAdmin =
  props.course.is_admin ||
  props.course.is_curator ||
  props.course.is_teaching_assistant;
const currentClarifications = ref(props.clarifications);
const activeProblem = ref<types.NavbarProblemsetProblem | null>(props.problem);
const currentRunDetailsData = ref(props.runDetailsData);
const currentPopupDisplayed = ref(props.popupDisplayed);
const currentNextSubmissionTimestamp = ref(props.nextSubmissionTimestamp);
const currentNextExecutionTimestamp = ref(props.nextExecutionTimestamp);
const now = ref(new Date());

const activeProblemAlias = computed((): null | string => {
  return activeProblem.value?.alias ?? null;
});

const socketClass = computed((): string => {
  if (props.socketStatus === SocketStatus.Connected) {
    return 'socket-status socket-status-ok';
  }
  if (props.socketStatus === SocketStatus.Failed) {
    return 'socket-status socket-status-error';
  }
  return 'socket-status';
});

const socketStatusTitle = computed((): string => {
  if (props.socketStatus === SocketStatus.Connected) {
    return T.socketStatusConnected;
  }
  if (props.socketStatus === SocketStatus.Failed) {
    return T.socketStatusFailed;
  }
  return T.socketStatusWaiting;
});

const deadline = computed((): null | Date => {
  return props.currentAssignment.finish_time ?? null;
});

const problemDetailsPopup = computed(
  (): PopupDisplayed => {
    if (!props.problemInfo) {
      return currentPopupDisplayed.value;
    }

    if (
      !props.problemInfo.nominationStatus.solved &&
      !props.problemInfo.nominationStatus.tried
    ) {
      return currentPopupDisplayed.value;
    }

    if (
      props.problemInfo.nominationStatus.dismissed ||
      (props.problemInfo.nominationStatus.dismissedBeforeAc &&
        !props.problemInfo.nominationStatus.solved)
    ) {
      return currentPopupDisplayed.value;
    }

    if (
      props.problemInfo.nominationStatus.nominated ||
      (props.problemInfo.nominationStatus.nominatedBeforeAc &&
        !props.problemInfo.nominationStatus.solved)
    ) {
      return currentPopupDisplayed.value;
    }

    if (!props.problemInfo.nominationStatus.canNominateProblem) {
      return currentPopupDisplayed.value;
    }

    return PopupDisplayed.Promotion;
  },
);

const searchResultProblems = computed((): types.ListItem[] => {
  if (!props.problems.length) {
    return [];
  }
  return props.problems.map((problem) => ({
    key: problem.alias,
    value: problem.text,
  }));
});

const language = computed((): string | undefined => {
  return props.runDetailsData?.language;
});

const source = computed((): string | undefined => {
  return props.runDetailsData?.source;
});

function onPopupDismissed(): void {
  currentPopupDisplayed.value = PopupDisplayed.None;
  currentRunDetailsData.value = null;
  emit('reset-hash', { selectedTab: 'runs', alias: null });
}

function onNavigateToProblem(problem: types.NavbarProblemsetProblem) {
  activeProblem.value = problem;
  emit('navigate-to-problem', { problem });
}

function onRunSubmitted(run: { code: string; language: string }): void {
  emit('submit-run', { ...run, problem: activeProblem.value });
}

function onRunAdminDetails(request: SubmissionRequest): void {
  emit('show-run', {
    ...request,
    isAdmin: isAdmin,
    hash: `#runs/all/show-run:${request.guid}`,
  });
  currentPopupDisplayed.value = PopupDisplayed.RunDetails;
}

function onRunDetails(request: SubmissionRequest): void {
  emit('show-run', {
    ...request,
    hash: `#problems/${activeProblemAlias.value}/show-run:${request.guid}`,
  });
}

function onRunExecuted(): void {
  emit('execute-run', { target: {} });
}

watch(
  () => props.problem,
  (newValue) => {
    const currentProblem = props.currentAssignment.problems?.find(
      ({ alias }: { alias: string }) => alias === newValue?.alias,
    );
    if (!newValue || !currentProblem) {
      activeProblem.value = null;
      emit('reset-hash', { selectedTab: 'problems', alias: null });
      return;
    }
    onNavigateToProblem(newValue);
  },
);

watch(
  () => props.problemInfo,
  (newValue) => {
    if (!newValue) {
      return;
    }
    currentNextSubmissionTimestamp.value =
      newValue.nextSubmissionTimestamp ?? null;
    currentNextExecutionTimestamp.value =
      newValue.nextExecutionTimestamp ?? null;
  },
);

watch(
  () => props.runDetailsData,
  (newValue) => {
    currentRunDetailsData.value = newValue ?? null;
  },
);

defineExpose({
  activeProblem,
  currentPopupDisplayed,
  feedbackMap: props.feedbackMap,
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.navleft {
  overflow: hidden;

  .navbar {
    width: 21em;
    float: left;
    background: transparent;
  }

  .main {
    margin-left: 20em;
    border: 1px solid var(--arena-contest-navleft-main-border-color);
    border-width: 0 0 1px 1px;
  }
}

.nav-tabs {
  .nav-link {
    background-color: var(--arena-contest-navtabs-link-background-color);
    border-top-color: var(--arena-contest-navtabs-link-border-top-color);
  }
}

.problem {
  background: var(--arena-problem-background-color);
  padding: 1em;
  margin-top: -1.5em;
  margin-right: -1em;
}
</style>

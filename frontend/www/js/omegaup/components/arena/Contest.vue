<template>
  <div>
    <!-- Show error UI when tab is blocked -->
    <div v-if="isBlocked" class="container mt-5">
      <div class="alert alert-danger text-center" role="alert">
        <h4 class="alert-heading">{{ T.arenaContestMultipleTabsDetected }}</h4>
        <p class="mb-0">{{ blockedMessage }}</p>
      </div>
    </div>

    <!-- Normal arena content when not blocked -->
    <OmegaupArena
      v-else
      :active-tab="activeTab"
      :title="ui.contestTitle(contest)"
      :clarifications="currentClarifications"
      :should-show-runs="contestAdmin"
      @update:activeTab="(selectedTab) => emit('update:activeTab', selectedTab)"
    >
      <template #socket-status>
        <sup :class="socketClass" :title="socketStatusTitle">{{
          socketStatus
        }}</sup>
      </template>
      <template v-if="contestAdmin" #edit-button>
        <a
          class="edit-contest-button ml-2"
          :href="`/contest/${contest.alias}/edit/`"
        >
          <FontAwesomeIcon icon="edit" />
        </a>
      </template>
      <template #clock>
        <div v-if="isContestFinished" class="alert alert-warning" role="alert">
          <a :href="urlPractice">{{ T.arenaContestEndedUsePractice }}</a>
        </div>
        <OmegaupCountdown
          v-show="!isContestStarted"
          :countdown-format="omegaup.CountdownFormat.ContestHasNotStarted"
          :target-time="contest.start_time"
          @finish="now = new Date()"
        ></OmegaupCountdown>
        <OmegaupCountdown
          v-show="isContestStarted"
          class="clock"
          :target-time="deadline"
          @finish="now = new Date()"
        ></OmegaupCountdown>
      </template>
      <template #arena-problems>
        <div data-contest>
          <div class="tab navleft">
            <div class="navbar mb-2">
              <OmegaupArenaNavbarProblems
                :problems="problems"
                :active-problem="activeProblemAlias"
                :in-assignment="false"
                :digits-after-decimal-point="
                  contest.score_mode == 'all_or_nothing'
                    ? 0
                    : digitsAfterDecimalPoint
                "
                @disable-active-problem="activeProblem = null"
                @navigate-to-problem="onNavigateToProblem"
              ></OmegaupArenaNavbarProblems>
              <OmegaupArenaNavbarMiniranking
                :users="miniRankingUsers"
                :show-ranking="true"
              ></OmegaupArenaNavbarMiniranking>
            </div>
            <OmegaupArenaSummary
              v-if="activeProblem === null"
              :title="ui.contestTitle(contest)"
              :description="contest.description"
              :start-time="contest.start_time"
              :finish-time="contest.finish_time"
              :scoreboard="contest.scoreboard"
              :window-length="contest.window_length"
              :admin="contest.director"
              :show-ranking="false"
            ></OmegaupArenaSummary>
            <div v-else class="problem main">
              <OmegaupProblemDetails
                :user="{ loggedIn: true, admin: false, reviewer: false }"
                :next-submission-timestamp="currentNextSubmissionTimestamp"
                :next-execution-timestamp="currentNextExecutionTimestamp"
                :languages="contest.languages.split(',')"
                :problem="problemInfo"
                :active-tab="'problems'"
                :runs="runs"
                :popup-displayed="popupDisplayed"
                :guid="guid"
                :run-details-data="currentRunDetailsData"
                :contest-alias="contest.alias"
                :is-contest-finished="isContestFinished"
                :in-contest-or-course="true"
                :use-new-verdict-table="false"
                @update:activeTab="
                  (selectedTab) =>
                    emit('reset-hash', {
                      selectedTab,
                      alias: activeProblemAlias,
                    })
                "
                @submit-run="onRunSubmitted"
                @execute-run="onRunExecuted"
                @show-run="onRunDetails"
                @new-submission-popup-displayed="
                  emit('new-submission-popup-displayed')
                "
              >
                <template #quality-nomination-buttons><div></div></template>
                <template #best-solvers-list><div></div></template>
              </OmegaupProblemDetails>
            </div>
          </div>
        </div>
      </template>
      <template #arena-scoreboard>
        <OmegaupArenaScoreboard
          :problems="problems"
          :ranking="ranking"
          :ranking-chart-options="rankingChartOptions"
          :last-updated="lastUpdated"
          :digits-after-decimal-point="digitsAfterDecimalPoint"
          :show-penalty="showPenalty"
          :show-invited-users-filter="
            contest.admission_mode !== AdmissionMode.Private
          "
          :show-all-contestants="
            contest.default_show_all_contestants_in_scoreboard
          "
        >
          <template #scoreboard-header><div></div></template>
        </OmegaupArenaScoreboard>
      </template>
      <template #arena-runs>
        <OmegaupArenaRuns
          v-if="contestAdmin"
          :contest-alias="contest.alias"
          :runs="allRuns"
          :total-runs="totalRuns"
          :show-all-runs="true"
          :show-contest="false"
          :show-problem="true"
          :show-details="true"
          :show-disqualify="true"
          :show-pager="true"
          :show-rejudge="true"
          :show-user="true"
          :problemset-problems="Object.values(problems)"
          :is-contest-finished="isContestFinished"
          :in-contest="true"
          :search-result-users="searchResultUsers"
          :search-result-problems="searchResultProblems"
          @details="(run) => onRunAdminDetails(run.guid)"
          @rejudge="(run) => emit('rejudge', run)"
          @disqualify="(request) => emit('disqualify', request)"
          @requalify="(run) => emit('requalify', run)"
          @update-search-result-users-contest="
            (request) => emit('update-search-result-users-contest', request)
          "
          @update-search-result-users="
            (request) => emit('update-search-result-users', request)
          "
          @filter-changed="(request) => emit('apply-filter', request)"
        >
          <template #title><div></div></template>
          <template #runs><div></div></template>
        </OmegaupArenaRuns>
        <OmegaupOverlay
          v-if="contestAdmin"
          :show-overlay="currentPopupDisplayed !== PopupDisplayed.None"
          @hide-overlay="onPopupDismissed"
        >
          <template #popup>
            <OmegaupArenaRundetailsPopup
              v-show="currentPopupDisplayed === PopupDisplayed.RunDetails"
              :data="currentRunDetailsData"
              @dismiss="onPopupDismissed"
            ></OmegaupArenaRundetailsPopup>
          </template>
        </OmegaupOverlay>
      </template>
      <template #arena-clarifications>
        <OmegaupArenaClarificationList
          :problems="problems"
          :users="users"
          :problem-alias="problems.length != 0 ? problems[0].alias : null"
          :username="
            contestAdmin && users.length != 0 ? users[0].username : null
          "
          :clarifications="currentClarifications"
          :is-admin="contestAdmin"
          :show-new-clarification-popup="showNewClarificationPopup"
          @new-clarification="
            (contestClarification) =>
              emit('new-clarification', {
                ...contestClarification,
                contestClarificationRequest: {
                  type: ContestClarificationType.AllProblems,
                  contestAlias: contest.alias,
                },
              })
          "
          @clarification-response="
            (response) =>
              emit('clarification-response', {
                contestAlias: contest.alias,
                clarification: response,
                contestClarificationRequest: {
                  type: ContestClarificationType.AllProblems,
                  contestAlias: contest.alias,
                },
              })
          "
          @update:activeTab="
            (selectedTab) => emit('update:activeTab', selectedTab)
          "
        ></OmegaupArenaClarificationList>
      </template>
    </OmegaupArena>
  </div>
</template>

<script setup lang="ts">
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as Highcharts from 'highcharts/highstock';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { types } from '../../api_types';
import { ContestClarificationType } from '../../arena/clarifications';
import { SocketStatus } from '../../arena/events_socket';
import { SubmissionRequest } from '../../arena/submissions';
import T from '../../lang';
import { omegaup } from '../../omegaup';
import * as ui from '../../ui';
import OmegaupArenaRundetailsPopup from '../arena/RunDetailsPopup.vue';
import { AdmissionMode } from '../common/Publish.vue';
import OmegaupCountdown from '../Countdown.vue';
import OmegaupOverlay from '../Overlay.vue';
import OmegaupProblemDetails, { PopupDisplayed } from '../problem/Details.vue';
import OmegaupArena from './Arena.vue';
import OmegaupArenaClarificationList from './ClarificationList.vue';
import OmegaupArenaNavbarMiniranking from './NavbarMiniranking.vue';
import OmegaupArenaNavbarProblems from './NavbarProblems.vue';
import OmegaupArenaRuns from './Runs.vue';
import OmegaupArenaScoreboard from './Scoreboard.vue';
import OmegaupArenaSummary from './Summary.vue';

library.add(fas);

const props = withDefaults(
  defineProps<{
    contest: types.ContestPublicDetails;
    contestAdmin?: boolean;
    problems: types.NavbarProblemsetProblem[];
    users?: types.ContestUser[];
    problem?: types.NavbarProblemsetProblem | null;
    problemInfo: types.ProblemInfo;
    clarifications?: types.Clarification[];
    isEphemeralExperimentEnabled?: boolean;
    showNavigation?: boolean;
    showRanking?: boolean;
    showClarifications?: boolean;
    showDeadlines?: boolean;
    showNewClarificationPopup?: boolean;
    popupDisplayed?: PopupDisplayed;
    activeTab: string;
    totalRuns: number;
    guid?: null | string;
    miniRankingUsers: omegaup.UserRank[];
    ranking: types.ScoreboardRankingEntry[];
    rankingChartOptions: Highcharts.Options;
    lastUpdated: Date;
    submissionDeadline: Date;
    digitsAfterDecimalPoint?: number;
    showPenalty?: boolean;
    socketStatus?: SocketStatus;
    runs?: types.Run[];
    allRuns?: null | types.Run[];
    searchResultUsers: types.ListItem[];
    runDetailsData?: null | types.RunDetails;
    nextSubmissionTimestamp?: Date | null;
    nextExecutionTimestamp?: Date | null;
    lockdown?: boolean;
    shouldShowFirstAssociatedIdentityRunWarning?: boolean;
    isBlocked?: boolean;
    blockedMessage?: string | null;
  }>(),
  {
    contestAdmin: false,
    users: () => [],
    problem: null,
    clarifications: () => [],
    isEphemeralExperimentEnabled: false,
    showNavigation: true,
    showRanking: false,
    showClarifications: true,
    showDeadlines: true,
    showNewClarificationPopup: false,
    popupDisplayed: PopupDisplayed.None,
    guid: null,
    digitsAfterDecimalPoint: 2,
    showPenalty: true,
    socketStatus: SocketStatus.Waiting,
    runs: () => [],
    allRuns: null,
    runDetailsData: null,
    nextSubmissionTimestamp: null,
    nextExecutionTimestamp: null,
    lockdown: false,
    shouldShowFirstAssociatedIdentityRunWarning: false,
    isBlocked: false,
    blockedMessage: null,
  },
);

const emit = defineEmits<{
  (e: 'update:activeTab', selectedTab: string): void;
  (
    e: 'navigate-to-problem',
    payload: { problem: types.NavbarProblemsetProblem },
  ): void;
  (
    e: 'submit-run',
    payload: {
      code: string;
      language: string;
      problem: types.NavbarProblemsetProblem | null;
      target: object;
    },
  ): void;
  (e: 'execute-run', payload: { target: object }): void;
  (
    e: 'show-run',
    payload: { guid: string; hash: string; isAdmin: boolean },
  ): void;
  (e: 'new-submission-popup-displayed'): void;
  (
    e: 'reset-hash',
    payload: { selectedTab: string; alias: string | null },
  ): void;
  (e: 'rejudge', run: types.Run): void;
  (e: 'disqualify', request: unknown): void;
  (e: 'requalify', run: types.Run): void;
  (e: 'update-search-result-users-contest', request: unknown): void;
  (e: 'update-search-result-users', request: unknown): void;
  (e: 'apply-filter', request: unknown): void;
  (e: 'new-clarification', payload: unknown): void;
  (e: 'clarification-response', payload: unknown): void;
}>();

const currentClarifications = ref(props.clarifications);
const activeProblem = ref<types.NavbarProblemsetProblem | null>(props.problem);
const currentNextSubmissionTimestamp = ref(props.nextSubmissionTimestamp);
const currentNextExecutionTimestamp = ref(props.nextExecutionTimestamp);
const currentRunDetailsData = ref(props.runDetailsData);
const now = ref(new Date());
const currentPopupDisplayed = ref(props.popupDisplayed);

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

const activeProblemAlias = computed((): null | string => {
  return activeProblem.value?.alias ?? null;
});

const deadline = computed((): Date => {
  return props.submissionDeadline || props.contest.finish_time;
});

const isContestFinished = computed((): boolean => {
  return deadline.value < now.value;
});

const isContestStarted = computed((): boolean => {
  return props.contest.start_time < now.value;
});

const urlPractice = computed((): string => {
  return `/arena/${props.contest.alias}/practice/`;
});

const searchResultProblems = computed((): types.ListItem[] => {
  if (!props.problems.length) {
    return [];
  }
  return props.problems.map((problem) => ({
    key: problem.alias,
    value: problem.text,
  }));
});

function confirmLeave(): boolean {
  return window.confirm(T.lockdownMessageWarning);
}

function beforeWindowUnload(e: BeforeUnloadEvent): void {
  if (!confirmLeave()) {
    e.preventDefault();
    e.returnValue = true;
  }
}

function onNavigateToProblem(problem: types.NavbarProblemsetProblem): void {
  activeProblem.value = problem;
  emit('navigate-to-problem', { problem });
}

function onRunSubmitted(request: { code: string; language: string }): void {
  emit('submit-run', {
    ...request,
    problem: activeProblem.value,
    target: {},
  });
}

function onRunExecuted(): void {
  emit('execute-run', { target: {} });
}

function onRunAdminDetails(guid: string): void {
  emit('show-run', {
    guid,
    hash: `#runs/all/show-run:${guid}`,
    isAdmin: props.contestAdmin,
  });
  currentPopupDisplayed.value = PopupDisplayed.RunDetails;
}

function onRunDetails(request: SubmissionRequest): void {
  emit('show-run', {
    ...request,
    hash: `#problems/${activeProblemAlias.value}/show-run:${request.guid}`,
    isAdmin: props.contestAdmin,
  });
}

function onPopupDismissed(): void {
  currentPopupDisplayed.value = PopupDisplayed.None;
  currentRunDetailsData.value = null;
  emit('reset-hash', { selectedTab: 'runs', alias: null });
}

// created() logic
if (props.lockdown) {
  window.addEventListener('beforeunload', beforeWindowUnload);
}

onBeforeUnmount(() => {
  if (props.lockdown) {
    window.removeEventListener('beforeunload', beforeWindowUnload);
  }
});

watch(
  () => props.problem,
  (newValue) => {
    if (!newValue) {
      activeProblem.value = null;
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
  () => props.clarifications,
  (newValue) => {
    currentClarifications.value = newValue;
  },
);

watch(
  () => props.runDetailsData,
  (newValue) => {
    currentRunDetailsData.value = newValue ?? null;
  },
);
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.navleft {
  overflow: hidden;

  .navbar {
    background: transparent;
    justify-content: center;
  }

  .main {
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
}

@media only screen and (min-width: 960px) {
  .navleft {
    .navbar {
      width: 21em;
      float: left;
    }
    .main {
      margin-left: 20em;
    }
  }
  .problem {
    margin-top: -1.5em;
    margin-right: -1em;
  }
}
</style>

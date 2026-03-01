<template>
  <OmegaupArena
    :active-tab="activeTab"
    :title="contest.title"
    :should-show-runs="contestAdmin"
    :background-class="'practice'"
    @update:activeTab="(selectedTab) => emit('update:activeTab', selectedTab)"
  >
    <template #arena-problems>
      <div data-contest-practice>
        <div class="tab navleft">
          <div class="navbar">
            <OmegaupArenaNavbarProblems
              :problems="problems"
              :active-problem="activeProblemAlias"
              :in-assignment="false"
              :digits-after-decimal-point="digitsAfterDecimalPoint"
              @disable-active-problem="activeProblem = null"
              @navigate-to-problem="onNavigateToProblem"
            ></OmegaupArenaNavbarProblems>
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
              :problem="problemInfo"
              :active-tab="'problems'"
              :runs="runs"
              :popup-displayed="popupDisplayed"
              :guid="guid"
              :problem-alias="problemAlias"
              :contest-alias="contest.alias"
              :in-contest-or-course="true"
              :run-details-data="currentRunDetailsData"
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
      <div class="card">
        <div class="card-body">
          <OmegaupMarkdown
            :markdown="
              ui.formatString(T.arenaContestPracticeOriginalScoreboardText, {
                contestAlias: contest.alias,
              })
            "
          ></OmegaupMarkdown>
        </div>
      </div>
    </template>
    <template #arena-runs>
      <div class="card">
        <div class="card-body">
          <OmegaupMarkdown
            :markdown="
              ui.formatString(T.arenaContestPracticeOriginalRunsText, {
                contestAlias: contest.alias,
              })
            "
          ></OmegaupMarkdown>
        </div>
      </div>
    </template>
    <template #arena-clarifications>
      <OmegaupArenaClarificationList
        :problems="problems"
        :users="users"
        :problem-alias="problems.length != 0 ? problems[0].alias : null"
        :username="contestAdmin && users.length != 0 ? users[0].username : null"
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
        @clarification-response="onClarificationResponse"
        @update:activeTab="
          (selectedTab) => emit('update:activeTab', selectedTab)
        "
      ></OmegaupArenaClarificationList>
    </template>
  </OmegaupArena>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { types } from '../../api_types';
import * as ui from '../../ui';
import T from '../../lang';
import OmegaupArena from './Arena.vue';
import OmegaupArenaClarificationList from './ClarificationList.vue';
import OmegaupArenaNavbarProblems from './NavbarProblems.vue';
import OmegaupArenaSummary from './Summary.vue';
import OmegaupMarkdown from '../Markdown.vue';
import OmegaupProblemDetails, { PopupDisplayed } from '../problem/Details.vue';
import { ContestClarificationType } from '../../arena/clarifications';
import { SubmissionRequest } from '../../arena/submissions';

const props = withDefaults(
  defineProps<{
    contest: types.ContestPublicDetails;
    contestAdmin: boolean;
    problems: types.NavbarProblemsetProblem[];
    users?: types.ContestUser[];
    problem?: types.NavbarProblemsetProblem | null;
    problemInfo: types.ProblemInfo;
    clarifications?: types.Clarification[];
    isEphemeralExperimentEnabled?: boolean;
    showNewClarificationPopup?: boolean;
    popupDisplayed?: PopupDisplayed;
    activeTab: string;
    guid?: null | string;
    problemAlias?: null | string;
    runs?: types.Run[];
    runDetailsData?: null | types.RunDetails;
    nextSubmissionTimestamp?: Date | null;
    nextExecutionTimestamp?: Date | null;
    shouldShowFirstAssociatedIdentityRunWarning?: boolean;
  }>(),
  {
    users: () => [],
    problem: null,
    clarifications: () => [],
    isEphemeralExperimentEnabled: false,
    showNewClarificationPopup: false,
    popupDisplayed: PopupDisplayed.None,
    guid: null,
    problemAlias: null,
    runs: () => [],
    runDetailsData: null,
    nextSubmissionTimestamp: null,
    nextExecutionTimestamp: null,
    shouldShowFirstAssociatedIdentityRunWarning: false,
  },
);

const emit = defineEmits<{
  (e: 'update:activeTab', selectedTab: string): void;
  (
    e: 'navigate-to-problem',
    value: { problem: types.NavbarProblemsetProblem },
  ): void;
  (
    e: 'submit-run',
    value: {
      code: string;
      language: string;
      problem: types.NavbarProblemsetProblem | null;
      target: Record<string, never>;
    },
  ): void;
  (e: 'execute-run', value: { target: Record<string, never> }): void;
  (e: 'show-run', value: SubmissionRequest & { hash: string }): void;
  (e: 'new-submission-popup-displayed'): void;
  (e: 'reset-hash', value: { selectedTab: string; alias: string | null }): void;
  (e: 'new-clarification', value: unknown): void;
  (e: 'clarification-response', value: unknown): void;
}>();

const currentClarifications = ref(props.clarifications);
const activeProblem = ref<types.NavbarProblemsetProblem | null>(props.problem);
const currentNextSubmissionTimestamp = ref(props.nextSubmissionTimestamp);
const currentNextExecutionTimestamp = ref(props.nextExecutionTimestamp);
const currentRunDetailsData = ref(props.runDetailsData);

const activeProblemAlias = computed((): null | string => {
  return activeProblem.value?.alias ?? null;
});

const digitsAfterDecimalPoint = computed((): number => {
  return props.contest.score_mode !== 'all_or_nothing' ? 2 : 0;
});

function onNavigateToProblem(problem: types.NavbarProblemsetProblem): void {
  activeProblem.value = problem;
  emit('navigate-to-problem', { problem });
}

function onRunSubmitted(run: { code: string; language: string }): void {
  emit('submit-run', {
    ...run,
    problem: activeProblem.value,
    target: {},
  });
}

function onRunDetails(request: SubmissionRequest): void {
  emit('show-run', {
    ...request,
    hash: `#problems/${activeProblemAlias.value}/show-run:${request.guid}`,
  });
}

function onClarificationResponse(response: types.Clarification): void {
  emit('clarification-response', {
    contestAlias: props.contest.alias,
    clarification: response,
    contestClarificationRequest: {
      type: ContestClarificationType.AllProblems,
      contestAlias: props.contest.alias,
    },
  });
}

function onRunExecuted(): void {
  emit('execute-run', { target: {} });
}

watch(
  () => props.problem,
  (newValue: types.NavbarProblemsetProblem | null) => {
    if (!newValue) {
      activeProblem.value = null;
      return;
    }
    onNavigateToProblem(newValue);
  },
);

watch(
  () => props.problemInfo,
  (newValue: types.ProblemInfo | null) => {
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
  (newValue: types.Clarification[]) => {
    currentClarifications.value = newValue;
  },
);

watch(
  () => props.runDetailsData,
  (newValue: types.RunDetails | null) => {
    currentRunDetailsData.value = newValue ?? null;
  },
);
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
.navleft {
  overflow: hidden;
}

.navleft .navbar {
  background: transparent;
}

.navleft .main {
  border: 1px solid var(--arena-contest-navleft-main-border-color);
  border-width: 0 0 1px 1px;
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

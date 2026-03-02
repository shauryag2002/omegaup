<template>
  <div class="mt-4">
    <ul v-if="shouldShowTabs" class="nav justify-content-center nav-tabs">
      <li
        v-for="tab in availableTabs"
        :key="tab.name"
        class="nav-item"
        role="tablist"
      >
        <a
          :href="`#${tab.name}`"
          class="nav-link"
          data-toggle="tab"
          role="tab"
          :aria-controls="tab.name"
          :class="{ active: selectedTab === tab.name }"
          :aria-selected="selectedTab === tab.name"
          @click="onTabSelected(tab.name)"
        >
          {{ tab.text }}
          <span
            v-if="tab.name === 'clarifications'"
            class="clarifications-count"
            :class="{ 'font-weight-bold': hasUnreadClarifications }"
            >{{ clarificationsCount }}</span
          >
        </a>
      </li>
    </ul>
    <div class="tab-content">
      <div
        v-if="problem"
        class="tab-pane fade py-4 p-lg-4"
        :class="{ 'show active': selectedTab === 'problems' }"
      >
        <OmegaupProblemSettingsSummary
          :problem="problem"
          :show-visibility-indicators="showVisibilityIndicators"
          :show-edit-link="user.admin"
          :user-logged-in="user.loggedIn"
          :is-bookmarked="bookmarkedStatus"
          :in-contest-or-course="inContestOrCourse"
          @toggle-bookmark="
            (problemAlias) => emit('toggle-bookmark', problemAlias)
          "
        ></OmegaupProblemSettingsSummary>

        <div v-if="problem.karel_problem" class="karel-js-link my-3">
          <a
            class="p-3"
            :href="`/karel.js/${
              problem.sample_input ? `#mundo:${problem.sample_input}` : ''
            }`"
            target="_blank"
          >
            {{ T.openInKarelJs }}
            <FontAwesomeIcon :icon="['fas', 'external-link-alt']" />
          </a>
        </div>

        <div class="mt-4 markdown">
          <OmegaupMarkdown
            ref="statementMarkdownRef"
            :markdown="problem.statement.markdown"
            :source-mapping="problem.statement.sources"
            :image-mapping="problem.statement.images"
            :problem-settings="problem.settings"
            @rendered="onProblemRendered"
          ></OmegaupMarkdown>
        </div>
        <hr class="my-3" />
        <div class="font-italic">
          {{ `${T.wordsSource}: ${problem.source}` }}
        </div>
        <template v-if="problem.problemsetter">
          <div>
            {{ T.wordsProblemsetter }}:
            <OmegaupUsername
              :classname="problem.problemsetter.classname"
              :username="problem.problemsetter.username"
              :name="problem.problemsetter.name"
              :linkify="true"
            ></OmegaupUsername>
          </div>
          <div>
            {{
              ui.formatString(T.wordsUploadedOn, {
                date: time.formatDate(problem.problemsetter.creation_date),
              })
            }}
          </div>
          <slot name="quality-nomination-buttons">
            <div v-if="visibilityOfPromotionButton">
              <button class="btn btn-link" @click="onNewPromotion">
                {{ T.qualityNominationRateProblem }}
              </button>
            </div>
            <div v-if="user.loggedIn">
              <button
                data-report-problem-button
                class="btn btn-link"
                @click="onReportInappropriateProblem"
              >
                {{ T.wordsReportProblem }}
              </button>
            </div>
            <div v-if="user.reviewer && !nominationStatus.alreadyReviewed">
              <button
                data-rate-problem-button
                class="btn btn-link"
                @click="onNewPromotionAsReviewer"
              >
                {{ T.reviewerNomination }}
              </button>
            </div>
          </slot>
        </template>
        <OmegaupOverlay
          v-if="user.loggedIn"
          :show-overlay="currentPopupDisplayed !== PopupDisplayed.None"
          @hide-overlay="onPopupDismissed"
        >
          <template #popup>
            <OmegaupArenaRunsubmitPopup
              v-show="currentPopupDisplayed === PopupDisplayed.RunSubmit"
              :preferred-language="preferredLanguage"
              :languages="filteredLanguages"
              :next-submission-timestamp="nextSubmissionTimestamp || new Date()"
              @dismiss="onPopupDismissed"
              @submit-run="onRunSubmitted"
            ></OmegaupArenaRunsubmitPopup>
            <OmegaupArenaRundetailsPopup
              v-show="currentPopupDisplayed === PopupDisplayed.RunDetails"
              :data="currentRunDetailsData"
              :feedback-map="feedbackMap"
              :feedback-thread-map="feedbackThreadMap"
              @dismiss="onPopupDismissed"
            >
              <template #feedback="data">
                <slot
                  name="feedback"
                  :feedback="data.feedback"
                  :guid="data.guid"
                  :is-admin="data.admin"
                ></slot>
              </template>
            </OmegaupArenaRundetailsPopup>
            <OmegaupQualityNominationPromotionPopup
              v-show="currentPopupDisplayed === PopupDisplayed.Promotion"
              :solved="nominationStatus && nominationStatus.solved"
              :tried="nominationStatus && nominationStatus.tried"
              @submit="(request) => emit('submit-promotion', request)"
              @dismiss="
                (qualityPromotionComponent, isDismissed) =>
                  onPopupPromotionDismissed(
                    qualityPromotionComponent,
                    isDismissed,
                  )
              "
            ></OmegaupQualityNominationPromotionPopup>
            <OmegaupQualityNominationDemotionPopup
              v-show="currentPopupDisplayed === PopupDisplayed.Demotion"
              @dismiss="currentPopupDisplayed = PopupDisplayed.None"
              @submit="
                (qualityDemotionComponent) =>
                  emit('submit-demotion', qualityDemotionComponent)
              "
            ></OmegaupQualityNominationDemotionPopup>
            <OmegaupQualityNominationReviewerPopup
              v-show="currentPopupDisplayed === PopupDisplayed.Reviewer"
              :allow-user-add-tags="allowUserAddTags"
              :level-tags="levelTags"
              :problem-level="problemLevel"
              :public-tags="publicTags"
              :selected-public-tags="selectedPublicTags"
              :selected-private-tags="selectedPrivateTags"
              :problem-alias="problem.alias"
              :problem-title="problem.title"
              @dismiss="currentPopupDisplayed = PopupDisplayed.None"
              @rate-problem-as-reviewer="
                (request) => emit('rate-problem-as-reviewer', request)
              "
            ></OmegaupQualityNominationReviewerPopup>
          </template>
        </OmegaupOverlay>
        <template v-if="problem.accepts_submissions">
          <div class="d-none d-sm-block">
            <OmegaupArenaEphemeralGrader
              v-if="!problem.karel_problem"
              :problem="problem"
              :can-submit="user.loggedIn && !inContestOrCourse"
              :accepted-languages="filteredLanguages"
              :preferred-language="preferredLanguage"
              :last-run="lastRun"
              :next-submission-timestamp="nextSubmissionTimestamp || new Date()"
              :next-execution-timestamp="nextExecutionTimestamp || new Date()"
              @execute-run="() => emit('execute-run')"
            ></OmegaupArenaEphemeralGrader>
          </div>
          <div class="bg-white text-center p-4 d-sm-none border">
            {{ T.ephemeralGraderAlert }}
          </div>
          <OmegaupArenaRuns
            v-if="!useNewVerdictTable"
            :problem-alias="problem.alias"
            :contest-alias="contestAlias"
            :runs="runsByProblem"
            :show-details="true"
            :problemset-problems="[]"
            :request-feedback="requestFeedback"
            :is-contest-finished="isContestFinished"
            @request-feedback="(guid) => emit('request-feedback', guid)"
            @details="(request) => onRunDetails(request, 'problems')"
            @update-search-result-users-contest="
              (request) => emit('update-search-result-users-contest', request)
            "
            @update-search-result-users="
              (request) => emit('update-search-result-users', request)
            "
            @new-submission="onNewSubmission"
          >
            <template #title>
              <div></div>
            </template>
            <template #runs>
              <div></div>
            </template>
          </OmegaupArenaRuns>
          <OmegaupArenaRunsForCourses
            v-else
            :problem-alias="problem.alias"
            :contest-alias="contestAlias"
            :runs="runsByProblem"
            :show-details="true"
            :problemset-problems="[]"
            :created-guid="createdGuid"
            :next-submission-timestamp="nextSubmissionTimestamp || new Date()"
            :request-feedback="requestFeedback"
            :is-contest-finished="isContestFinished"
            @request-feedback="(guid) => emit('request-feedback', guid)"
            @details="(request) => onRunDetails(request, 'problems')"
            @update-search-result-users-contest="
              (request) => emit('update-search-result-users-contest', request)
            "
            @update-search-result-users="
              (request) => emit('update-search-result-users', request)
            "
            @new-submission="onNewSubmission"
          >
            <template #title>
              <div></div>
            </template>
            <template #runs>
              <div></div>
            </template>
          </OmegaupArenaRunsForCourses>
        </template>
        <OmegaupProblemFeedback
          :quality-histogram="parsedQualityHistogram"
          :difficulty-histogram="parsedDifficultyHistogram"
          :quality-score="histogramQuality"
          :difficulty-score="histogramDifficulty"
        ></OmegaupProblemFeedback>
        <slot name="best-solvers-list">
          <OmegaupArenaSolvers
            v-if="problem.accepts_submissions"
            :solvers="solvers"
          ></OmegaupArenaSolvers>
        </slot>
      </div>
      <div
        class="tab-pane fade p-4"
        :class="{ 'show active': selectedTab === 'runs' }"
      >
        <OmegaupArenaRuns
          v-if="!useNewVerdictTable"
          :show-all-runs="true"
          :runs="allRuns"
          :show-details="true"
          :show-user="true"
          :show-rejudge="true"
          :show-pager="true"
          :show-disqualify="true"
          :problemset-problems="[]"
          :search-result-users="searchResultUsers"
          :search-result-problems="searchResultProblems"
          :total-runs="totalRuns"
          @details="(request) => onRunDetails(request, 'runs')"
          @rejudge="(run) => emit('rejudge', run)"
          @disqualify="(run) => emit('disqualify', run)"
          @requalify="(run) => emit('requalify', run)"
          @filter-changed="(request) => emit('apply-filter', request)"
          @update-search-result-users-contest="
            (request) => emit('update-search-result-users-contest', request)
          "
          @update-search-result-problems="
            (request) => emit('update-search-result-problems', request)
          "
          @update-search-result-users="
            (request) => emit('update-search-result-users', request)
          "
        >
          <template #title>
            <div></div>
          </template>
          <template #runs>
            <div></div>
          </template>
        </OmegaupArenaRuns>
        <OmegaupArenaRunsForCourses
          v-else
          :show-all-runs="true"
          :runs="allRuns"
          :show-details="true"
          :show-user="true"
          :show-rejudge="true"
          :show-filters="true"
          :show-disqualify="true"
          :items-per-page="100"
          :problemset-problems="[]"
          :search-result-users="searchResultUsers"
          :search-result-problems="searchResultProblems"
          :total-runs="totalRuns"
          @details="(request) => onRunDetails(request, 'runs')"
          @rejudge="(run) => emit('rejudge', run)"
          @disqualify="(run) => emit('disqualify', run)"
          @requalify="(run) => emit('requalify', run)"
          @filter-changed="(request) => emit('apply-filter', request)"
          @update-search-result-users-contest="
            (request) => emit('update-search-result-users-contest', request)
          "
          @update-search-result-problems="
            (request) => emit('update-search-result-problems', request)
          "
          @update-search-result-users="
            (request) => emit('update-search-result-users', request)
          "
        >
          <template #title>
            <div></div>
          </template>
          <template #runs>
            <div></div>
          </template>
        </OmegaupArenaRunsForCourses>
        <OmegaupOverlay
          v-if="user.loggedIn"
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
      </div>
      <div
        class="tab-pane fade p-4"
        :class="{ 'show active': selectedTab === 'clarifications' }"
      >
        <OmegaupArenaClarificationList
          :clarifications="currentClarifications"
          :in-contest="false"
          :is-admin="true"
          @clarification-response="onClarificationResponse"
        >
          <template #new-clarification>
            <div></div>
          </template>
        </OmegaupArenaClarificationList>
      </div>
      <div
        class="tab-pane fade p-4"
        :class="{ 'show active': selectedTab === 'solution' }"
      >
        <OmegaupProblemSolution
          :status="solutionStatus"
          :allowed-solutions-to-see="allowedSolutionsToSee"
          :solution="solution"
          @get-solution="emit('get-solution')"
          @get-allowed-solutions="emit('get-allowed-solutions')"
          @unlock-solution="emit('unlock-solution')"
        >
        </OmegaupProblemSolution>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export interface Tab {
  name: string;
  text: string;
}

export enum PopupDisplayed {
  None,
  RunSubmit,
  RunDetails,
  Promotion,
  Demotion,
  Reviewer,
}
export default {};
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as time from '../../time';
import * as ui from '../../ui';
import OmegaupArenaClarificationList from '../arena/ClarificationList.vue';
import OmegaupArenaEphemeralGrader from '../arena/EphemeralGrader.vue';
import OmegaupArenaRuns from '../arena/Runs.vue';
import OmegaupArenaRunsForCourses from '../arena/RunsForCourses.vue';
import OmegaupArenaRunsubmitPopup from '../arena/RunSubmitPopup.vue';
import OmegaupArenaRundetailsPopup from '../arena/RunDetailsPopup.vue';
import OmegaupArenaSolvers from '../arena/Solvers.vue';
import OmegaupProblemFeedback from './Feedback.vue';
import OmegaupProblemSettingsSummary from './SettingsSummary.vue';
import OmegaupQualityNominationDemotionPopup from '../qualitynomination/DemotionPopup.vue';
import OmegaupQualityNominationPromotionPopup from '../qualitynomination/PromotionPopup.vue';
import OmegaupQualityNominationReviewerPopup from '../qualitynomination/ReviewerPopup.vue';
import OmegaupUsername from '../user/Username.vue';
import OmegaupMarkdown from './ProblemMarkdown.vue';
import OmegaupOverlay from '../Overlay.vue';
import OmegaupProblemSolution from './Solution.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faEdit,
  faExclamationTriangle,
  faEyeSlash,
  faBan,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { SubmissionRequest } from '../../arena/submissions';
import { ArenaCourseFeedback } from '../arena/Feedback.vue';
library.add(
  faExclamationTriangle,
  faEdit,
  faEyeSlash,
  faBan,
  faExternalLinkAlt,
);

const props = withDefaults(
  defineProps<{
    allRuns?: types.Run[];
    clarifications?: types.Clarification[];
    problem: types.ProblemInfo;
    solvers: types.BestSolvers[];
    user: types.UserInfoForProblem;
    nominationStatus: types.NominationStatus;
    solutionStatus: string;
    solution?: types.ProblemStatement | null;
    runs: types.Run[];
    allowedSolutionsToSee?: number;
    histogram: types.Histogram;
    popupDisplayed?: PopupDisplayed;
    activeTab: string;
    allowUserAddTags: boolean;
    levelTags: string[];
    problemLevel: string;
    publicTags: string[];
    selectedPublicTags: string[];
    selectedPrivateTags: string[];
    hasBeenNominated: boolean;
    inContestOrCourse?: boolean;
    runDetailsData?: types.RunDetails | null;
    guid?: null | string;
    createdGuid?: null | string;
    problemAlias?: null | string;
    isAdmin?: boolean;
    showVisibilityIndicators?: boolean;
    nextSubmissionTimestamp?: null | Date;
    nextExecutionTimestamp?: null | Date;
    shouldShowTabs?: boolean;
    isContestFinished?: boolean;
    contestAlias?: string | null;
    searchResultUsers: types.ListItem[];
    searchResultProblems: types.ListItem[];
    languages?: null | string[];
    totalRuns: number;
    requestFeedback?: boolean;
    feedbackMap?: Map<number, ArenaCourseFeedback>;
    feedbackThreadMap?: Map<number, ArenaCourseFeedback>;
    useNewVerdictTable?: boolean;
    bookmarkedStatus?: boolean;
  }>(),
  {
    allRuns: () => [],
    clarifications: () => [],
    solution: null,
    allowedSolutionsToSee: 0,
    popupDisplayed: PopupDisplayed.None,
    inContestOrCourse: false,
    runDetailsData: null,
    guid: null,
    createdGuid: null,
    problemAlias: null,
    isAdmin: false,
    showVisibilityIndicators: false,
    shouldShowTabs: false,
    isContestFinished: false,
    contestAlias: null,
    languages: null,
    requestFeedback: false,
    feedbackMap: () => new Map<number, ArenaCourseFeedback>(),
    feedbackThreadMap: () => new Map<number, ArenaCourseFeedback>(),
    useNewVerdictTable: true,
    bookmarkedStatus: false,
  },
);

const emit = defineEmits<{
  (e: 'toggle-bookmark', problemAlias: string): void;
  (e: 'submit-promotion', request: unknown): void;
  (
    e: 'dismiss-promotion',
    qualityPromotionComponent: InstanceType<
      typeof OmegaupQualityNominationPromotionPopup
    >,
    isDismissed: boolean,
  ): void;
  (e: 'submit-demotion', qualityDemotionComponent: unknown): void;
  (e: 'rate-problem-as-reviewer', request: unknown): void;
  (e: 'execute-run'): void;
  (e: 'request-feedback', guid: string): void;
  (e: 'show-run', data: object): void;
  (e: 'update-search-result-users-contest', request: unknown): void;
  (e: 'update-search-result-users', request: unknown): void;
  (e: 'new-submission-popup-displayed'): void;
  (e: 'redirect-login-page'): void;
  (e: 'submit-run', data: object): void;
  (e: 'clarification-response', data: object): void;
  (e: 'update:activeTab', tabName: string): void;
  (e: 'rejudge', run: types.Run): void;
  (e: 'disqualify', run: types.Run): void;
  (e: 'requalify', run: types.Run): void;
  (e: 'apply-filter', request: unknown): void;
  (e: 'update-search-result-problems', request: unknown): void;
  (e: 'get-solution'): void;
  (e: 'get-allowed-solutions'): void;
  (e: 'unlock-solution'): void;
}>();

const statementMarkdownRef = ref<InstanceType<typeof OmegaupMarkdown> | null>(
  null,
);

const selectedTab = ref(props.activeTab);
const currentClarifications = ref(props.clarifications);
const currentPopupDisplayed = ref(props.popupDisplayed);
const hasUnreadClarifications = ref(
  props.clarifications?.length > 0 && props.activeTab !== 'clarifications',
);
const currentRunDetailsData = ref(props.runDetailsData);

const availableTabs = computed((): Tab[] => {
  const tabs = [
    {
      name: 'problems',
      text: T.wordsProblem,
      visible: true,
    },
    {
      name: 'runs',
      text: T.wordsRuns,
      visible: props.user.admin,
    },
    {
      name: 'clarifications',
      text: T.wordsClarifications,
      visible: props.user.admin,
    },
    {
      name: 'solution',
      text: T.wordsSeeSolution,
      visible: true,
    },
  ];
  return tabs.filter((tab) => tab.visible);
});

const lastRun = computed((): types.Run | null => {
  const runs = runsByProblem.value;
  if (!runs?.length) {
    return null;
  }
  return runs.reduce(function (prev, current) {
    return prev && prev.time.getTime() > current.time.getTime()
      ? prev
      : current;
  });
});

const preferredLanguage = computed((): null | string => {
  if (!lastRun.value) {
    return props.problem.preferred_language ?? null;
  }
  return lastRun.value.language;
});

const clarificationsCount = computed((): string => {
  if (currentClarifications.value.length === 0) return '';
  if (currentClarifications.value.length > 9) return '(9+)';
  return `(${currentClarifications.value.length})`;
});

const visibilityOfPromotionButton = computed((): boolean => {
  return (
    (props.nominationStatus?.tried || props.nominationStatus?.solved) &&
    !props.hasBeenNominated
  );
});

const parsedQualityHistogram = computed((): null | number[] => {
  const qualityHistogram = props.histogram?.qualityHistogram;
  if (!qualityHistogram) {
    return null;
  }
  return JSON.parse(qualityHistogram);
});

const parsedDifficultyHistogram = computed((): null | number[] => {
  const difficultyHistogram = props.histogram?.difficultyHistogram;
  if (!difficultyHistogram) {
    return null;
  }
  return JSON.parse(difficultyHistogram);
});

const histogramQuality = computed((): number => {
  return props.histogram?.quality ?? 0;
});

const histogramDifficulty = computed((): number => {
  return props.histogram?.difficulty ?? 0;
});

const runsByProblem = computed((): types.Run[] => {
  return props.runs.filter((run) => run.alias === props.problem.alias);
});

const filteredLanguages = computed((): string[] => {
  if (!props.languages) {
    return props.problem.languages;
  }
  const languagesSet = new Set(props.languages);
  return props.problem.languages.filter((language) =>
    languagesSet.has(language),
  );
});

function onNewSubmission(): void {
  if (!props.user.loggedIn) {
    emit('redirect-login-page');
    return;
  }
  currentPopupDisplayed.value = PopupDisplayed.RunSubmit;
  emit('new-submission-popup-displayed');
}

function onRunDetails(request: SubmissionRequest, tab: string): void {
  currentPopupDisplayed.value = PopupDisplayed.RunDetails;
  emit('show-run', {
    ...request,
    hash: `#${tab}/${props.problemAlias}/show-run:${request.guid}`,
    isAdmin: props.isAdmin,
  });
}

function onNewPromotion(): void {
  if (!props.user.loggedIn) {
    emit('redirect-login-page');
    return;
  }
  currentPopupDisplayed.value = PopupDisplayed.Promotion;
}

function onNewPromotionAsReviewer(): void {
  currentPopupDisplayed.value = PopupDisplayed.Reviewer;
}

function onReportInappropriateProblem(): void {
  currentPopupDisplayed.value = PopupDisplayed.Demotion;
}

function onPopupDismissed(): void {
  currentPopupDisplayed.value = PopupDisplayed.None;
  currentRunDetailsData.value = null;
  emit('update:activeTab', selectedTab.value);
}

function onPopupPromotionDismissed(
  qualityPromotionComponent: InstanceType<
    typeof OmegaupQualityNominationPromotionPopup
  >,
  isDismissed: boolean,
): void {
  onPopupDismissed();
  emit('dismiss-promotion', qualityPromotionComponent, isDismissed);
}

function onProblemRendered(): void {
  // TODO: We should probably refactor how the Markdown component is handled,
  // one for problems (with MathJax and the problem-specific logic) and another
  // for all other uses.
  //
  // It might be better for all of these things, plus the Markdown templating
  // system altogether to be replaced by the Markdown Vue component be able
  // to inject Vue components into the DOM after it's being rendered, so that
  // all the templating and interactivity can be handled by Vue instead of by
  // JavaScript.
  const libinteractiveInterfaceNameElement = statementMarkdownRef.value?.$el.querySelector(
    'span.libinteractive-interface-name',
  ) as HTMLElement | null;
  if (
    libinteractiveInterfaceNameElement &&
    props.problem.settings?.interactive?.module_name
  ) {
    libinteractiveInterfaceNameElement.innerText = props.problem.settings.interactive.module_name.replace(
      /\.idl$/,
      '',
    );
  }

  const outputOnlyDownloadElement = statementMarkdownRef.value?.$el.querySelector(
    '.output-only-download a',
  );
  if (outputOnlyDownloadElement) {
    outputOnlyDownloadElement.setAttribute(
      'href',
      `/probleminput/${props.problem.alias}/${props.problem.commit}/${props.problem.alias}-input.zip`,
    );
  }

  const libinteractiveDownloadFormElement = statementMarkdownRef.value?.$el.querySelector(
    '.libinteractive-download form',
  ) as HTMLElement | null;
  if (libinteractiveDownloadFormElement) {
    libinteractiveDownloadFormElement.addEventListener('submit', (e: Event) => {
      e.preventDefault();

      const form = e.target as HTMLElement;
      const alias = props.problem.alias;
      const commit = props.problem.commit;
      const os = (form.querySelector('.download-os') as HTMLInputElement)
        ?.value;
      const lang = (form.querySelector('.download-lang') as HTMLInputElement)
        ?.value;
      const extension = os == 'unix' ? '.tar.bz2' : '.zip';

      ui.navigateTo(
        `${window.location.protocol}//${window.location.host}/templates/${alias}/${commit}/${alias}_${os}_${lang}${extension}`,
      );
    });
  }

  const libinteractiveDownloadLangElement = statementMarkdownRef.value?.$el.querySelector(
    '.libinteractive-download .download-lang',
  ) as HTMLSelectElement | null;
  if (libinteractiveDownloadLangElement) {
    libinteractiveDownloadLangElement.addEventListener('change', (e: Event) => {
      let form = e.target as HTMLElement;
      while (!form.classList.contains('libinteractive-download')) {
        if (!form.parentElement) {
          return;
        }
        form = form.parentElement;
      }
      (form.querySelector(
        '.libinteractive-extension',
      ) as HTMLElement).innerText = libinteractiveDownloadLangElement.value;
    });
  }
}

function onRunSubmitted(code: string, selectedLanguage: string): void {
  emit('submit-run', {
    code,
    language: selectedLanguage,
    runs: props.runs,
    nominationStatus: props.nominationStatus,
  });
  onPopupDismissed();
}

function onClarificationResponse(response: types.Clarification): void {
  emit('clarification-response', {
    clarification: response,
    target: {},
  });
}

function onTabSelected(tabName: string): void {
  if (selectedTab.value === 'clarifications') {
    hasUnreadClarifications.value = false;
  }
  selectedTab.value = tabName;
  emit('update:activeTab', selectedTab.value);
}

watch(
  () => props.clarifications,
  (newValue: types.Clarification[]) => {
    currentClarifications.value = newValue;
  },
);

watch(
  () => props.popupDisplayed,
  (newValue: PopupDisplayed) => {
    currentPopupDisplayed.value = newValue;
    if (newValue === PopupDisplayed.None) return;
    if (newValue === PopupDisplayed.RunSubmit) {
      onNewSubmission();
      return;
    }
    if (newValue === PopupDisplayed.Promotion) {
      ui.reportEvent('quality-nomination', 'shown');
      return;
    }
  },
);

watch(currentClarifications, (newValue: types.Clarification[]) => {
  if (selectedTab.value === 'clarifications' || newValue.length === 0) return;
  hasUnreadClarifications.value = true;
});

watch(
  () => props.runDetailsData,
  (newValue: types.RunDetails | null) => {
    currentRunDetailsData.value = newValue;
  },
);
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

table td {
  padding: 0.5rem;
}

.karel-js-link {
  border: 1px solid var(--arena-problem-details-karel-link-border-color);
  border-left: 0;
  border-radius: 3px;

  a {
    border-left: 5px solid
      var(--arena-problem-details-karel-link-border-left-color);
    display: block;
  }
}
</style>

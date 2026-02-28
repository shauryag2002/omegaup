<template>
  <div class="card">
    <div class="card-body">
      <div class="text-center">
        <h2>{{ ui.contestTitle(contest) }}</h2>
        <div>
          <span>{{ contest.start_time.long() }}</span>
          <span>-</span>
          <span>{{ contest.finish_time.long() }}</span>
        </div>

        <template
          v-if="isLoggedIn && !shouldShowModalToLoginWithRegisteredIdentity"
        >
          <!-- Wait for contest start -->
          <div v-if="now < contest.start_time.getTime()">
            <OmegaupCountdown
              :target-time="contest.start_time"
              :countdown-format="omegaup.CountdownFormat.ContestHasNotStarted"
              @finish="now = Date.now()"
            ></OmegaupCountdown>
          </div>

          <div v-if="now > contest.start_time.getTime()">
            <form
              v-if="
                contest.admission_mode !== 'registration' ||
                contest.user_registration_accepted
              "
              @submit.prevent="onStartContest"
            >
              <p
                v-if="
                  !needsBasicInformation && requestsUserInformation === 'no'
                "
              >
                {{ T.aboutToStart }}
              </p>
              <OmegaupMarkdown
                v-if="needsBasicInformation"
                :markdown="T.contestBasicInformationNeeded"
              >
              </OmegaupMarkdown>
              <ul
                v-if="needsBasicInformation"
                :class="['list-unstyled', 'text-muted', 'font-weight-light']"
              >
                <li>
                  {{ T.wordsCountry }}:
                  <span :class="userInfoStatus.country">
                    {{ userBasicInformation.country ? '✔️' : '❌' }}
                  </span>
                </li>
                <li>
                  {{ T.profileState }}:
                  <span :class="userInfoStatus.state">
                    {{ userBasicInformation.state ? '✔️' : '❌' }}
                  </span>
                </li>
                <li>
                  {{ T.wordsSchool }}:
                  <span :class="userInfoStatus.school">
                    {{ userBasicInformation.school ? '✔️' : '❌' }}
                  </span>
                </li>
              </ul>

              <template v-if="requestsUserInformation !== 'no'">
                <OmegaupMarkdown
                  :markdown="(statement && statement.markdown) || ''"
                ></OmegaupMarkdown>
                <p>
                  <label>
                    <input
                      v-model="shareUserInformation"
                      type="radio"
                      :value="true"
                    />
                    {{ T.wordsYes }}
                  </label>
                  <label>
                    <input
                      v-model="shareUserInformation"
                      type="radio"
                      :value="false"
                    />
                    {{ T.wordsNo }}
                  </label>
                </p>
              </template>
              <button
                type="submit"
                data-start-contest
                :disabled="isButtonDisabled"
                class="btn btn-primary"
              >
                {{ T.startContest }}
              </button>
            </form>

            <!-- Must register -->
            <form
              v-else
              @submit.prevent="emit('request-access', contest.alias)"
            >
              <template v-if="!contest.user_registration_requested">
                <p>{{ T.mustRegisterToJoinContest }}</p>
                <button type="submit" class="btn btn-primary btn-lg">
                  {{ T.registerForContest }}
                </button>
              </template>
              <!-- Registration pending -->
              <div v-else-if="!contest.user_registration_answered">
                <p>{{ T.registrationPending }}</p>
              </div>
              <!-- Registration denied -->
              <div v-else-if="!contest.user_registration_accepted">
                <p>{{ T.registrationDenied }}</p>
                <p>
                  {{
                    ui.formatString(T.registrationRejectionFeedback, {
                      extra_note: contest.extra_note,
                    })
                  }}
                </p>
              </div>
            </form>
          </div>
        </template>

        <template v-else-if="shouldShowModalToLoginWithRegisteredIdentity">
          <div class="card">
            <div class="card-body">
              <p>{{ T.contestIntroLogoutToJoinWithRegisteredUser }}</p>
              <a href="/" class="card-link">{{ T.contestIntroGoToHomePage }}</a>
              <a :href="logoutLink" class="card-link">{{
                T.contestIntroLogout
              }}</a>
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Must login to do anything -->
          <div class="card">
            <div class="card-body">
              <p>{{ T.mustLoginToJoinContest }}</p>
              <a :href="redirectURL" class="btn btn-primary">{{
                T.loginHeader
              }}</a>
            </div>
          </div>
        </template>
      </div>
      <hr />
      <div>
        <h3 class="ml-4">{{ T.registerForContestChallenges }}</h3>
        <OmegaupMarkdown :markdown="contest.description"></OmegaupMarkdown>
      </div>
      <div>
        <h3 class="ml-4">{{ T.registerForContestRules }}</h3>
        <ul>
          <li v-if="contest.show_scoreboard_after">
            {{ T.contestNewFormScoreboardAtContestEnd }}
          </li>
          <li v-if="contest.window_length !== null">
            {{ differentStartsDescription }}
          </li>
          <li v-if="scoreboardDescription !== ''">
            {{ scoreboardDescription }}
          </li>
          <li v-if="contest.submissions_gap !== 0">
            {{ submissionsGapDescription }}
          </li>
          <li v-if="contest.penalty_type !== 'none'">
            {{ penaltyTypes[contest.penalty_type] }}
          </li>
          <li v-if="contest.penalty !== 0">{{ penaltyDescription }}</li>
          <li v-if="contest.feedback !== 'none'">
            {{ feedbackTypes[contest.feedback] }}
          </li>
          <li v-if="contest.points_decay_factor !== 0">
            {{ pointsDecayDescription }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import { omegaup } from '../../omegaup';
import OmegaupCountdown from '../Countdown.vue';
import OmegaupMarkdown from '../Markdown.vue';

const props = withDefaults(
  defineProps<{
    contest: types.ContestAdminDetails;
    isLoggedIn: boolean;
    requestsUserInformation: string;
    needsBasicInformation: boolean;
    statement: types.PrivacyStatement;
    shouldShowModalToLoginWithRegisteredIdentity?: boolean;
    userBasicInformation: types.UserBasicInformation;
  }>(),
  {
    shouldShowModalToLoginWithRegisteredIdentity: false,
  },
);

const emit = defineEmits<{
  (e: 'open-contest', request: types.ConsentStatement): void;
  (e: 'request-access', alias: string): void;
}>();

const penaltyTypes: Record<string, string> = {
  none: T.contestNewFormNoPenalty,
  problem_open: T.contestNewFormByProblem,
  contest_start: T.contestNewFormByContests,
  runtime: T.contestNewFormByRuntime,
};
const feedbackTypes: Record<string, string> = {
  detailed: T.contestNewFormImmediateFeedbackDesc,
  none: '',
  summary: T.contestNewFormImmediateSummaryFeedbackDesc,
};
const shareUserInformation = ref<boolean | null>(null);
const now = ref(Date.now());

const redirectURL = computed((): string => {
  const url = encodeURIComponent(window.location.pathname);
  return `/login/?redirect=${url}`;
});

const logoutLink = computed((): string => {
  const url = encodeURIComponent(window.location.pathname);
  return `/logout/?redirect=${url}`;
});

const differentStartsDescription = computed((): string => {
  return ui.formatString(T.contestIntroDifferentStarts, {
    window_length: formatTimeInRules(props.contest?.window_length ?? 0),
  });
});

const scoreboardDescription = computed((): string => {
  const contest = props.contest;
  if (!contest.scoreboard || !contest.finish_time || !contest.start_time) {
    return '';
  }
  if (contest.scoreboard === 100) {
    return T.contestIntroScoreboardTimePercentOneHundred;
  }
  if (contest.scoreboard === 0) {
    return T.contestIntroScoreboardTimePercentZero;
  }
  const minutesPercentage = Math.floor(
    (contest.scoreboard / 100) *
      ((contest.finish_time.getTime() - contest.start_time.getTime()) / 60000),
  );
  return ui.formatString(T.contestIntroScoreboardTimePercent, {
    window_length: formatTimeInRules(minutesPercentage),
  });
});

const submissionsGapDescription = computed((): string => {
  if (!props.contest.submissions_gap) {
    return '';
  }
  return ui.formatString(T.contestIntroSubmissionsSeparationDesc, {
    window_length: formatTimeInRules(props.contest.submissions_gap / 60),
  });
});

const penaltyDescription = computed((): string => {
  return ui.formatString(T.contestIntroPenaltyDesc, {
    window_length: formatTimeInRules(props.contest.penalty),
  });
});

const pointsDecayDescription = computed((): string => {
  return ui.formatString(T.contestNewFormDecrementFactor, {
    window_length: props.contest.points_decay_factor,
  });
});

const isButtonDisabled = computed((): boolean => {
  return (
    props.needsBasicInformation ||
    (shareUserInformation.value === null &&
      props.requestsUserInformation !== 'no') ||
    (props.requestsUserInformation === 'required' &&
      !shareUserInformation.value)
  );
});

const userInfoStatus = computed(() => {
  return {
    country: props.userBasicInformation?.country
      ? 'text-success'
      : 'text-danger',
    state: props.userBasicInformation?.state ? 'text-success' : 'text-danger',
    school: props.userBasicInformation?.school ? 'text-success' : 'text-danger',
  };
});

function formatTimeInRules(timeInMinutes?: number): string {
  if (!timeInMinutes) {
    return '';
  }
  const hours = Math.floor(timeInMinutes / 60);
  if (hours <= 0) {
    return `${timeInMinutes}m`;
  }
  const minutes = timeInMinutes % 60;
  return `${hours}h${minutes}m`;
}

function onStartContest(): void {
  const request: types.ConsentStatement = {
    contest_alias: props.contest.alias,
    share_user_information: shareUserInformation.value ?? false,
  };
  if (props.requestsUserInformation !== 'no') {
    request.privacy_git_object_id = props.statement.gitObjectId;
    request.statement_type = props.statement.statementType;
  }
  emit('open-contest', request);
}
</script>

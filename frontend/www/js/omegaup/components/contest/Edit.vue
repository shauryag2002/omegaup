<template>
  <div class="course-edit">
    <div class="page-header">
      <h1>
        {{
          ui.formatString(T.contestEditWithTitle, {
            title: ui.contestTitle(details),
          })
        }}
        <small>
          &ndash;
          <a :href="ui.contestURL(details)" data-contest-link-button>
            {{ T.contestDetailsGoToContest }}</a
          >
        </small>
      </h1>
    </div>

    <ul class="nav nav-pills mt-4">
      <li class="nav-item" role="presentation">
        <a
          v-if="!virtual"
          href="#new_form"
          data-contest-new-form
          class="nav-link"
          :class="{ active: showTab === 'new_form' }"
          @click="showTab = 'new_form'"
          >{{ T.contestEdit }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          v-if="!virtual"
          href="#problems"
          class="nav-link problems"
          :class="{ active: showTab === 'problems' }"
          @click="showTab = 'problems'"
          >{{ T.contestEditAddProblems }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          v-if="!virtual && !details.contest_for_teams"
          href="#publish"
          class="nav-link admission-mode"
          :class="{ active: showTab === 'publish' }"
          @click="showTab = 'publish'"
          >{{ T.contestNewFormAdmissionMode }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          v-if="
            originalContestAdmissionMode != 'private' &&
            !details.contest_for_teams
          "
          href="#contestants"
          data-nav-contestant
          class="nav-link contestants"
          :class="{ active: showTab === 'contestants' }"
          @click="showTab = 'contestants'"
          >{{ T.contestAdduserAddContestant }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          v-if="details.contest_for_teams"
          href="#groups"
          data-nav-group
          class="nav-link groups"
          :class="{ active: showTab === 'groups' }"
          @click="showTab = 'groups'"
          >{{ T.contestAddgroupAddGroup }}</a
        >
      </li>

      <li class="nav-item" role="presentation">
        <a
          v-if="!virtual"
          href="#admins"
          class="nav-link"
          :class="{ active: showTab === 'admins' }"
          @click="showTab = 'admins'"
          >{{ T.omegaupTitleContestAddAdmin }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          href="#links"
          class="nav-link"
          :class="{ active: showTab === 'links' }"
          @click="showTab = 'links'"
          >{{ T.showLinks }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          href="#clone"
          class="nav-link"
          :class="{ active: showTab === 'clone' }"
          @click="showTab = 'clone'"
          >{{ T.courseEditClone }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          href="#archive"
          class="nav-link"
          :class="{ active: showTab === 'archive' }"
          @click="showTab = 'archive'"
          >{{ T.contestEditArchive }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          v-if="certificatesDetails.isCertificateGenerator"
          href="#certificates"
          class="nav-link"
          :class="{ active: showTab === 'certificates' }"
          @click="showTab = 'certificates'"
          >{{ T.contestEditCertificates }}</a
        >
      </li>
    </ul>

    <div class="tab-content mt-2">
      <div v-if="showTab === 'new_form'" class="tab-pane active">
        <OmegaupContestNewForm
          :admission-mode="details.admission_mode"
          :default-show-all-contestants-in-scoreboard="
            details.default_show_all_contestants_in_scoreboard
          "
          :initial-alias="details.alias"
          :initial-title="details.title"
          :initial-description="details.description"
          :initial-start-time="details.start_time"
          :initial-finish-time="details.finish_time"
          :initial-window-length="details.window_length"
          :initial-points-decay-factor="details.points_decay_factor"
          :initial-submissions-gap="details.submissions_gap"
          :initial-languages="details.languages"
          :initial-feedback="details.feedback"
          :initial-penalty="details.penalty"
          :initial-scoreboard="details.scoreboard"
          :initial-penalty-type="details.penalty_type"
          :initial-show-scoreboard-after="details.show_scoreboard_after"
          :score-mode="details.score_mode"
          :initial-needs-basic-information="details.needs_basic_information"
          :initial-requests-user-information="details.requests_user_information"
          :all-languages="details.available_languages"
          :teams-group-alias="teamsGroupAlias"
          :contest-for-teams="details.contest_for_teams"
          :has-submissions="details.has_submissions"
          :update="true"
          :search-result-teams-groups="searchResultTeamsGroups"
          :problems="problems"
          :can-set-recommended="details.canSetRecommended"
          :initial-recommended="details.recommended"
          :invalid-parameter-name="invalidParameterName"
          @update-search-result-teams-groups="
            (query) => emit('update-search-result-teams-groups', query)
          "
          @update-contest="(contest) => emit('update-contest', contest)"
          @language-remove-blocked="
            (language) => emit('language-remove-blocked', language)
          "
        ></OmegaupContestNewForm>
      </div>
      <div v-if="showTab === 'problems'" class="tab-pane active">
        <OmegaupContestAddProblem
          :contest-alias="details.alias"
          :initial-points="details.score_mode !== 'all_or_nothing' ? 100 : 1"
          :initial-problems="problems"
          :search-result-problems="searchResultProblems"
          @add-problem="(request) => emit('add-problem', request)"
          @update-search-result-problems="
            (request) => emit('update-search-result-problems', request)
          "
          @get-versions="(request) => emit('get-versions', request)"
          @remove-problem="
            (problemAlias) => emit('remove-problem', problemAlias)
          "
          @runs-diff="
            (problemAlias, versions, selectedCommit) =>
              emit('runs-diff', problemAlias, versions, selectedCommit)
          "
        >
        </OmegaupContestAddProblem>
      </div>
      <div v-if="showTab === 'publish'" class="tab-pane active">
        <OmegaupCommonPublish
          :default-show-all-contestants-in-scoreboard="
            details.default_show_all_contestants_in_scoreboard
          "
          :admission-mode="details.admission_mode"
          :should-show-public-option="true"
          :admission-mode-description="T.contestAdmissionModeDescription"
          :alias="details.alias"
          @show-copy-message="() => emit('show-copy-message')"
          @update-admission-mode="
            (request) => emit('update-admission-mode', request)
          "
        ></OmegaupCommonPublish>
      </div>
      <div v-if="showTab === 'contestants'" class="tab-pane active contestants">
        <OmegaupContestAddContestant
          :contest="details"
          :users="users"
          :search-result-users="searchResultUsers"
          @add-user="(contestants) => emit('add-user', contestants)"
          @update-search-result-users="
            (query) => emit('update-search-result-users', query)
          "
          @remove-user="(contestant) => emit('remove-user', contestant)"
          @save-end-time="(user) => emit('save-end-time', user)"
        ></OmegaupContestAddContestant>
        <OmegaupCommonRequests
          :data="requests"
          :text-add-participant="T.contestAdduserAddContestant"
          @accept-request="(request) => emit('accept-request', request)"
          @deny-request="(request) => emit('deny-request', request)"
        ></OmegaupCommonRequests>
        <OmegaupContestGroups
          :groups="groups"
          :search-result-groups="searchResultGroups"
          @update-search-result-groups="
            (query) => emit('update-search-result-groups', query)
          "
          @emit-add-group="(groupAlias) => emit('add-group', groupAlias)"
          @emit-remove-group="(groupAlias) => emit('remove-group', groupAlias)"
        ></OmegaupContestGroups>
      </div>
      <div v-if="showTab === 'groups'" class="tab-pane active groups">
        <OmegaupContestTeamsGroups
          :teams-group="teamsGroup"
          :search-result-teams-groups="searchResultTeamsGroups"
          :has-submissions="details.has_submissions"
          @update-search-result-teams-groups="
            (query) => emit('update-search-result-teams-groups', query)
          "
          @replace-teams-group="
            (request) => emit('replace-teams-group', request)
          "
        ></OmegaupContestTeamsGroups>
      </div>
      <div v-if="showTab === 'admins'" class="tab-pane active">
        <OmegaupCommonAdmins
          :admins="admins"
          :search-result-users="searchResultUsers"
          @add-admin="(username) => emit('add-admin', username)"
          @remove-admin="(username) => emit('remove-admin', username)"
          @update-search-result-users="
            (query) => emit('update-search-result-users', query)
          "
        ></OmegaupCommonAdmins>
        <div class="mt-2"></div>
        <OmegaupCommonGroupAdmins
          :group-admins="groupAdmins"
          :search-result-groups="searchResultGroups"
          @add-group-admin="(groupAlias) => emit('add-group-admin', groupAlias)"
          @remove-group-admin="
            (groupAlias) => emit('remove-group-admin', groupAlias)
          "
          @update-search-result-groups="
            (query) => emit('update-search-result-groups', query)
          "
        ></OmegaupCommonGroupAdmins>
      </div>
      <div v-if="showTab === 'links'" class="tab-pane active">
        <OmegaupContestLinks
          :data="details"
          @download-csv-scoreboard="
            (contestAlias) => emit('download-csv-scoreboard', contestAlias)
          "
        ></OmegaupContestLinks>
      </div>
      <div v-if="showTab === 'clone'" class="tab-pane active">
        <OmegaupContestClone
          @clone="
            ({ title, alias, description, startTime }) =>
              emit('clone-contest', title, alias, description, startTime)
          "
        ></OmegaupContestClone>
      </div>
      <div v-if="showTab === 'archive'" class="tab-pane active">
        <OmegaupCommonArchive
          :already-archived="alreadyArchived"
          :archive-button-description="archiveButtonDescription"
          :archive-confirm-text="T.contestEditArchiveConfirmText"
          :archive-header-title="T.contestEditArchiveContest"
          :archive-help-text="archiveUnarchiveDescription"
          @archive="onArchiveContest"
        ></OmegaupCommonArchive>
      </div>
      <div v-if="showTab === 'certificates'" class="tab-pane active">
        <OmegaupContestCertificates
          :certificates-details="certificatesDetails"
          @generate="
            (certificateCutoff) =>
              emit('generate-certificates', certificateCutoff)
          "
        ></OmegaupContestCertificates>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';

import OmegaupContestAddProblem from './AddProblem.vue';
import OmegaupContestAddContestant from './AddContestant.vue';
import OmegaupContestClone from './Clone.vue';
import OmegaupCommonAdmins from '../common/Admins.vue';
import OmegaupCommonArchive from '../common/Archive.vue';
import OmegaupCommonRequests from '../common/Requests.vue';
import OmegaupCommonGroupAdmins from '../common/GroupAdmins.vue';
import OmegaupContestGroups from './Groups.vue';
import OmegaupContestTeamsGroups from './TeamsGroup.vue';
import OmegaupContestLinks from './Links.vue';
import OmegaupContestNewForm from './Form.vue';
import OmegaupCommonPublish from '../common/Publish.vue';
import OmegaupContestCertificates from './Certificates.vue';

const props = withDefaults(
  defineProps<{
    admins: types.ContestAdmin[];
    details: types.ContestAdminDetails;
    initialTab: string;
    groups: types.ContestGroup[];
    groupAdmins: types.ContestGroupAdmin[];
    problems: types.ProblemsetProblemWithVersions[];
    requests: types.ContestRequest[];
    users: types.ContestUser[];
    searchResultProblems: types.ListItem[];
    searchResultUsers: types.ListItem[];
    teamsGroup: types.ContestGroup | null;
    searchResultTeamsGroups: types.ListItem[];
    searchResultGroups: types.ListItem[];
    originalContestAdmissionMode: null | string;
    certificatesDetails: types.ContestCertificatesAdminDetails;
    invalidParameterName: null | string;
  }>(),
  {
    originalContestAdmissionMode: null,
    invalidParameterName: null,
  },
);

const emit = defineEmits<{
  (e: 'update-search-result-teams-groups', query: string): void;
  (e: 'update-contest', contest: types.ContestAdminDetails): void;
  (e: 'language-remove-blocked', language: string): void;
  (e: 'add-problem', request: unknown): void;
  (e: 'update-search-result-problems', request: unknown): void;
  (e: 'get-versions', request: unknown): void;
  (e: 'remove-problem', problemAlias: string): void;
  (
    e: 'runs-diff',
    problemAlias: string,
    versions: unknown,
    selectedCommit: unknown,
  ): void;
  (e: 'show-copy-message'): void;
  (e: 'update-admission-mode', request: unknown): void;
  (e: 'add-user', contestants: unknown): void;
  (e: 'update-search-result-users', query: string): void;
  (e: 'remove-user', contestant: unknown): void;
  (e: 'save-end-time', user: unknown): void;
  (e: 'accept-request', request: unknown): void;
  (e: 'deny-request', request: unknown): void;
  (e: 'update-search-result-groups', query: string): void;
  (e: 'add-group', groupAlias: string): void;
  (e: 'remove-group', groupAlias: string): void;
  (e: 'replace-teams-group', request: unknown): void;
  (e: 'add-admin', username: string): void;
  (e: 'remove-admin', username: string): void;
  (e: 'add-group-admin', groupAlias: string): void;
  (e: 'remove-group-admin', groupAlias: string): void;
  (e: 'download-csv-scoreboard', contestAlias: string): void;
  (
    e: 'clone-contest',
    title: string,
    alias: string,
    description: string,
    startTime: unknown,
  ): void;
  (e: 'archive-contest', alias: string, archive: boolean): void;
  (e: 'generate-certificates', certificateCutoff: unknown): void;
}>();

function selectedTab(): string {
  if (props.initialTab != '') {
    return props.initialTab;
  }
  if (!ui.isVirtual(props.details)) {
    return 'new_form';
  }
  if (props.originalContestAdmissionMode != 'private') {
    return 'contestants';
  }
  return 'links';
}

const virtual = ref(ui.isVirtual(props.details));
const showTab = ref(selectedTab());
const alreadyArchived = ref(props.details.archived);

const activeTab = computed((): string => {
  switch (showTab.value) {
    case 'new_form':
      return T.contestEdit;
    case 'problems':
      return T.contestEditAddProblems;
    case 'publish':
      return T.contestNewFormAdmissionMode;
    case 'contestants':
      return T.contestAdduserAddContestant;
    case 'groups':
      return T.contestAddgroupAddGroup;
    case 'admins':
      return T.omegaupTitleContestAddAdmin;
    case 'links':
      return T.showLinks;
    case 'clone':
      return T.courseEditClone;
    case 'archive':
      return T.contestEditArchive;
    case 'certificates':
      return T.contestEditCertificates;
    default:
      return T.contestEdit;
  }
});

const archiveButtonDescription = computed((): string => {
  if (alreadyArchived.value) {
    return T.contestEditUnarchiveContest;
  }
  return T.contestEditArchiveContest;
});

const archiveUnarchiveDescription = computed((): string => {
  if (alreadyArchived.value) {
    return T.contestEditUnarchiveHelpText;
  }
  return T.contestEditArchiveHelpText;
});

const teamsGroupAlias = computed((): null | types.ListItem => {
  if (!props.teamsGroup) {
    return null;
  }
  return { key: props.teamsGroup?.alias, value: props.teamsGroup.name };
});

function onArchiveContest(archive: boolean): void {
  emit('archive-contest', props.details.alias, archive);
  alreadyArchived.value = archive;
}
</script>

<template>
  <div data-teams-group-edit>
    <div class="page-header">
      <h2>
        {{ ui.formatString(T.teamsGroupEditTitleWithName, { name }) }}
      </h2>
    </div>
    <ul class="nav nav-pills mt-4">
      <li class="nav-item" role="presentation">
        <a
          :href="`#${AvailableTabs.Edit}`"
          class="nav-link"
          data-tab-edit
          :class="{ active: selectedTab === AvailableTabs.Edit }"
          @click="selectedTab = AvailableTabs.Edit"
          >{{ T.groupEditEdit }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          :href="`#${AvailableTabs.Teams}`"
          class="nav-link"
          data-tab-teams
          :class="{ active: selectedTab === AvailableTabs.Teams }"
          @click="selectedTab = AvailableTabs.Teams"
          >{{ T.teamsGroupEditTeams }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          :href="`#${AvailableTabs.Upload}`"
          class="nav-link"
          data-tab-identities
          :class="{ active: selectedTab === AvailableTabs.Upload }"
          @click="selectedTab = AvailableTabs.Upload"
          >{{ T.teamsGroupUploadIdentitiesAsTeams }}</a
        >
      </li>
    </ul>

    <div class="tab-content">
      <div
        v-if="selectedTab === AvailableTabs.Edit"
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupTeamsGroupForm
          :name="name"
          :alias="alias"
          :description="description"
          :number-of-contestants="numberOfContestants"
          @update-teams-group="(request) => emit('update-teams-group', request)"
        ></OmegaupTeamsGroupForm>
      </div>

      <div
        v-if="selectedTab === AvailableTabs.Teams"
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupTeamsGroupTeams
          :teams="currentTeamsIdentities"
          :alias="alias"
          :countries="countries"
          :search-result-users="searchResultUsers"
          :search-result-schools="searchResultSchools"
          :teams-members="teamsMembers"
          @update-identity-team="
            (identity) => emit('update-identity-team', identity)
          "
          @update-search-result-users="
            (query) => emit('update-search-result-users', query)
          "
          @update-search-result-schools="
            (query) => emit('update-search-result-schools', query)
          "
          @edit-identity-team="(request) => emit('edit-identity-team', request)"
          @change-password-identity-team="
            (request) => emit('change-password-identity-team', request)
          "
          @change-password-identity="
            (request) => emit('change-password-identity', request)
          "
          @add-members="(request) => emit('add-members', request)"
          @remove-member="(request) => emit('remove-member', request)"
          @remove="(name) => emit('remove', name)"
          @cancel="(teamComponent) => emit('cancel', teamComponent)"
        ></OmegaupTeamsGroupTeams>
      </div>

      <div
        v-if="selectedTab === AvailableTabs.Upload"
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupTeamsGroupUpload
          :team-error-row="teamErrorRow"
          :search-result-users="searchResultUsers"
          :number-of-contestants="numberOfContestants"
          :is-loading="isLoading"
          @bulk-identities="(identities) => emit('bulk-identities', identities)"
          @download-teams="(identities) => emit('download-teams', identities)"
          @read-csv="(source) => emit('read-csv', source)"
          @invalid-file="emit('invalid-file')"
          @update-search-result-users="
            (query) => emit('update-search-result-users', query)
          "
        ></OmegaupTeamsGroupUpload>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export enum AvailableTabs {
  Edit = 'edit',
  Teams = 'teams',
  Upload = 'upload',
}
export default {};
</script>

<script setup lang="ts">
import { ref, watch } from 'vue';
import OmegaupTeamsGroupForm from './FormUpdate.vue';
import OmegaupTeamsGroupUpload from './Upload.vue';
import OmegaupTeamsGroupTeams from './Teams.vue';
import T from '../../lang';
import { dao, types } from '../../api_types';
import * as ui from '../../ui';

const props = withDefaults(
  defineProps<{
    alias: string;
    name: string;
    description: string;
    numberOfContestants: number;
    countries: dao.Countries[];
    isOrganizer: boolean;
    tab: AvailableTabs;
    teamsIdentities?: types.Identity[];
    teamsMembers?: types.TeamMember[];
    teamErrorRow: string | null;
    searchResultUsers: types.ListItem[];
    searchResultSchools: types.SchoolListItem[];
    isLoading: boolean;
  }>(),
  {
    teamsIdentities: () => [],
    teamsMembers: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update-teams-group', request: any): void;
  (e: 'update-identity-team', identity: any): void;
  (e: 'update-search-result-users', query: string): void;
  (e: 'update-search-result-schools', query: string): void;
  (e: 'edit-identity-team', request: any): void;
  (e: 'change-password-identity-team', request: any): void;
  (e: 'change-password-identity', request: any): void;
  (e: 'add-members', request: any): void;
  (e: 'remove-member', request: any): void;
  (e: 'remove', name: string): void;
  (e: 'cancel', component: any): void;
  (e: 'bulk-identities', identities: any): void;
  (e: 'download-teams', identities: any): void;
  (e: 'read-csv', source: any): void;
  (e: 'invalid-file'): void;
}>();

const selectedTab = ref<AvailableTabs>(props.tab);
const currentTeamsIdentities = ref(props.teamsIdentities);
const isLoading = ref(props.isLoading);

watch(
  () => props.tab,
  (newValue) => {
    if (!Object.values(AvailableTabs).includes(props.tab)) {
      selectedTab.value = AvailableTabs.Teams;
      return;
    }
    selectedTab.value = newValue;
  },
);

watch(
  () => props.teamsIdentities,
  (newValue) => {
    currentTeamsIdentities.value = newValue;
  },
);
</script>

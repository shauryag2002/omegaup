<template>
  <div class="group-edit">
    <div class="page-header">
      <h2>
        {{ ui.formatString(T.groupEditTitleWithName, { name: groupName }) }}
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
          :href="`#${AvailableTabs.Members}`"
          class="nav-link"
          data-tab-members
          :class="{ active: selectedTab === AvailableTabs.Members }"
          @click="selectedTab = AvailableTabs.Members"
          >{{ T.groupEditMembers }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          :href="`#${AvailableTabs.Scoreboards}`"
          class="nav-link"
          data-tab-scoreboards
          :class="{ active: selectedTab === AvailableTabs.Scoreboards }"
          @click="selectedTab = AvailableTabs.Scoreboards"
          >{{ T.groupEditScoreboards }}</a
        >
      </li>
      <li class="nav-item" role="presentation">
        <a
          :href="`#${AvailableTabs.Identities}`"
          class="nav-link"
          data-tab-identities
          :class="{ active: selectedTab === AvailableTabs.Identities }"
          @click="selectedTab = AvailableTabs.Identities"
          >{{ T.groupCreateIdentities }}</a
        >
      </li>
    </ul>

    <div class="tab-content">
      <div
        v-if="selectedTab === AvailableTabs.Edit"
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupGroupForm
          :is-update="true"
          :group-name="groupName"
          :group-alias="groupAlias"
          :group-description="groupDescription"
          @update-group="
            (name, description) => emit('update-group', name, description)
          "
        ></OmegaupGroupForm>
      </div>

      <div
        v-if="selectedTab === AvailableTabs.Members"
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupGroupMembers
          :identities="currentIdentities"
          :identities-csv="currentIdentitiesCsv"
          :group-alias="groupAlias"
          :countries="countries"
          :search-result-users="searchResultUsers"
          :search-result-schools="searchResultSchools"
          @update-search-result-schools="
            (query) => emit('update-search-result-schools', query)
          "
          @add-member="
            (memberComponent, username) =>
              emit('add-member', memberComponent, username)
          "
          @edit-identity="
            (memberComponent, identity) =>
              emit('edit-identity', memberComponent, identity)
          "
          @edit-identity-member="
            (request) => emit('edit-identity-member', request)
          "
          @change-password-identity="
            (memberComponent, username) =>
              emit('change-password-identity', memberComponent, username)
          "
          @change-password-identity-member="
            (memberComponent, username, password, repeatPassword) =>
              emit(
                'change-password-identity-member',
                memberComponent,
                username,
                password,
                repeatPassword,
              )
          "
          @remove="(username) => emit('remove', username)"
          @cancel="(memberComponent) => emit('cancel', memberComponent)"
          @update-search-result-users="
            (query) => emit('update-search-result-users', query)
          "
        ></OmegaupGroupMembers>
      </div>

      <div
        v-if="selectedTab === AvailableTabs.Scoreboards"
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupGroupScoreboards
          :group-alias="groupAlias"
          :scoreboards="currentScoreboards"
          @create-scoreboard="
            (title, alias, description) =>
              emit('create-scoreboard', title, alias, description)
          "
        ></OmegaupGroupScoreboards>
      </div>

      <div
        v-if="selectedTab === AvailableTabs.Identities"
        class="tab-pane active"
        role="tabpanel"
      >
        <OmegaupGroupCreateIdentities
          :group-alias="groupAlias"
          :user-error-row="userErrorRow"
          :has-visited-section="hasVisitedSection"
          :is-organizer="isOrganizer"
          @bulk-identities="(identities) => emit('bulk-identities', identities)"
          @download-identities="
            (identities) => emit('download-identities', identities)
          "
          @read-csv="(source) => emit('read-csv', source)"
          @invalid-file="emit('invalid-file')"
        ></OmegaupGroupCreateIdentities>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export enum AvailableTabs {
  Edit = 'edit',
  Members = 'members',
  Scoreboards = 'scoreboards',
  Identities = 'identities',
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue';
import OmegaupGroupCreateIdentities from './Identities.vue';
import OmegaupGroupForm from './Form.vue';
import OmegaupGroupMembers from './Members.vue';
import OmegaupGroupScoreboards from './Scoreboards.vue';
import T from '../../lang';
import { dao, types } from '../../api_types';
import * as ui from '../../ui';

const props = defineProps<{
  groupAlias: string;
  groupDescription: string;
  groupName: string;
  countries: dao.Countries[];
  isOrganizer: boolean;
  tab: AvailableTabs;
  identities: types.Identity[];
  identitiesCsv: types.Identity[];
  scoreboards: types.GroupScoreboard[];
  userErrorRow: null | string;
  searchResultUsers: types.ListItem[];
  searchResultSchools: types.SchoolListItem[];
  hasVisitedSection: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-group', name: string, description: string): void;
  (e: 'update-search-result-schools', query: string): void;
  (e: 'add-member', component: any, username: string | undefined): void;
  (e: 'edit-identity', component: any, identity: types.Identity): void;
  (e: 'edit-identity-member', request: any): void;
  (e: 'change-password-identity', component: any, username: string): void;
  (
    e: 'change-password-identity-member',
    component: any,
    username: string,
    password: string,
    repeatPassword: string,
  ): void;
  (e: 'remove', username: string): void;
  (e: 'cancel', component: any): void;
  (e: 'update-search-result-users', query: string): void;
  (e: 'create-scoreboard', title: any, alias: any, description: any): void;
  (e: 'bulk-identities', identities: any): void;
  (e: 'download-identities', identities: any): void;
  (e: 'read-csv', source: any): void;
  (e: 'invalid-file'): void;
}>();

const selectedTab = ref<AvailableTabs>(props.tab);
const currentIdentities = ref(props.identities);
const currentIdentitiesCsv = ref(props.identitiesCsv);
const currentScoreboards = ref(props.scoreboards);

watch(
  () => props.tab,
  (newValue) => {
    if (!Object.values(AvailableTabs).includes(props.tab)) {
      selectedTab.value = AvailableTabs.Members;
      return;
    }
    selectedTab.value = newValue;
  },
);

watch(
  () => props.identities,
  (newValue) => {
    currentIdentities.value = newValue;
  },
);

watch(
  () => props.identitiesCsv,
  (newValue) => {
    currentIdentitiesCsv.value = newValue;
  },
);

watch(
  () => props.scoreboards,
  (newValue) => {
    currentScoreboards.value = newValue;
  },
);
</script>

<style scoped lang="scss">
@media (max-width: 576px) {
  h2 {
    text-align: center;
  }
}
</style>

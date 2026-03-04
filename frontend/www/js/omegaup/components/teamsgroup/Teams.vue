<template>
  <div class="card">
    <div v-if="teams.length === 0" class="empty-table-message py-2">
      {{ T.teamsGroupTeamsEmptyList }}
    </div>
    <table v-else class="table table-striped" data-table-identities>
      <thead>
        <tr>
          <th>{{ T.teamsGroupTeamName }}</th>
          <th>{{ T.profileName }}</th>
          <th>{{ T.profileCountry }}</th>
          <th>{{ T.profileState }}</th>
          <th>{{ T.profileSchool }}</th>
          <th>{{ T.wordsActions }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="identity in teams" :key="identity.username">
          <td>
            <OmegaupUserUsername
              :classname="identity.classname"
              :linkify="true"
              :username="identity.username"
            ></OmegaupUserUsername>
          </td>
          <td data-group-team-name>{{ identity.name }}</td>
          <td>
            {{ identity.country === 'xx' ? T.countryNotSet : identity.country }}
          </td>
          <td>{{ identity.state }}</td>
          <td>{{ identity.school }}</td>
          <td>
            <button
              class="btn btn-link"
              :data-edit-identity="identity.username"
              :title="T.groupEditMembersEdit"
              @click="onEdit(identity)"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
            </button>
            <button
              class="btn btn-link"
              :data-add-members-identity="identity.username"
              :title="T.groupEditMembersAddMembers"
              @click="onAddMembers(identity.username)"
            >
              <font-awesome-icon :icon="['fas', 'users']" />
            </button>
            <button
              class="btn btn-link"
              :data-remove-identity="identity.username"
              :title="T.groupEditMembersRemove"
              @click="emit('remove', identity.username)"
            >
              <font-awesome-icon :icon="['fas', 'trash-alt']" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <OmegaupIdentityEdit
      v-if="formToShow === AvailableForms.Edit"
      :countries="countries"
      :identity="identity"
      :search-result-schools="searchResultSchools"
      @update-search-result-schools="
        (query) => emit('update-search-result-schools', query)
      "
      @cancel="onCancel"
      @edit-identity-member="onEditIdentityTeam"
    ></OmegaupIdentityEdit>
    <OmegaupIdentityChangePassword
      v-if="formToShow === AvailableForms.ChangePassword"
      :username="username"
      @emit-cancel="onCancel"
      @emit-change-password="onChangePasswordTeam"
    ></OmegaupIdentityChangePassword>
    <OmegaupIdentityMembers
      v-if="formToShow === AvailableForms.AddMembers"
      :team-username="username"
      :teams-members="
        teamsMembers.filter((user) => user.team_alias === username)
      "
      :search-result-users="searchResultUsers"
      @update-search-result-users="
        (query) => emit('update-search-result-users', query)
      "
      @cancel="onCancel"
      @change-password-identity="
        (request) => emit('change-password-identity', request)
      "
      @add-members="(request) => emit('add-members', request)"
      @remove-member="(request) => emit('remove-member', request)"
    ></OmegaupIdentityMembers>
  </div>
</template>

<script lang="ts">
export enum AvailableForms {
  None,
  Edit,
  ChangePassword,
  AddMembers,
}
export default {};
</script>

<script setup lang="ts">
import { ref } from 'vue';
import { dao, types } from '../../api_types';
import T from '../../lang';
import OmegaupUserUsername from '../user/Username.vue';
import OmegaupIdentityEdit from '../identity/Edit.vue';
import OmegaupIdentityChangePassword from '../identity/ChangePassword.vue';
import OmegaupIdentityMembers from './Members.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faEdit,
  faLock,
  faTrashAlt,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
library.add(faEdit, faLock, faTrashAlt, faUsers);

const props = withDefaults(
  defineProps<{
    teams: types.Identity[];
    countries: Array<dao.Countries>;
    searchResultUsers: types.ListItem[];
    searchResultSchools: types.SchoolListItem[];
    teamsMembers?: types.TeamMember[];
  }>(),
  {
    teamsMembers: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update-identity-team', identity: types.Identity): void;
  (e: 'update-search-result-schools', query: string): void;
  (e: 'update-search-result-users', query: string): void;
  (
    e: 'edit-identity-team',
    response: { originalUsername: string; identity: types.Identity },
  ): void;
  (
    e: 'change-password-identity-team',
    request: {
      username: string | null;
      newPassword: string;
      newPasswordRepeat: string;
    },
  ): void;
  (e: 'change-password-identity', request: any): void;
  (e: 'add-members', request: any): void;
  (e: 'remove-member', request: any): void;
  (e: 'remove', name: string): void;
  (e: 'cancel', component: any): void;
}>();

const identity = ref<types.Identity | null>(null);
const username = ref<string | null>(null);
const formToShow = ref<AvailableForms>(AvailableForms.None);

function onEdit(ident: types.Identity): void {
  identity.value = ident;
  formToShow.value = AvailableForms.Edit;
  username.value = ident.username;
  emit('update-identity-team', identity.value);
}

function onChangePass(user: string): void {
  formToShow.value = AvailableForms.ChangePassword;
  username.value = user;
}

function onAddMembers(user: string): void {
  formToShow.value = AvailableForms.AddMembers;
  username.value = user;
}

function onChangePasswordTeam(
  newPassword: string,
  newPasswordRepeat: string,
): void {
  emit('change-password-identity-team', {
    username: username.value,
    newPassword,
    newPasswordRepeat,
  });
  onCancel();
}

function onEditIdentityTeam(response: {
  originalUsername: string;
  identity: types.Identity;
}): void {
  emit('edit-identity-team', response);
  onCancel();
}

function onCancel(): void {
  identity.value = null;
  formToShow.value = AvailableForms.None;
  username.value = null;
}
</script>

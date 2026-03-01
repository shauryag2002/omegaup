<template>
  <div class="card">
    <h5 class="card-title mx-2">
      {{
        ui.formatString(T.groupEditMembersTitle, {
          username: teamUsername,
        })
      }}
    </h5>
    <div class="card-body">
      <form class="form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label>{{ T.addUsersMultipleOrSingleUser }}</label>
          <OmegaupCommonMultiTypeahead
            :existing-options="searchResultUsers"
            v-model:value="typeaheadContestants"
            @update-existing-options="
              (query) => emit('update-search-result-users', query)
            "
          >
          </OmegaupCommonMultiTypeahead>
        </div>
        <button class="btn btn-primary" type="submit">
          {{ T.wordsAddMember }}
        </button>
        <button
          class="btn btn-secondary ml-2"
          type="reset"
          @click="emit('cancel')"
        >
          {{ T.wordsCancel }}
        </button>
      </form>
    </div>
    <table class="table table-striped" data-table-members>
      <thead>
        <tr>
          <th>{{ T.teamsGroupMembersAccountName }}</th>
          <th>{{ T.loginPassword }}</th>
          <th>{{ T.wordsActions }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="identity in teamsMembers" :key="identity.username">
          <td>
            <OmegaupUserUsername
              :classname="identity.classname"
              :linkify="true"
              :username="identity.username"
            ></OmegaupUserUsername>
          </td>
          <td v-if="!identity.isMainUserIdentity">
            <template
              v-if="
                changePasswordInputEnabled && username === identity.username
              "
            >
              <div class="input-group">
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  :placeholder="T.teamsGroupMemberChangePassword"
                />
                <button
                  type="button"
                  class="btn btn-link"
                  :data-save-new-password-identity="identity.username"
                  :title="T.groupEditMembersChangePassword"
                  @click="onChangePasswordMember"
                >
                  <font-awesome-icon :icon="['fas', 'save']" />
                </button>
              </div>
            </template>
            <input v-else type="password" value="password" disabled="true" />
          </td>
          <td v-else></td>
          <td>
            <button
              v-if="!identity.isMainUserIdentity"
              class="btn btn-link"
              :data-change-password-identity="identity.username"
              :title="T.groupEditMembersChangePassword"
              @click="onChangePass(identity.username)"
            >
              <font-awesome-icon :icon="['fas', 'lock']" />
            </button>
            <button
              class="btn btn-link"
              :data-table-remove-member="identity.username"
              :title="T.groupEditMembersRemove"
              @click="
                emit('remove-member', {
                  username: identity.username,
                  teamUsername,
                })
              "
            >
              <font-awesome-icon :icon="['fas', 'trash-alt']" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as ui from '../../ui';
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupUserUsername from '../user/Username.vue';
import OmegaupCommonMultiTypeahead from '../common/MultiTypeahead.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLock, faTrashAlt, faSave } from '@fortawesome/free-solid-svg-icons';
library.add(faLock, faTrashAlt, faSave);

const props = withDefaults(
  defineProps<{
    searchResultUsers: types.ListItem[];
    teamUsername: string;
    teamsMembers?: types.TeamMember[];
  }>(),
  {
    teamsMembers: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update-search-result-users', query: string): void;
  (
    e: 'add-members',
    request: { usersToAdd: string[]; teamUsername: string },
  ): void;
  (e: 'cancel'): void;
  (
    e: 'change-password-identity',
    request: { username: string | null; newPassword: string | null },
  ): void;
  (
    e: 'remove-member',
    request: { username: string; teamUsername: string },
  ): void;
}>();

const typeaheadContestants = ref<types.ListItem[] | null>(null);
const username = ref<string | null>(null);
const changePasswordInputEnabled = ref(false);
const password = ref<string | null>(null);

function onSubmit(): void {
  if (!typeaheadContestants.value) return;
  emit('add-members', {
    usersToAdd: typeaheadContestants.value.map((user) => user.key),
    teamUsername: props.teamUsername,
  });
  typeaheadContestants.value = null;
}

function onChangePass(user: string): void {
  changePasswordInputEnabled.value = true;
  username.value = user;
}

function onChangePasswordMember(): void {
  emit('change-password-identity', {
    username: username.value,
    newPassword: password.value,
  });
  changePasswordInputEnabled.value = false;
  username.value = null;
  password.value = null;
}
</script>

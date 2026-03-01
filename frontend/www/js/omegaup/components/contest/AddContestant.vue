<template>
  <div>
    <div class="card contestants-input-area">
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
          <button class="btn btn-primary user-add-typeahead" type="submit">
            {{ T.contestAdduserAddUsers }}
          </button>
          <hr />
          <div class="form-group">
            <!-- TODO: Replace word multiple user with ("Separados por espacio, coma, o salto de linea") -->
            <label>{{ T.wordsMultipleUser }}</label>
            <OmegaupMultiUserAddArea
              :users="currentUsers.map((user) => user.username)"
              @update-users="updateUsersList"
            ></OmegaupMultiUserAddArea>
          </div>
          <button class="btn btn-primary user-add-bulk" type="submit">
            {{ T.contestAdduserAddUsers }}
          </button>
        </form>
      </div>
      <table class="table table-striped mb-0 participants">
        <thead>
          <tr>
            <th class="text-center">{{ T.contestAddUserContestant }}</th>
            <th class="text-center">
              {{ T.contestAdduserRegisteredUserTime }}
            </th>
            <th v-if="contest.window_length !== null" class="text-center">
              {{ T.wordsEndTimeContest }}
            </th>
            <th class="text-center">
              {{ T.contestAdduserRegisteredUserDelete }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in currentUsers" :key="user.username">
            <td class="text-center" data-uploaded-contestants>
              <OmegaupUserUsername
                :linkify="true"
                :username="user.username"
              ></OmegaupUserUsername>
            </td>
            <td class="text-center">
              <template v-if="user.access_time !== null">
                {{ time.formatDateTime(user.access_time) }}
              </template>
            </td>
            <td v-if="contest.window_length !== null" class="text-center">
              <div v-if="user.end_time" class="row">
                <div class="col-xs-10">
                  <OmegaupDatetimepicker
                    v-model="user.end_time"
                    :finish="contest.finish_time"
                    :start="contest.start_time"
                  ></OmegaupDatetimepicker>
                </div>
                <div class="col-xs-2">
                  <button
                    class="btn btn-link"
                    @click="emit('save-end-time', user)"
                  >
                    <FontAwesomeIcon icon="save" />
                  </button>
                </div>
              </div>
            </td>
            <td class="text-center">
              <button
                class="close float-none"
                type="button"
                :title="T.contestAdduserRegisteredUserDelete"
                @click="emit('remove-user', user)"
              >
                ×
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { types } from '../../api_types';
import T from '../../lang';
import * as time from '../../time';
import OmegaupDatetimepicker from '../DateTimePicker.vue';
import OmegaupUserUsername from '../user/Username.vue';
import OmegaupCommonMultiTypeahead from '../common/MultiTypeahead.vue';
import OmegaupMultiUserAddArea from '../common/MultiUserAddArea.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const props = defineProps<{
  users: types.ContestUser[];
  contest: types.ContestAdminDetails;
  searchResultUsers: types.ListItem[];
}>();

const emit = defineEmits<{
  (e: 'add-user', users: string[]): void;
  (e: 'update-search-result-users', query: string): void;
  (e: 'save-end-time', user: types.ContestUser): void;
  (e: 'remove-user', user: types.ContestUser): void;
}>();

const bulkContestants = ref('');
const typeaheadContestants = ref<types.ListItem[]>([]);
const currentUsers = ref(props.users);

function onSubmit(): void {
  let users: string[] = [];
  // Add each token as a new username chip component
  if (bulkContestants.value !== '') {
    users = bulkContestants.value.split(',');
  }

  if (typeaheadContestants.value) {
    users = [...users, ...typeaheadContestants.value.map((user) => user.key)];
  }

  // If no users were added, do nothing
  if (users.length === 0) {
    return;
  }

  emit(
    'add-user',
    users.map((user) => user.trim()),
  );
}

// receives a list of users from the MultiUserAddArea component
function updateUsersList(users: string[]): void {
  bulkContestants.value = users.join(',');
}

watch(
  () => props.users,
  (newUsers) => {
    currentUsers.value = newUsers;
    typeaheadContestants.value = [];
    bulkContestants.value = '';
  },
);
</script>

<template>
  <div class="card">
    <div class="card-body">
      <form class="form" @submit.prevent="onAddMember">
        <div class="row">
          <div class="form-group col-md-9 mb-1 mt-1">
            <label class="d-inline">{{ T.wordsMember }}</label>
            <OmegaupCommonTypeahead
              :existing-options="searchResultUsers"
              :value.sync="searchedUsername"
              :max-results="10"
              class="input"
              @update-existing-options="
                (query) => emit('update-search-result-users', query)
              "
            ></OmegaupCommonTypeahead>
          </div>
          <div
            class="form-group mb-0 col-md-3 d-flex align-items-center mt-4 margin-phone"
          >
            <button class="btn btn-primary" type="submit">
              {{ T.wordsAddMember }}
            </button>
          </div>
        </div>
      </form>
    </div>
    <table class="table table-striped" data-table-members>
      <thead>
        <tr>
          <th>{{ T.groupEditMembersCoder }}</th>
          <th>{{ T.contestEditRegisteredAdminDelete }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="identity in identities" :key="identity.username">
          <td>
            <OmegaupUserUsername
              :classname="identity.classname"
              :linkify="true"
              :username="identity.username"
            ></OmegaupUserUsername>
          </td>
          <td>
            <button
              class="btn btn-link"
              :title="T.groupEditMembersRemove"
              @click="emit('remove', identity.username)"
            >
              <font-awesome-icon :icon="['fas', 'trash-alt']" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <table class="table table-striped responsive-table" data-table-identities>
      <thead>
        <tr>
          <th>{{ T.groupEditMembersCoder }}</th>
          <th>{{ T.wordsName }}</th>
          <th>{{ T.profileCountry }}</th>
          <th>{{ T.profileState }}</th>
          <th>{{ T.profileSchool }}</th>
          <th>{{ T.wordsActions }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="identity in identitiesCsv" :key="identity.username">
          <td data-members-username>
            <OmegaupUserUsername
              :classname="identity.classname"
              :linkify="true"
              :username="identity.username"
            ></OmegaupUserUsername>
          </td>
          <td>{{ identity.name }}</td>
          <td>{{ identity.country }}</td>
          <td>{{ identity.state }}</td>
          <td>{{ identity.school }}</td>
          <td>
            <button
              class="btn btn-link"
              :title="T.groupEditMembersEdit"
              @click="onEdit(identity)"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
            </button>
            <button
              data-identity-change-password
              class="btn btn-link"
              :title="T.groupEditMembersChangePassword"
              @click="onChangePass(identity.username)"
            >
              <font-awesome-icon :icon="['fas', 'lock']" />
            </button>
            <button
              class="btn btn-link"
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
      v-if="showEditForm"
      :countries="countries"
      :identity="identity"
      :search-result-schools="searchResultSchools"
      @cancel="onChildCancel"
      @edit-identity-member="
        (request) => emit('edit-identity-member', { ...request, showEditForm })
      "
      @update-search-result-schools="
        (query) => emit('update-search-result-schools', query)
      "
    ></OmegaupIdentityEdit>
    <OmegaupIdentityChangePassword
      v-if="showChangePasswordForm"
      :username="username"
      @emit-cancel="onChildCancel"
      @emit-change-password="onChildChangePasswordMember"
    ></OmegaupIdentityChangePassword>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue';
import { dao, types } from '../../api_types';
import T from '../../lang';
import OmegaupUserUsername from '../user/Username.vue';
import OmegaupIdentityEdit from '../identity/Edit.vue';
import OmegaupIdentityChangePassword from '../identity/ChangePassword.vue';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEdit, faLock, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
library.add(faEdit, faLock, faTrashAlt);

defineProps<{
  identities: types.Identity[];
  identitiesCsv: types.Identity[];
  groupAlias: string;
  countries: Array<dao.Countries>;
  searchResultUsers: types.ListItem[];
  searchResultSchools: types.SchoolListItem[];
}>();

const emit = defineEmits<{
  (e: 'update-search-result-users', query: string): void;
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
}>();

const identity = ref<any>({});
const username = ref('');
const showEditForm = ref(false);
const showChangePasswordForm = ref(false);
const searchedUsername = ref<types.ListItem | null>(null);

const componentProxy = {
  get showEditForm() {
    return showEditForm.value;
  },
  set showEditForm(v: boolean) {
    showEditForm.value = v;
  },
  get showChangePasswordForm() {
    return showChangePasswordForm.value;
  },
  set showChangePasswordForm(v: boolean) {
    showChangePasswordForm.value = v;
  },
  get identity() {
    return identity.value;
  },
  set identity(v: any) {
    identity.value = v;
  },
  get username() {
    return username.value;
  },
  set username(v: string) {
    username.value = v;
  },
  reset,
};

function onAddMember(): void {
  emit('add-member', componentProxy, searchedUsername.value?.key);
  reset();
}

function onEdit(ident: types.Identity): void {
  emit('edit-identity', componentProxy, ident);
}

function onChangePass(user: string): void {
  emit('change-password-identity', componentProxy, user);
}

function onChildChangePasswordMember(
  newPassword: string,
  newPasswordRepeat: string,
): void {
  emit(
    'change-password-identity-member',
    componentProxy,
    username.value,
    newPassword,
    newPasswordRepeat,
  );
}

function onChildCancel(): void {
  emit('cancel', componentProxy);
}

function reset(): void {
  searchedUsername.value = null;
}

defineExpose({
  showEditForm,
  showChangePasswordForm,
  identity,
  username,
  reset,
});
</script>

<style scoped lang="scss">
@media (max-width: 576px) {
  .input {
    width: 100%;
    max-width: 100%;
    margin-top: 0.6rem;
  }
  .responsive-table {
    width: 100%;
    overflow-x: auto;
    display: block;
  }
  .margin-phone {
    margin-top: 0.4rem !important;
  }
}
</style>

<template>
  <div class="omegaup-admin-user card">
    <div class="card-header">
      <h2 class="card-title">
        {{ T.omegaupTitleAdminUsers }} — {{ username }}
      </h2>
    </div>
    <div class="card-body">
      <form class="form bottom-margin" @submit.prevent="onChangePassword">
        <div class="row">
          <div class="col-md-12">
            <button
              class="btn"
              :class="{ 'btn-primary': !verified, 'btn-light': verified }"
              type="button"
              :disabled="verified"
              @click.prevent="onVerifyUser"
            >
              <span v-if="verified">
                <font-awesome-icon
                  icon="check-circle"
                  :style="{ color: 'green' }"
                />
                {{ T.userVerified }}</span
              ><span v-else>{{ T.userVerify }}</span>
            </button>
          </div>
        </div>
      </form>
      <h4>{{ T.userEmails }}</h4>
      <ul class="list-group">
        <li v-for="email in emails" :key="email" class="list-group-item">
          {{ email }}
        </li>
      </ul>
      <h4>{{ T.userRoles }}</h4>
      <table class="table">
        <tbody>
          <tr v-for="role in roleNames" :key="role.name">
            <td>
              <input
                type="checkbox"
                :checked="hasRole(role.name)"
                :disabled="role == 'Admin'"
                :class="role.name"
                @change.prevent="onChangeRole($event, role)"
              />
            </td>

            <td>{{ role.name }}</td>
          </tr>
        </tbody>
      </table>
      <h4>{{ T.wordsExperiments }}</h4>
      <table class="table">
        <tbody>
          <tr v-for="experiment in systemExperiments" :key="experiment.name">
            <td>
              <input
                type="checkbox"
                :checked="experiment.config || hasExperiment(experiment.name)"
                :disabled="experiment.config"
                @change.prevent="onChangeExperiment($event, experiment)"
              />
            </td>

            <td>{{ experiment.name }}</td>
            <td>{{ experiment.hash }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { omegaup } from '../../omegaup';
import T from '../../lang';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { types } from '../../api_types';
library.add(fas);

const props = defineProps<{
  emails: string[];
  username: string;
  verified: boolean;
  experiments: string[];
  systemExperiments: omegaup.Experiment[];
  roles: string[];
  roleNames: types.UserRole[];
}>();

const emit = defineEmits<{
  (
    e: 'change-experiment',
    payload: omegaup.Selectable<omegaup.Experiment>,
  ): void;
  (e: 'change-role', payload: omegaup.Selectable<types.UserRole>): void;
  (e: 'verify-user'): void;
}>();

function hasExperiment(experiment: string): boolean {
  return props.experiments.indexOf(experiment) !== -1;
}

function hasRole(role: string): boolean {
  return props.roles.indexOf(role) !== -1;
}

function onChangeExperiment(ev: Event, experiment: omegaup.Experiment): void {
  emit('change-experiment', {
    value: experiment,
    selected: (ev.target as HTMLInputElement).checked,
  });
}

function onChangeRole(ev: Event, role: types.UserRole): void {
  emit('change-role', {
    value: role,
    selected: (ev.target as HTMLInputElement).checked,
  });
}

function onVerifyUser(): void {
  emit('verify-user');
}

function onChangePassword(): void {
  // form submit handler - currently no-op (form has prevent default)
}
</script>

<template>
  <div class="card">
    <div class="text-white bg-primary card-header">
      <div class="card-title h4">
        {{ T.omegaupTitleSupportDashboard }}
        <span v-if="username != null">- {{ username }} ({{ email }})</span>
        <span v-else-if="contestAlias != null"
          >- {{ contestTitle }} ({{ contestAlias }})</span
        >
      </div>
    </div>
    <div class="card-body">
      <!-- Maintenance Mode Section -->
      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0">
                <font-awesome-icon icon="wrench" />
                {{ T.maintenanceModeTitle }}
              </h5>
            </div>
            <div class="card-body">
              <div class="form-group">
                <omegaup-toggle-switch
                  :checked-value="currentMaintenanceEnabled"
                  @update:value="onToggleMaintenance"
                >
                  <template #switch-text>
                    <span class="switch-text">
                      <strong>{{
                        currentMaintenanceEnabled
                          ? T.maintenanceModeActive
                          : T.maintenanceModeInactive
                      }}</strong>
                    </span>
                  </template>
                </omegaup-toggle-switch>
              </div>
              <div v-if="currentMaintenanceEnabled" class="form-group">
                <select
                  v-model="selectedTemplateId"
                  class="form-control mb-3"
                  @change="onSelectTemplate"
                >
                  <option value="">
                    -- {{ T.maintenanceModeTemplateSelectPlaceholder }} --
                  </option>
                  <option
                    v-for="template in maintenancePredefinedTemplates"
                    :key="template.id"
                    :value="template.id"
                  >
                    {{ template.title[preferredLanguage] }}
                  </option>
                  <option value="custom">
                    {{ T.maintenanceModeTemplateCustomOption }}
                  </option>
                </select>

                <div class="mb-2">
                  <span
                    v-for="type in maintenanceTypes"
                    :key="type.value"
                    :class="[
                      'badge',
                      'mr-3',
                      'p-2',
                      badgeClass(type.value),
                      {
                        'badge-selected': currentMaintenanceType === type.value,
                      },
                    ]"
                    @click="currentMaintenanceType = type.value"
                  >
                    {{ type.label }}
                  </span>
                </div>
                <label>{{ T.maintenanceModeMessage }}</label>
                <div class="row mb-2">
                  <div class="col-auto d-flex align-items-center">
                    <span class="badge badge-secondary w-100">{{
                      T.wordsSpanish
                    }}</span>
                  </div>
                  <div class="col">
                    <textarea
                      v-model="currentMaintenanceMessageEs"
                      :class="[
                        'form-control',
                        badgeClass(currentMaintenanceType),
                      ]"
                      :placeholder="T.maintenanceModeMessagePlaceholder"
                      @input="autoResize($event)"
                    ></textarea>
                  </div>
                </div>
                <div class="row mb-2">
                  <div class="col-auto d-flex align-items-center">
                    <span class="badge badge-secondary w-100">{{
                      T.wordsEnglish
                    }}</span>
                  </div>
                  <div class="col">
                    <textarea
                      v-model="currentMaintenanceMessageEn"
                      :class="[
                        'form-control',
                        badgeClass(currentMaintenanceType),
                      ]"
                      :placeholder="T.maintenanceModeMessagePlaceholder"
                      @input="autoResize($event)"
                    ></textarea>
                  </div>
                </div>
                <div class="row mb-2">
                  <div class="col-auto d-flex align-items-center">
                    <span class="badge badge-secondary w-100">{{
                      T.wordsPortuguese
                    }}</span>
                  </div>
                  <div class="col">
                    <textarea
                      v-model="currentMaintenanceMessagePt"
                      :class="[
                        'form-control',
                        badgeClass(currentMaintenanceType),
                      ]"
                      :placeholder="T.maintenanceModeMessagePlaceholder"
                      @input="autoResize($event)"
                    ></textarea>
                  </div>
                </div>
              </div>
              <button
                v-if="currentMaintenanceEnabled"
                class="btn btn-primary"
                type="button"
                @click="onSaveMaintenance"
              >
                {{ T.wordsSaveChanges }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6">
          <form class="form w-100" @submit.prevent="onSearchEmail">
            <div class="input-group">
              <input
                v-model="usernameOrEmail"
                class="form-control"
                name="email"
                type="text"
                required="required"
                :disabled="username != null"
                :placeholder="T.supportTypeEmailOrUsername"
              />
              <div class="input-group-append">
                <button
                  class="btn btn-outline-secondary"
                  type="submit"
                  :disabled="username != null"
                >
                  {{ T.wordsSearch }}
                </button>
              </div>
            </div>
          </form>
        </div>
        <div class="col-md-6 text-right">
          <button
            v-if="username != null"
            class="btn btn-secondary"
            type="reset"
            @click.prevent="onReset"
          >
            {{ T.supportNewSearch }}
          </button>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <form class="form w-100" @submit.prevent="onSearchContest">
            <div class="input-group">
              <input
                v-model="currentContestAlias"
                class="form-control"
                name="contest_alias"
                type="text"
                required="required"
                :disabled="contestFound"
                :placeholder="T.supportTypeContestAlias"
              />
              <div class="input-group-append">
                <button
                  class="btn btn-outline-secondary"
                  type="submit"
                  :disabled="contestFound"
                >
                  {{ T.wordsSearch }}
                </button>
              </div>
            </div>
          </form>
        </div>
        <div class="col-md-6 text-right">
          <button
            v-if="contestFound"
            class="btn btn-secondary"
            type="reset"
            @click.prevent="onResetContest"
          >
            {{ T.supportNewSearch }}
          </button>
        </div>
      </div>
      <template v-if="contestFound">
        <div class="row mb-3">
          <div class="col-md-12">
            <h4>{{ T.supportOptions }}</h4>
            <div class="form-check">
              <label class="form-check-label">
                <input
                  v-model="currentIsContestRecommended"
                  class="form-check-input"
                  type="checkbox"
                  @change="onToggleRecommended"
                />
                {{ T.supportSetAsRecommended }}
              </label>
            </div>
          </div>
        </div>
      </template>
      <template v-if="username != null">
        <div class="row mb-3">
          <div class="col-md">
            <form class="form w-100" @submit.prevent="onVerifyUser">
              <button
                class="btn btn-outline-secondary"
                type="button"
                :disabled="verified"
                @click.prevent="onVerifyUser"
              >
                <template v-if="verified">
                  <font-awesome-icon icon="check" class="alert-success" />
                  {{ T.userVerified }}
                </template>
                <template v-else>
                  {{ T.userVerify }}
                </template>
              </button>
            </form>
          </div>
          <div data-last-login class="col-md">
            <label v-if="lastLogin != null" class="font-weight-bold">
              {{
                ui.formatString(T.userLastLogin, {
                  lastLogin: time.formatDateTime(lastLogin),
                })
              }}
            </label>
            <label v-else>
              {{ T.userNeverLoggedIn }}
            </label>
          </div>
          <div data-birth-date class="col-md">
            <label v-if="birthDate != null" class="font-weight-bold">
              {{
                ui.formatString(T.userBirthDate, {
                  birthDate: time.formatDate(birthDate),
                })
              }}
            </label>
          </div>
        </div>
        <div class="row mb-3">
          <form class="form w-100" @submit.prevent="onGenerateToken">
            <div class="col-md-12">
              <div class="input-group">
                <input
                  :value="link"
                  class="form-control"
                  name="link"
                  type="text"
                  :placeholder="T.passwordGenerateTokenDesc"
                  readonly
                  @focus="$event.target.select()"
                />
                <div class="input-group-append">
                  <button
                    :disabled="!link"
                    class="btn btn-outline-secondary"
                    name="copy"
                    type="button"
                    data-copy-to-clipboard
                    :aria-label="T.passwordCopyToken"
                    :title="T.passwordCopyToken"
                    @click.prevent="copyAndNotify(link)"
                  >
                    <font-awesome-icon icon="clipboard" />
                  </button>
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    :title="T.passwordGenerateTokenDesc"
                    @click.prevent="onGenerateToken"
                  >
                    {{ T.passwordGenerateToken }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="row mb-3">
          <form class="form w-100" @submit.prevent="onUpdateEmail">
            <div class="col-md-12">
              <div class="input-group">
                <input
                  v-model="newEmail"
                  class="form-control"
                  name="new_email"
                  type="text"
                  required="required"
                  :placeholder="T.adminSupportTypeNewEmail"
                />
                <div class="input-group-append">
                  <button
                    class="btn btn-outline-secondary"
                    type="submit"
                    :title="T.adminSupportTypeNewEmail"
                  >
                    {{ T.wordsSaveChanges }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="row mb-3">
          <h4>{{ T.supportAssignUserRoles }}</h4>
          <table class="table">
            <tbody>
              <tr v-for="role in roleNamesWithDescription" :key="role.name">
                <td>
                  <input
                    v-if="role.name != 'Admin'"
                    type="checkbox"
                    :checked="hasRole(role.name)"
                    :class="role.name"
                    @change.prevent="onChangeRole($event, role)"
                  />
                </td>
                <td>
                  <span class="badge badge-info w-100">{{ role.name }}</span>
                </td>
                <td>{{ role.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue';
import T from '../../lang';
import * as ui from '../../ui';
import * as time from '../../time';
import { omegaup } from '../../omegaup';
import { types } from '../../api_types';
import omegaup_ToggleSwitch from '../ToggleSwitch.vue';

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

export interface UpdateEmailRequest {
  email: string;
  newEmail: string;
}

export enum MaintenanceType {
  Info = 'info',
  Warning = 'warning',
  Error = 'danger',
}

export default defineComponent({
  name: 'AdminSupport',
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    'font-awesome-layers': FontAwesomeLayers,
    'font-awesome-layers-text': FontAwesomeLayersText,
    'omegaup-toggle-switch': omegaup_ToggleSwitch,
  },
  props: {
    username: { type: String, required: true },
    email: { type: String, required: true },
    verified: { type: Boolean, required: true },
    link: { type: String, required: true },
    lastLogin: { type: Date as PropType<null | Date>, required: true },
    birthDate: { type: Date as PropType<null | Date>, required: true },
    roles: { type: Array as PropType<string[]>, required: true },
    roleNamesWithDescription: {
      type: Array as PropType<types.UserRole[]>,
      required: true,
    },
    contestAlias: { type: String, required: true },
    contestTitle: { type: String, required: true },
    contestFound: { type: Boolean, required: true },
    isContestRecommended: { type: Boolean, required: true },
    maintenanceEnabled: { type: Boolean, required: true },
    maintenanceMessageEs: { type: String, required: true },
    maintenanceMessageEn: { type: String, required: true },
    maintenanceMessagePt: { type: String, required: true },
    maintenanceType: { type: String, required: true },
    preferredLanguage: { type: String, required: true },
    maintenancePredefinedTemplates: {
      type: Array as PropType<types.PredefinedTemplate[]>,
      required: true,
    },
  },
  emits: [
    'search-username-or-email',
    'update-email',
    'verify-user',
    'generate-token',
    'reset',
    'change-role',
    'search-contest',
    'toggle-recommended',
    'reset-contest',
    'toggle-maintenance',
    'save-maintenance',
  ],
  setup(props, { emit }) {
    const selectedTemplateId = ref('');
    const currentContestAlias = ref(props.contestAlias);
    const currentIsContestRecommended = ref(props.isContestRecommended);
    const currentMaintenanceEnabled = ref(props.maintenanceEnabled);
    const currentMaintenanceMessageEs = ref(props.maintenanceMessageEs);
    const currentMaintenanceMessageEn = ref(props.maintenanceMessageEn);
    const currentMaintenanceMessagePt = ref(props.maintenanceMessagePt);
    const currentMaintenanceType = ref(props.maintenanceType || 'info');
    const usernameOrEmail = ref<null | string>(null);
    const newEmail = ref<null | string>(null);

    const maintenanceTypes = [
      { value: MaintenanceType.Info, label: T.maintenanceModeTypeInfo },
      {
        value: MaintenanceType.Warning,
        label: T.maintenanceModeTypeWarning,
      },
      { value: MaintenanceType.Error, label: T.maintenanceModeTypeError },
    ];

    function badgeClass(type: string) {
      switch (type) {
        case 'warning':
          return 'alert-warning';
        case 'danger':
          return 'alert-danger';
        default:
          return 'alert-info';
      }
    }

    function autoResize(event: Event) {
      console.log(event);
      const textarea = event.target as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }

    function hasRole(role: string): boolean {
      return props.roles.indexOf(role) !== -1;
    }

    function onSearchEmail(): void {
      if (usernameOrEmail.value == null) {
        emit('search-username-or-email', null);
        return;
      }
      emit('search-username-or-email', usernameOrEmail.value);
    }

    function onUpdateEmail(): void {
      if (props.email == null || newEmail.value == null) {
        emit('update-email', null);
        return;
      }
      emit('update-email', {
        email: props.email,
        newEmail: newEmail.value,
      });
    }

    function onVerifyUser(): void {
      if (usernameOrEmail.value == null) {
        emit('verify-user', null);
        return;
      }
      emit('verify-user', usernameOrEmail.value);
    }

    function onGenerateToken(): void {
      if (props.email == null) {
        emit('generate-token', null);
        return;
      }
      emit('generate-token', props.email);
    }

    function onReset(): void {
      usernameOrEmail.value = null;
      newEmail.value = null;
      emit('reset');
    }

    function onChangeRole(ev: Event, role: types.UserRole): void {
      emit('change-role', {
        value: role,
        selected: (ev.target as HTMLInputElement).checked,
      });
    }

    function onSearchContest(): void {
      if (currentContestAlias.value == null) {
        emit('search-contest', null);
        return;
      }
      emit('search-contest', currentContestAlias.value);
    }

    function onToggleRecommended(): void {
      emit('toggle-recommended', currentIsContestRecommended.value);
    }

    function onResetContest(): void {
      emit('reset-contest');
    }

    function onToggleMaintenance(newValue: boolean): void {
      currentMaintenanceEnabled.value = newValue;
      if (!newValue) {
        currentMaintenanceMessageEs.value = '';
        currentMaintenanceMessageEn.value = '';
        currentMaintenanceMessagePt.value = '';
        currentMaintenanceType.value = 'info';
      }
      emit('toggle-maintenance', newValue);
    }

    function onSaveMaintenance(): void {
      emit('save-maintenance', {
        enabled: currentMaintenanceEnabled.value,
        message_es: currentMaintenanceMessageEs.value,
        message_en: currentMaintenanceMessageEn.value,
        message_pt: currentMaintenanceMessagePt.value,
        type: currentMaintenanceType.value,
      });
    }

    function onSelectTemplate(): void {
      const template = props.maintenancePredefinedTemplates.find(
        (t) => t.id === selectedTemplateId.value,
      );
      if (template && template.id !== 'custom') {
        currentMaintenanceMessageEs.value = `${template.title.es}<br>${template.message.es}`;
        currentMaintenanceMessageEn.value = `${template.title.en}<br>${template.message.en}`;
        currentMaintenanceMessagePt.value = `${template.title.pt}<br>${template.message.pt}`;
        currentMaintenanceType.value = template.type;
        return;
      }
      currentMaintenanceMessageEs.value = '';
      currentMaintenanceMessageEn.value = '';
      currentMaintenanceMessagePt.value = '';
      currentMaintenanceType.value = 'info';
    }

    function copyAndNotify(text: string): void {
      navigator.clipboard.writeText(text);
      ui.success(T.passwordResetLinkCopiedToClipboard);
    }

    watch(
      () => props.isContestRecommended,
      (newValue: boolean) => {
        currentIsContestRecommended.value = newValue;
      },
    );

    watch(
      () => props.contestAlias,
      (newValue: string) => {
        currentContestAlias.value = newValue;
      },
    );

    watch(
      () => props.maintenanceEnabled,
      (newValue: boolean) => {
        currentMaintenanceEnabled.value = newValue;
      },
    );

    watch(
      () => props.maintenanceMessageEs,
      (newValue: string) => {
        currentMaintenanceMessageEs.value = newValue;
      },
    );

    watch(
      () => props.maintenanceMessageEn,
      (newValue: string) => {
        currentMaintenanceMessageEn.value = newValue;
      },
    );

    watch(
      () => props.maintenanceMessagePt,
      (newValue: string) => {
        currentMaintenanceMessagePt.value = newValue;
      },
    );

    watch(
      () => props.maintenanceType,
      (newValue: string) => {
        currentMaintenanceType.value = newValue;
      },
    );

    return {
      T,
      ui,
      time,
      MaintenanceType,
      selectedTemplateId,
      currentContestAlias,
      currentIsContestRecommended,
      currentMaintenanceEnabled,
      currentMaintenanceMessageEs,
      currentMaintenanceMessageEn,
      currentMaintenanceMessagePt,
      currentMaintenanceType,
      usernameOrEmail,
      newEmail,
      maintenanceTypes,
      badgeClass,
      autoResize,
      hasRole,
      onSearchEmail,
      onUpdateEmail,
      onVerifyUser,
      onGenerateToken,
      onReset,
      onChangeRole,
      onSearchContest,
      onToggleRecommended,
      onResetContest,
      onToggleMaintenance,
      onSaveMaintenance,
      onSelectTemplate,
      copyAndNotify,
    };
  },
});
</script>

<style lang="scss" scoped>
.badge {
  cursor: pointer;
}

.row.mb-2 {
  .col-auto {
    display: flex;
    align-items: stretch;
    .badge {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-width: 100px;
      font-size: 1rem;
      border-radius: 0.25rem;
    }
  }
  .col {
    display: flex;
    align-items: stretch;
    textarea {
      height: 100%;
      min-height: 40px;
      font-size: 1rem;
      padding-top: 8px;
      padding-bottom: 8px;
      border-radius: 0.25rem;
    }
  }
}
</style>

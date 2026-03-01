import admin_Support, {
  UpdateEmailRequest,
} from '../components/admin/Support.vue';
import { OmegaUp } from '../omegaup';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.SupportDetailsPayload();
  const commonPayload = types.payloadParsers.CommonPayload();

  const state = reactive({
    username: null as null | string,
    link: null as null | string,
    verified: false,
    lastLogin: null as null | Date,
    birthDate: null as null | Date,
    roles: [] as Array<string>,
    email: null as null | string,
    contestAlias: null as null | string,
    contestTitle: null as null | string,
    contestFound: false,
    isContestRecommended: false,
  });

  createApp({
    render: () =>
      h(admin_Support, {
        username: state.username,
        link: state.link,
        verified: state.verified,
        lastLogin: state.lastLogin,
        birthDate: state.birthDate,
        roleNamesWithDescription: payload.roleNamesWithDescription,
        roles: state.roles,
        email: state.email,
        contestAlias: state.contestAlias,
        contestTitle: state.contestTitle,
        contestFound: state.contestFound,
        isContestRecommended: state.isContestRecommended,
        maintenanceEnabled: payload.maintenanceMode.enabled,
        maintenanceMessageEs: payload.maintenanceMode.message_es || '',
        maintenanceMessageEn: payload.maintenanceMode.message_en || '',
        maintenanceMessagePt: payload.maintenanceMode.message_pt || '',
        maintenanceType: payload.maintenanceMode.type || 'info',
        preferredLanguage: commonPayload.preferredLanguage,
        maintenancePredefinedTemplates: payload.maintenancePredefinedTemplates,
        onSearchUsernameOrEmail: (usernameOrEmail: string): void => {
          state.username = null;
          state.link = null;
          state.lastLogin = null;
          state.birthDate = null;
          state.verified = false;
          state.roles = [];
          state.email = null;
          api.User.extraInformation({ usernameOrEmail })
            .then((data) => {
              state.username = data.username;
              state.verified = data.verified;
              state.lastLogin = data.last_login ?? null;
              state.birthDate = data.birth_date ?? null;
              state.roles = data.roles ?? [];
              state.email = data.email ?? null;
            })
            .catch(ui.apiError);
        },
        onUpdateEmail: (request: UpdateEmailRequest) => {
          api.User.updateMainEmail({
            originalEmail: request.email,
            email: request.newEmail,
          })
            .then(() => {
              ui.success(T.adminSupportEmailUpdatedSuccessfully);
            })
            .catch(ui.apiError);
        },
        onVerifyUser: (usernameOrEmail: string): void => {
          api.User.verifyEmail({ usernameOrEmail })
            .then(() => {
              state.verified = true;
              ui.success(T.userVerified);
            })
            .catch(ui.apiError);
        },
        onGenerateToken: (email: string): void => {
          api.Reset.generateToken({ email })
            .then((data) => {
              ui.success(T.passwordResetTokenWasGeneratedSuccessfully);
              state.link = data.link;
            })
            .catch(ui.apiError);
        },
        reset: () => {
          state.username = null;
          state.link = null;
          state.verified = false;
          state.lastLogin = null;
          state.birthDate = null;
          state.roles = [];
          state.email = null;
        },
        onChangeRole: (role: {
          selected: boolean;
          value: types.UserRole;
        }): void => {
          if (role.selected) {
            api.User.addRole({
              username: state.username,
              role: role.value.name,
            })
              .then(() => {
                ui.success(T.userEditSuccess);
              })
              .catch(ui.apiError);
          } else {
            api.User.removeRole({
              username: state.username,
              role: role.value.name,
            })
              .then(() => {
                ui.success(T.userEditSuccess);
              })
              .catch(ui.apiError);
          }
        },
        onSearchContest: (contestAlias: string): void => {
          state.contestFound = false;
          state.contestTitle = null;
          state.isContestRecommended = false;

          api.Contest.details({ contest_alias: contestAlias })
            .then((data) => {
              state.contestAlias = contestAlias;
              state.contestTitle = data.title;
              state.contestFound = true;
              state.isContestRecommended = data.recommended;
            })
            .catch(ui.apiError);
        },
        onToggleRecommended: (isNowRecommended: boolean): void => {
          api.Contest.setRecommended({
            contest_alias: state.contestAlias,
            value: isNowRecommended,
          })
            .then(() => {
              ui.success(
                isNowRecommended
                  ? T.supportContestSetAsRecommended
                  : T.supportContestRemovedFromRecommended,
              );
            })
            .catch(ui.apiError);
        },
        onResetContest: () => {
          state.contestAlias = null;
          state.contestTitle = null;
          state.contestFound = false;
          state.isContestRecommended = false;
        },
        onToggleMaintenance: (enabled: boolean): void => {
          if (!enabled) {
            // If disabling, save immediately
            api.Admin.setMaintenanceMode({
              enabled: false,
              message_es: '',
              message_en: '',
              message_pt: '',
              type: 'info',
            })
              .then(() => {
                ui.success(T.maintenanceModeInactive);
              })
              .catch(ui.apiError);
          }
        },
        onSaveMaintenance: (data: {
          enabled: boolean;
          message_es: string;
          message_en: string;
          message_pt: string;
          type: string;
        }): void => {
          api.Admin.setMaintenanceMode({
            enabled: data.enabled,
            message_es: data.message_es,
            message_en: data.message_en,
            message_pt: data.message_pt,
            type: data.type,
          })
            .then(() => {
              ui.success(T.maintenanceModeActive);
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

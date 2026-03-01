import admin_User from '../components/admin/User.vue';
import { OmegaUp } from '../omegaup';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.UserDetailsPayload();

  const state = reactive({
    experiments: payload.experiments,
    roles: payload.systemRoles,
    verified: payload.verified,
  });

  createApp({
    render: () =>
      h(admin_User, {
        emails: payload.emails,
        experiments: state.experiments,
        systemExperiments: payload.systemExperiments,
        roleNames: payload.roleNames,
        roles: state.roles,
        username: payload.username,
        verified: state.verified,
        onChangeExperiment: (experiment: {
          selected: boolean;
          value: types.Experiment;
        }): void => {
          if (experiment.selected) {
            api.User.addExperiment({
              username: payload.username,
              experiment: experiment.value.name,
            })
              .then(() => {
                ui.success(T.userEditSuccess);
              })
              .catch(ui.apiError);
          } else {
            api.User.removeExperiment({
              username: payload.username,
              experiment: experiment.value.name,
            })
              .then(() => {
                ui.success(T.userEditSuccess);
              })
              .catch(ui.apiError);
          }
        },
        onChangeRole: (role: {
          selected: boolean;
          value: types.UserRole;
        }): void => {
          if (role.selected) {
            api.User.addRole({
              username: payload.username,
              role: role.value.name,
            })
              .then(() => {
                ui.success(T.userEditSuccess);
              })
              .catch(ui.apiError);
          } else {
            api.User.removeRole({
              username: payload.username,
              role: role.value.name,
            })
              .then(() => {
                ui.success(T.userEditSuccess);
              })
              .catch(ui.apiError);
          }
        },
        onVerifyUser: (): void => {
          api.User.verifyEmail({ usernameOrEmail: payload.username })
            .then(() => {
              state.verified = true;
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

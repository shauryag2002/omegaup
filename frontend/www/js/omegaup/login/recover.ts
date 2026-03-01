import { OmegaUp } from '../omegaup';
import * as api from '../api';
import * as ui from '../ui';
import { createApp, h } from 'vue';
import login_PasswordRecover from '../components/login/PasswordRecover.vue';

OmegaUp.on('ready', () => {
  createApp({
    render: () =>
      h(login_PasswordRecover, {
        onForgotPassword: function (email: string) {
          api.Reset.create({
            email: email,
          })
            .then(function (data) {
              ui.success(data.message ?? '');
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

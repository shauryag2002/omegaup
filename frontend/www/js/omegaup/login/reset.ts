import { OmegaUp } from '../omegaup';
import * as api from '../api';
import * as ui from '../ui';
import { createApp, h } from 'vue';
import login_PasswordReset from '../components/login/PasswordReset.vue';

OmegaUp.on('ready', () => {
  const payload = JSON.parse(
    (document.getElementById('payload') as HTMLElement).innerText,
  );
  createApp({
    render: () =>
      h(login_PasswordReset, {
        email: payload.email,
        resetToken: payload.resetToken,
        onResetPassword: (
          email: string,
          resetToken: string,
          password: string,
          passwordConfirmation: string,
        ) => {
          api.Reset.update({
            email: email,
            reset_token: resetToken,
            password: password,
            password_confirmation: passwordConfirmation,
          })
            .then((data) => {
              ui.success(data.message ?? '');
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

import user_EmailEdit from '../components/user/EmailEdit.vue';
import { createApp, h } from 'vue';
import { OmegaUp } from '../omegaup';
import T from '../lang';
import * as api from '../api';
import * as ui from '../ui';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.EmailEditDetailsPayload();
  createApp({
    render: () =>
      h(user_EmailEdit, {
        email: payload.email,
        profile: payload.profile,
        submit: (newEmail: string) => {
          api.User.updateMainEmail({ email: newEmail })
            .then(() => {
              ui.success(T.userEditSuccessfulEmailUpdate);
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

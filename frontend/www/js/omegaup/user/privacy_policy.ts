import { createApp, h, reactive } from 'vue';
import user_PrivacyPolicy from '../components/user/PrivacyPolicy.vue';
import { OmegaUp } from '../omegaup';
import T from '../lang';
import * as api from '../api';
import * as ui from '../ui';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.PrivacyPolicyDetailsPayload();

  const state = reactive({
    saved: payload.has_accepted,
  });

  createApp({
    render: () =>
      h(user_PrivacyPolicy, {
        policyMarkdown: payload.policy_markdown,
        saved: state.saved,
        submit: () => {
          api.User.acceptPrivacyPolicy({
            privacy_git_object_id: payload.git_object_id,
            statement_type: payload.statement_type,
          })
            .then(() => {
              ui.info(T.wordsPrivacyPolicyAccepted);
              state.saved = true;
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

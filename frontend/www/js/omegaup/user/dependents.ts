import user_Dependents from '../components/user/Dependents.vue';
import { createApp, h } from 'vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.UserDependentsPayload();
  createApp({
    render: () =>
      h(user_Dependents, {
        dependents: payload.dependents,
      }),
  }).mount('#main-container');
});

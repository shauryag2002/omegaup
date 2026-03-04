import { createApp, h } from 'vue';
import user_VerificationParentalToken from '../components/user/VerificationParentalToken.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload =
    types.payloadParsers.VerificationParentalTokenDetailsPayload();
  createApp({
    render: () =>
      h(user_VerificationParentalToken, {
        hasParentalVerificationToken: payload.hasParentalVerificationToken,
        message: payload.message,
      }),
  }).mount('#main-container');
});

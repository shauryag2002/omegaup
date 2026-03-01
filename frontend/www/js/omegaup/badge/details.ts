import { createApp, h } from 'vue';
import badge_Details from '../components/badge/Details.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.BadgeDetailsPayload();
  createApp({
    render: () =>
      h(badge_Details, {
        badge: payload.badge,
      }),
  }).mount('#main-container');
});

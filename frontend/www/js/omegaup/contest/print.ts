import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';
import omegaup_ContestPrint from '../components/contest/Print.vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ContestPrintDetailsPayload();
  createApp({
    render: () =>
      h(omegaup_ContestPrint, {
        problems: payload.problems,
        contestTitle: payload.contestTitle,
        onPrintPage: () => {
          window.print();
        },
      }),
  }).mount('#main-container');
});

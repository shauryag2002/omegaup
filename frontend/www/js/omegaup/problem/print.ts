import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';
import omegaup_ProblemPrint from '../components/problem/Print.vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ProblemPrintDetailsPayload();
  createApp({
    render: () =>
      h(omegaup_ProblemPrint, {
        problem: payload.details,
        onPrintPage: () => {
          window.print();
        },
      }),
  }).mount('#main-container');
});

import contest_Report from '../components/contest/Report.vue';
import { OmegaUp } from '../omegaup';
import { createApp, h } from 'vue';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ContestReportDetailsPayload();
  createApp({
    render: () =>
      h(contest_Report, {
        contestReport: payload.contestReport,
        contestAlias: payload.contestAlias,
      }),
  }).mount('#main-container');
});

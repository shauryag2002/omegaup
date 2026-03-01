import common_Docs from '../components/common/Docs.vue';
import { createApp, h } from 'vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const { docs } = types.payloadParsers.UserDocsPayload();
  createApp({
    render: () =>
      h(common_Docs, {
        docs,
      }),
  }).mount('#main-container');
});

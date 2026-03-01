import group_List from '../components/group/List.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.GroupListPayload();
  createApp({
    render: () =>
      h(group_List, {
        groups: payload.groups,
      }),
  }).mount('#main-container');
});

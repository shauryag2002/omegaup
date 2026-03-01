import teamsgroup_List from '../components/teamsgroup/List.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.TeamsGroupListPayload();
  createApp({
    render: () =>
      h(teamsgroup_List, {
        teamsGroups: payload.teamsGroups,
      }),
  }).mount('#main-container');
});

import { createApp, h } from 'vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import activity_Feed from '../components/activity/Feed.vue';

OmegaUp.on('ready', function () {
  const payload = types.payloadParsers.ActivityFeedPayload();
  createApp({
    render: () =>
      h(activity_Feed, {
        page: payload.page,
        length: payload.length,
        type: payload.type,
        alias: payload.alias,
        report: payload.events,
        pagerItems: payload.pagerItems,
      }),
  }).mount('#main-container');
});

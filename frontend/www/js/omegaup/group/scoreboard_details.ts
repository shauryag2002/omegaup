import group_ScoreboardDetails from '../components/group/ScoreboardDetails.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';

OmegaUp.on('ready', function () {
  const payload = types.payloadParsers.GroupScoreboardDetailsPayload();
  createApp({
    render: () =>
      h(group_ScoreboardDetails, {
        groupAlias: payload.groupAlias,
        scoreboardAlias: payload.scoreboardAlias,
        ranking: payload.details.ranking,
        scoreboard: payload.details.scoreboard,
        contests: payload.details.contests,
      }),
  }).mount('#main-container');
});

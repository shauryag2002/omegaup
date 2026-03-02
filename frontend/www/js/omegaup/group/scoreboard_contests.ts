import group_ScoreboardContests from '../components/group/ScoreboardContests.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';

OmegaUp.on('ready', function () {
  const payload = types.payloadParsers.GroupScoreboardContestsPayload();
  const state = reactive({
    contests: payload.contests,
  });

  createApp({
    render: () =>
      h(group_ScoreboardContests, {
        contests: state.contests,
        availableContests: payload.availableContests,
        scoreboard: payload.scoreboardAlias,
        onAddContest: (
          source: InstanceType<typeof group_ScoreboardContests>,
          selectedContest: string,
          onlyAc: boolean,
          weight: number,
        ): void => {
          api.GroupScoreboard.addContest({
            group_alias: payload.groupAlias,
            scoreboard_alias: payload.scoreboardAlias,
            contest_alias: selectedContest,
            only_ac: onlyAc,
            weight: weight,
          })
            .then(() => {
              ui.success(T.groupEditScoreboardsContestsAdded);
              refreshScoreboardContests(
                payload.groupAlias,
                payload.scoreboardAlias,
              );
              source.reset();
            })
            .catch(ui.apiError);
        },
        onRemoveContest: (contestAlias: string): void => {
          api.GroupScoreboard.removeContest({
            group_alias: payload.groupAlias,
            scoreboard_alias: payload.scoreboardAlias,
            contest_alias: contestAlias,
          })
            .then(() => {
              ui.success(T.groupEditScoreboardsContestsRemoved);
              refreshScoreboardContests(
                payload.groupAlias,
                payload.scoreboardAlias,
              );
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');

  function refreshScoreboardContests(
    groupAlias: string,
    scoreboardAlias: string,
  ) {
    api.GroupScoreboard.details({
      group_alias: groupAlias,
      scoreboard_alias: scoreboardAlias,
    })
      .then((scoreboard) => {
        state.contests = scoreboard.contests;
      })
      .catch(ui.apiError);
  }
});

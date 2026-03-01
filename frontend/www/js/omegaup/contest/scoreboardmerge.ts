import contest_ScoreboardMerge from '../components/contest/ScoreboardMerge.vue';
import { OmegaUp } from '../omegaup';
import * as ui from '../ui';
import * as api from '../api';
import { createApp, h, reactive } from 'vue';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ScoreboardMergePayload();
  const state = reactive({
    contests: payload.contests,
    scoreboard: [] as types.MergedScoreboardEntry[],
    showPenalty: false,
    aliases: [] as string[],
  });

  createApp({
    render: () =>
      h(contest_ScoreboardMerge, {
        availableContests: state.contests,
        scoreboard: state.scoreboard,
        showPenalty: state.showPenalty,
        aliases: state.aliases,
        onGetScoreboard: (contestAliases: string[]) => {
          api.Contest.scoreboardMerge({
            contest_aliases: contestAliases.map(encodeURIComponent).join(','),
          })
            .then((response) => {
              const ranking = response.ranking;
              const aliases: string[] = [];
              const scoreboard: types.MergedScoreboardEntry[] = [];
              let showPenalty = false;
              if (ranking.length > 0) {
                for (const entry of ranking) {
                  showPenalty ||= !!entry.total.penalty;
                }
                // Get aliases for indexing in the same order all rows
                for (const entry in ranking[0].contests) {
                  aliases.push(entry);
                }
                // Fill scoreboard object
                for (const index in ranking) {
                  if (!Object.prototype.hasOwnProperty.call(ranking, index))
                    continue;
                  const place = parseInt(index) + 1;
                  const entry = ranking[index];
                  scoreboard.push({ ...entry, place });
                }
              }
              // Update the props values
              state.aliases = aliases;
              state.showPenalty = showPenalty;
              state.scoreboard = scoreboard;
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

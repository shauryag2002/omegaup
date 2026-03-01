import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h, reactive } from 'vue';
import contest_NewForm from '../components/contest/Form.vue';
import * as ui from '../ui';
import * as api from '../api';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ContestNewPayload();
  const startTime = new Date();
  const finishTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000);
  const state = reactive({
    invalidParameterName: null as null | string,
    searchResultTeamsGroups: [] as types.ListItem[],
    canSetRecommended: payload.canSetRecommended,
  });

  createApp({
    render: () =>
      h(contest_NewForm, {
        allLanguages: payload.languages,
        initialLanguages: Object.keys(payload.languages),
        update: false,
        initialStartTime: startTime,
        initialFinishTime: finishTime,
        invalidParameterName: state.invalidParameterName,
        searchResultTeamsGroups: state.searchResultTeamsGroups,
        hasVisitedSection: payload.hasVisitedSection,
        canSetRecommended: state.canSetRecommended,
        onCreateContest: ({
          contest,
          teamsGroupAlias,
        }: {
          contest: types.ContestAdminDetails;
          teamsGroupAlias?: string;
        }): void => {
          api.Contest.create({
            ...contest,
            teams_group_alias: teamsGroupAlias,
          })
            .then(() => {
              state.invalidParameterName = null;
              window.location.replace(
                `/contest/${contest.alias}/edit/#problems`,
              );
            })
            .catch((error) => {
              ui.apiError(error);
              state.invalidParameterName = error.parameter || null;
            });
        },
        onUpdateSearchResultTeamsGroups: (query: string) => {
          api.TeamsGroup.list({
            query,
          })
            .then((data) => {
              state.searchResultTeamsGroups = data.map(
                ({ key, value }: { key: string; value: string }) => ({
                  key,
                  value: `${ui.escape(value)} (<strong>${ui.escape(
                    key,
                  )}</strong>)`,
                }),
              );
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

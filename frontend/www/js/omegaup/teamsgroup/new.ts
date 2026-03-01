import teamsgroup_Create from '../components/teamsgroup/FormCreate.vue';
import { OmegaUp } from '../omegaup';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h } from 'vue';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.TeamGroupNewPayload();
  createApp({
    render: () =>
      h(teamsgroup_Create, {
        numberOfContestants: payload.numberOfContestants,
        maxNumberOfContestants: payload.maxNumberOfContestants,
        onValidateUnusedAlias: (alias: string): void => {
          if (!alias) {
            return;
          }
          api.TeamsGroup.details({ team_group_alias: alias }, { quiet: true })
            .then(() => {
              ui.error(
                ui.formatString(T.aliasAlreadyInUse, {
                  alias: ui.escape(alias),
                }),
              );
            })
            .catch((error) => {
              if (error.httpStatusCode == 404) {
                ui.dismissNotifications();
                return;
              }
              ui.apiError(error);
            });
        },
        onCreateTeamsGroup: ({
          name,
          alias,
          description,
          numberOfContestants,
        }: {
          name: string;
          alias: string;
          description: string;
          numberOfContestants: number;
        }) => {
          api.TeamsGroup.create({
            alias,
            name,
            description,
            numberOfContestants,
          })
            .then(() => {
              window.location.replace(`/teamsgroup/${alias}/edit/#upload`);
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

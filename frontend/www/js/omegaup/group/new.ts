import group_New from '../components/group/Form.vue';
import { OmegaUp } from '../omegaup';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h } from 'vue';

OmegaUp.on('ready', function () {
  createApp({
    render: () =>
      h(group_New, {
        T: T,
        onValidateUnusedAlias: (alias: string): void => {
          if (!alias) {
            return;
          }
          api.Group.details({ group_alias: alias }, { quiet: true })
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
        onCreateGroup: (name: string, alias: string, description: string) => {
          api.Group.create({
            alias: alias,
            name: name,
            description: description,
          })
            .then(() => {
              window.location.replace(`/group/${alias}/edit/#members`);
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

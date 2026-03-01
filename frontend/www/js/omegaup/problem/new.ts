import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import T from '../lang';
import { createApp, h, reactive } from 'vue';
import problem_New from '../components/problem/Form.vue';
import * as ui from '../ui';
import * as api from '../api';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ProblemFormPayload();
  if (payload.statusError) {
    ui.error(payload.statusError);
  }
  const state = reactive({
    errors: payload.parameter ? [payload.parameter] : [],
  });

  createApp({
    render: () =>
      h(problem_New, {
        data: payload,
        errors: state.errors,
        hasVisitedSection: payload.hasVisitedSection,
        onAliasChanged: (alias: string): void => {
          if (!alias) {
            state.errors.push('problem_alias');
            return;
          }
          api.Problem.details({ problem_alias: alias }, { quiet: true })
            .then(() => {
              state.errors.push('problem_alias');
              ui.error(
                ui.formatString(T.aliasAlreadyInUse, {
                  alias: ui.escape(alias),
                }),
              );
            })
            .catch((error) => {
              if (error.httpStatusCode == 404) {
                ui.dismissNotifications();
                state.errors = state.errors.filter(
                  (error) => error !== 'problem_alias',
                );
                return;
              }
              state.errors.push(error.parameter);
              ui.apiError(error);
            });
        },
      }),
  }).mount('#main-container');
});

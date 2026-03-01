import { createApp, h, reactive } from 'vue';
import grader_EphemeralIDE from '../components/arena/EphemeralGrader.vue';

import * as time from '../time';
import * as Util from './util';
import * as api from '../api';
import * as ui from '../ui';
import { types } from '../api_types';
import { OmegaUp } from '../omegaup';

OmegaUp.on('ready', () => {
  document.body.style.padding = '0';
  const main = document.querySelector('main') as HTMLElement;
  main.style.flex = '1 1 auto';

  const payload = types.payloadParsers.FullIDEPayload();
  const acceptedLanguages = payload.acceptedLanguages;
  const preferredLanguage = payload.preferredLanguage || acceptedLanguages[0];

  const state = reactive({
    nextExecutionTimestamp: null as null | Date,
  });

  createApp({
    render: () =>
      h(grader_EphemeralIDE, {
        acceptedLanguages,
        preferredLanguage,
        isEmbedded: false,
        initialTheme: Util.MonacoThemes.VSDark,
        nextExecutionTimestamp: state.nextExecutionTimestamp,
        onExecuteRun: () => {
          api.Run.executeForIDE()
            .then(time.remoteTimeAdapter)
            .then((response) => {
              state.nextExecutionTimestamp = response.nextExecutionTimestamp;
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

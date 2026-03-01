import { createApp, h } from 'vue';
import problem_Collection from '../components/problem/Collection.vue';
import { types } from '../api_types';
import { omegaup, OmegaUp } from '../omegaup';
import * as ui from '../ui';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ProblemListCollectionPayload();
  createApp({
    render: () =>
      h(problem_Collection, {
        levelTags: payload.levelTags,
        problemCount: payload.problemCount,
        allTags: payload.allTags,
        onSearchProblems: (queryParameters: omegaup.QueryParameters): void => {
          window.location.replace(
            `/problem/?${ui.buildURLQuery(
              queryParameters as { [key: string]: any },
            )}`,
          );
        },
      }),
  }).mount('#main-container');
});

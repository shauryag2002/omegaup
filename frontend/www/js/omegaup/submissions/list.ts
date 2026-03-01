import submissions_List from '../components/submissions/List.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as ui from '../ui';
import * as api from '../api';
import { createApp, h, reactive } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.SubmissionsListPayload();
  const state = reactive({
    searchResultUsers: [] as types.ListItem[],
    page: 1,
    username: payload.username,
    submissions: payload.submissions,
    loading: false, // Flag to prevent multiple simultaneous requests
    endOfResults: false, // Flag to indicate if all results have been loaded
  });

  createApp({
    render: () =>
      h(submissions_List, {
        includeUser: payload.includeUser,
        page: state.page,
        submissions: state.submissions,
        searchResultUsers: state.searchResultUsers,
        loading: state.loading,
        endOfResults: state.endOfResults,
        onUpdateSearchResultUsers: (query: string) => {
          api.User.list({ query })
            .then(({ results }) => {
              state.searchResultUsers = results.map(
                ({ key, value }: types.ListItem) => ({
                  key,
                  value: `${ui.escape(key)} (<strong>${ui.escape(
                    value,
                  )}</strong>)`,
                }),
              );
            })
            .catch(ui.apiError);
        },
        onFetchMoreData: () => {
          if (state.loading || state.endOfResults) return;
          state.loading = true;
          api.Submission.list({
            username: state.username,
            page: state.page + 1,
          })
            .then(({ submissions }) => {
              if (submissions === null || submissions.length === 0) {
                state.endOfResults = true;
              } else {
                state.page++;
                state.submissions = [...state.submissions, ...submissions];
              }
            })
            .catch((error) => {
              state.endOfResults = true;
              ui.apiError(error);
            })
            .finally(() => {
              state.loading = false;
            });
        },
      }),
  }).mount('#main-container');
});

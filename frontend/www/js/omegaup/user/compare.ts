import { createApp, h, reactive } from 'vue';
import * as api from '../api';
import { types } from '../api_types';
import user_CompareUsers from '../components/user/CompareUsers.vue';
import { OmegaUp } from '../omegaup';
import * as ui from '../ui';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.UserComparePayload();
  const state = reactive({
    user1: payload.user1,
    user2: payload.user2,
    username1: payload.username1,
    username2: payload.username2,
    isLoading: false,
    searchResultUsers1: [] as types.ListItem[],
    searchResultUsers2: [] as types.ListItem[],
    selectedUser1: null as types.ListItem | null,
    selectedUser2: null as types.ListItem | null,
  });

  createApp({
    render: () =>
      h(user_CompareUsers, {
        user1: state.user1,
        user2: state.user2,
        username1: state.username1,
        username2: state.username2,
        isLoading: state.isLoading,
        searchResultUsers1: state.searchResultUsers1,
        searchResultUsers2: state.searchResultUsers2,
        selectedUser1: state.selectedUser1,
        selectedUser2: state.selectedUser2,
        compare: ({
          username1,
          username2,
        }: {
          username1?: string;
          username2?: string;
        }) => {
          state.isLoading = true;

          // Update URL
          const url = new URL(window.location.href);
          if (username1) {
            url.searchParams.set('username1', username1);
          } else {
            url.searchParams.delete('username1');
          }
          if (username2) {
            url.searchParams.set('username2', username2);
          } else {
            url.searchParams.delete('username2');
          }
          window.history.pushState({}, '', url.toString());

          api.User.compare({
            username1: username1 || undefined,
            username2: username2 || undefined,
          })
            .then((response) => {
              state.user1 = response.user1;
              state.user2 = response.user2;
            })
            .catch(ui.apiError)
            .finally(() => {
              state.isLoading = false;
            });
        },
        onUpdateSearchResultUsers: ({
          query,
          field,
        }: {
          query: string;
          field: 'user1' | 'user2';
        }) => {
          api.User.list({ query })
            .then(({ results }) => {
              const formattedResults = results.map(
                ({ key, value }: types.ListItem) => ({
                  key,
                  value: `${ui.escape(key)} (<strong>${ui.escape(
                    value,
                  )}</strong>)`,
                }),
              );

              // Exclude the user that is already selected in the other field
              // to avoid comparing a user against themselves
              const otherSelectedUserKey =
                field === 'user1'
                  ? state.selectedUser2?.key
                  : state.selectedUser1?.key;

              const filteredResults = formattedResults.filter(
                (user) => user.key !== otherSelectedUserKey,
              );

              if (field === 'user1') {
                state.searchResultUsers1 = filteredResults;
              } else {
                state.searchResultUsers2 = filteredResults;
              }
            })
            .catch(ui.apiError);
        },
        'onUpdate:selectedUser1': (user: types.ListItem | null) => {
          state.selectedUser1 = user;
        },
        'onUpdate:selectedUser2': (user: types.ListItem | null) => {
          state.selectedUser2 = user;
        },
      }),
  }).mount('#main-container');
});

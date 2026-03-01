import { createApp, h, reactive } from 'vue';
import * as api from '../api';
import { types } from '../api_types';
import authors_Rank from '../components/user/AuthorsRank.vue';
import { OmegaUp } from '../omegaup';
import * as ui from '../ui';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.AuthorRankTablePayload();
  const state = reactive({
    searchResultUsers: [] as types.ListItem[],
  });

  createApp({
    render: () =>
      h(authors_Rank, {
        page: payload.page,
        length: payload.length,
        rankingData: payload.ranking,
        pagerItems: payload.pagerItems,
        searchResultUsers: state.searchResultUsers,
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
      }),
  }).mount('#main-container');
});

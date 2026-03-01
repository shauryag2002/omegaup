import schools_Rank from '../components/schools/Rank.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import { createApp, h, reactive } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.SchoolRankPayload();
  let currentRequestId = 0;
  const state = reactive({
    searchResultSchools: [] as types.SchoolListItem[],
  });

  createApp({
    render: () =>
      h(schools_Rank, {
        page: payload.page,
        length: payload.length,
        showHeader: payload.showHeader,
        rank: payload.rank,
        totalRows: payload.totalRows,
        pagerItems: payload.pagerItems,
        searchResultSchools: state.searchResultSchools,
        onUpdateSearchResultSchools: (() => {
          let timeoutId: number | null = null;
          return (query: string) => {
            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = window.setTimeout(() => {
              const trimmedQuery = query.trim();
              if (!trimmedQuery) {
                state.searchResultSchools = [];
                return;
              }
              const requestId = ++currentRequestId;
              api.School.list({ query: trimmedQuery })
                .then(({ results }) => {
                  if (requestId === currentRequestId) {
                    state.searchResultSchools = results;
                  }
                })
                .catch(ui.apiError);
            }, 300);
          };
        })(),
      }),
  }).mount('#main-container');
});

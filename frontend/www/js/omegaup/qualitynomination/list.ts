import { createApp, h, reactive } from 'vue';
import qualitynomination_List from '../components/qualitynomination/List.vue';
import { OmegaUp } from '../omegaup';
import * as api from '../api';
import * as ui from '../ui';
import { types, messages } from '../api_types';

OmegaUp.on('ready', function () {
  const payload = JSON.parse(
    (document.getElementById('payload') as HTMLElement).innerText,
  );
  const headerPayload = JSON.parse(
    (document.getElementById('header-payload') as HTMLElement).innerText,
  );
  const searchResultEmpty: types.ListItem[] = [];

  const state = reactive({
    nominations: [] as types.NominationListItem[],
    pagerItems: [] as types.PageItem[],
    pages: 1,
    searchResultUsers: searchResultEmpty,
    searchResultProblems: searchResultEmpty,
  });

  createApp({
    render: () =>
      h(qualitynomination_List, {
        pages: state.pages,
        nominations: state.nominations,
        pagerItems: state.pagerItems,
        length: payload.length,
        myView: payload.myView,
        isAdmin: headerPayload.isAdmin,
        searchResultUsers: state.searchResultUsers,
        searchResultProblems: state.searchResultProblems,
        onGoToPage: (
          pageNumber: number,
          status: string,
          query: string,
          column: string,
        ) => {
          if (pageNumber > 0) {
            showNominations(pageNumber, status, query, column);
          }
        },
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
        onUpdateSearchResultProblems: (query: string) => {
          api.Problem.listForTypeahead({
            query,
            search_type: 'all',
          })
            .then((data) => {
              state.searchResultProblems = data.results.map(
                ({ key, value }, index) => ({
                  key,
                  value: `${String(index + 1).padStart(2, '0')}.- ${ui.escape(
                    value,
                  )} (<strong>${ui.escape(key)}</strong>)`,
                }),
              );
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');

  function showNominations(
    pageNumber: number,
    status: string,
    query: string,
    column: string,
  ) {
    const request: messages.QualityNominationListRequest = {
      offset: pageNumber,
      rowcount: payload.length,
    };
    if (!payload.myView) {
      request.status = status;
      if (query && column) {
        request.query = query;
        request.column = column;
      }

      api.QualityNomination.list(request)
        .then((data) => {
          state.nominations = data.nominations;
          state.pagerItems = data.pager_items;
          state.pages = pageNumber;
        })
        .catch(ui.apiError);
    } else {
      api.QualityNomination.myList(request)
        .then((data) => {
          state.nominations = data.nominations;
          state.pagerItems = data.pager_items;
          state.pages = pageNumber;
        })
        .catch(ui.apiError);
    }
  }

  showNominations(1, 'all', '', '');
});

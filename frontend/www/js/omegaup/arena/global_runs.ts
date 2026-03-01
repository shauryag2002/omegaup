import { createApp, h, reactive } from 'vue';

import arena_Runs, { PopupDisplayed } from '../components/arena/Runs.vue';
import * as api from '../api';
import T from '../lang';
import { OmegaUp } from '../omegaup';
import * as ui from '../ui';
import * as time from '../time';
import { runsStore } from './runsStore';
import {
  onRefreshRuns,
  showSubmission,
  SubmissionRequest,
  updateRunFallback,
} from './submissions';
import { types } from '../api_types';
import { getOptionsFromLocation, getProblemAndRunDetails } from './location';

OmegaUp.on('ready', async () => {
  const { guid, popupDisplayed } = getOptionsFromLocation(window.location.hash);
  const searchResultEmpty: types.ListItem[] = [];
  let runDetails: null | types.RunDetails = null;
  try {
    ({ runDetails } = await getProblemAndRunDetails({
      location: window.location.hash,
    }));
  } catch (e: any) {
    ui.apiError(e);
  }
  const state = reactive({
    searchResultUsers: searchResultEmpty,
    searchResultProblems: searchResultEmpty,
    popupDisplayed,
    guid,
    runDetailsData: runDetails,
  });

  createApp({
    render: () =>
      h(arena_Runs, {
        contestAlias: 'admin',
        popupDisplayed: state.popupDisplayed,
        runs: runsStore.state.runs,
        showContest: true,
        showProblem: true,
        showDetails: true,
        showDisqualify: true,
        showPager: true,
        showRejudge: true,
        showUser: true,
        guid: state.guid,
        searchResultUsers: state.searchResultUsers,
        searchResultProblems: state.searchResultProblems,
        runDetailsData: state.runDetailsData,
        totalRuns: runsStore.state.totalRuns,
        details: (request: SubmissionRequest) => {
          api.Run.details({ run_alias: request.guid })
            .then((runDetails) => {
              state.runDetailsData = showSubmission({ request, runDetails });
              if (request.hash) {
                window.location.hash = request.hash;
              }
            })
            .catch((error) => {
              ui.apiError(error);
              state.popupDisplayed = PopupDisplayed.None;
            });
        },
        requalify: (run: types.Run) => {
          api.Run.requalify({ run_alias: run.guid })
            .then(() => {
              run.type = 'normal';
              updateRunFallback({ run });
            })
            .catch(ui.ignoreError);
        },
        disqualify: ({ run }: { run: types.Run }) => {
          if (!window.confirm(T.runDisqualifyConfirm)) {
            return;
          }
          api.Run.disqualify({ run_alias: run.guid })
            .then(() => {
              run.type = 'disqualified';
              updateRunFallback({ run });
            })
            .catch(ui.ignoreError);
        },
        onFilterChanged: () => {
          refreshRuns();
        },
        rejudge: (run: types.Run) => {
          api.Run.rejudge({ run_alias: run.guid, debug: false })
            .then(() => {
              run.status = 'rejudging';
              updateRunFallback({ run });
            })
            .catch(ui.ignoreError);
        },
        onUpdateSearchResultUsers: ({ query }: { query: string }) => {
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
        onUpdateSearchResultUsersContest: ({
          query,
          contestAlias,
        }: {
          query: string;
          contestAlias: string;
        }) => {
          api.Contest.searchUsers({ query, contest_alias: contestAlias })
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
        onResetHash: () => {
          history.replaceState({}, '', '#');
        },
      }),
  }).mount('#main-container');

  function refreshRuns(): void {
    api.Run.list({
      show_all: true,
      offset: runsStore.state.filters?.offset,
      rowcount: runsStore.state.filters?.rowcount,
      verdict: runsStore.state.filters?.verdict,
      language: runsStore.state.filters?.language,
      username: runsStore.state.filters?.username,
      status: runsStore.state.filters?.status,
    })
      .then(time.remoteTimeAdapter)
      .then((response) => {
        onRefreshRuns({ runs: response.runs, totalRuns: response.totalRuns });
      })
      .catch(ui.apiError);
  }

  refreshRuns();
  setInterval(() => {
    refreshRuns();
  }, 5 * 60 * 1000);
});

import { createApp, h, reactive } from 'vue';
import problem_Mine from '../components/problem/Mine.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import T from '../lang';
import * as api from '../api';
import * as ui from '../ui';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ProblemsMineInfoPayload();
  let showAllProblems = false;
  const state = reactive({
    problems: [] as types.ProblemListItem[],
    pagerItems: [] as types.PageItem[],
  });

  createApp({
    render: () =>
      h(problem_Mine, {
        problems: state.problems,
        privateProblemsAlert: payload.privateProblemsAlert,
        isSysadmin: payload.isSysadmin,
        pagerItems: state.pagerItems,
        visibilityStatuses: payload.visibilityStatuses,
        query: payload.query,
        onChangeShowAllProblems: (shouldShowAll: boolean) => {
          showAllProblems = shouldShowAll;
          showProblems(shouldShowAll);
        },
        onChangeVisibility: (
          selectedProblems: types.ProblemListItem[],
          visibility: number,
        ) => {
          Promise.all(
            selectedProblems.map((problem: types.ProblemListItem) =>
              api.Problem.update({
                problem_alias: problem.alias,
                visibility: normalizeVisibility(visibility, problem.visibility),
                message:
                  visibility === 1 ? 'private -> public' : 'public -> private',
              }),
            ),
          )
            .then(() => {
              ui.success(T.updateItemsSuccess);
            })
            .catch((error) => {
              ui.error(ui.formatString(T.bulkOperationError, error));
            })
            .finally(() => {
              showProblems(showAllProblems);
            });
        },
        onGoToPage: (pageNumber: number) => {
          if (pageNumber > 0) {
            showProblems(showAllProblems, pageNumber);
          }
        },
        remove: ({
          alias,
          shouldShowAllProblems,
        }: {
          alias: string;
          shouldShowAllProblems: boolean;
        }) => {
          api.Problem.delete({ problem_alias: alias })
            .then(() => {
              ui.success(T.problemSuccessfullyRemoved);
              showAllProblems = shouldShowAllProblems;
              showProblems(shouldShowAllProblems);
            })
            .catch(ui.apiError);
        },
        onRemoveAllProblems: ({
          selectedProblems,
          shouldShowAllProblems,
        }: {
          selectedProblems: types.ProblemListItem[];
          shouldShowAllProblems: boolean;
        }) => {
          Promise.all(
            selectedProblems.map((problem: types.ProblemListItem) =>
              api.Problem.delete({ problem_alias: problem.alias }),
            ),
          )
            .then(() => {
              ui.success(T.problemSuccessfullyRemoved);
            })
            .catch((error) => {
              ui.error(ui.formatString(T.bulkOperationError, error));
            })
            .finally(() => {
              showAllProblems = shouldShowAllProblems;
              showProblems(shouldShowAllProblems);
            });
        },
      }),
  }).mount('#main-container');

  function showProblems(showAllProblems: boolean, pageNumber?: number): void {
    (showAllProblems
      ? api.Problem.adminList({
          page: pageNumber,
          query: payload.query ?? null,
        })
      : api.Problem.myList({
          page: pageNumber,
          query: payload.query ?? null,
        })
    )
      .then((result) => {
        state.pagerItems = result.pagerItems;
        state.problems = result.problems;
      })
      .catch(ui.apiError);
  }

  function normalizeVisibility(
    newVisibility: number,
    oldVisibility: number,
  ): number {
    if (newVisibility == 1) {
      switch (oldVisibility) {
        case payload.visibilityStatuses['privateBanned']:
          return payload.visibilityStatuses['publicBanned'];
        case payload.visibilityStatuses['privateWarning']:
          return payload.visibilityStatuses['publicWarning'];
        case payload.visibilityStatuses['private']:
          return payload.visibilityStatuses['public'];
        default:
          return oldVisibility;
      }
    } else if (newVisibility == 0) {
      switch (oldVisibility) {
        case payload.visibilityStatuses['publicBanned']:
          return payload.visibilityStatuses['privateBanned'];
        case payload.visibilityStatuses['publicWarning']:
          return payload.visibilityStatuses['privateWarning'];
        case payload.visibilityStatuses['public']:
          return payload.visibilityStatuses['private'];
        default:
          return oldVisibility;
      }
    }
    return oldVisibility;
  }

  showProblems(showAllProblems, /*pageNumber=*/ 1);
});

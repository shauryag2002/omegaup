import { createApp, h, reactive } from 'vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import T from '../lang';
import * as api from '../api';
import * as ui from '../ui';
import contest_Mine from '../components/contest/Mine.vue';
import { downloadCsvFile } from '../groups';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ContestListMinePayload();
  let showAllContests = false;
  let showArchivedContests = false;
  const state = reactive({
    contests: payload.contests,
  });

  createApp({
    render: () =>
      h(contest_Mine, {
        contests: state.contests,
        privateContestsAlert: payload.privateContestsAlert,
        onChangeShowArchivedContests: (shouldShowArchivedContests: boolean) => {
          showArchivedContests = shouldShowArchivedContests;
          fillContestsTable({ showAllContests, showArchivedContests });
        },
        onChangeShowAllContests: (shouldShowAll: boolean) => {
          showAllContests = shouldShowAll;
          fillContestsTable({ showAllContests, showArchivedContests });
        },
        onChangeAdmissionMode: (
          selectedContests: string[],
          visibility: number,
        ) => {
          Promise.all(
            selectedContests.map((contestAlias: string) =>
              api.Contest.update({
                contest_alias: contestAlias,
                admission_mode: visibility,
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
              fillContestsTable({ showAllContests, showArchivedContests });
            });
        },
        onDownloadCsvUsers: (contestAlias: string) => {
          api.Contest.contestants({
            contest_alias: contestAlias,
          })
            .then((result) => {
              if (!result.contestants) {
                return;
              }
              downloadCsvFile({
                fileName: `users_${contestAlias}.csv`,
                columns: [
                  'name',
                  'username',
                  'email',
                  'state',
                  'country',
                  'school',
                ],
                records: result.contestants,
              });
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');

  function fillContestsTable({
    showAllContests,
    showArchivedContests,
  }: {
    showAllContests: boolean;
    showArchivedContests: boolean;
  }): void {
    const param = { show_archived: showArchivedContests };
    (showAllContests ? api.Contest.adminList(param) : api.Contest.myList(param))
      .then((result) => {
        state.contests = result.contests;
      })
      .catch(ui.apiError);
  }
});

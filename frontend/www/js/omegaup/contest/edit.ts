import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h, reactive } from 'vue';
import T from '../lang';
import contest_Edit from '../components/contest/Edit.vue';
import { SearchTypes } from '../components/contest/AddProblem.vue';
import * as ui from '../ui';
import * as api from '../api';
import { toCsv, TableCell } from '../csv';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.ContestEditPayload();
  const searchResultTeamsGroups: types.ListItem[] = [];
  if (payload.teams_group) {
    searchResultTeamsGroups.push({
      key: payload.teams_group.alias,
      value: payload.teams_group.name,
    });
  }
  const state = reactive({
    admins: payload.admins,
    details: payload.details,
    initialTab: window.location.hash?.substring(1) || '',
    groupAdmins: payload.group_admins,
    groups: payload.groups,
    problems: payload.problems,
    requests: payload.requests,
    users: payload.users,
    searchResultProblems: [] as types.ListItem[],
    searchResultUsers: [] as types.ListItem[],
    searchResultTeamsGroups,
    searchResultGroups: [] as types.ListItem[],
    teamsGroup: payload.teams_group,
    certificatesDetails: payload.certificatesDetails,
    invalidParameterName: null as null | string,
  });

  const methods = {
    arbitrateRequest: (
      username: string,
      resolution: boolean,
      resolutionText: null | string = null,
    ): void => {
      if (!resolutionText) {
        resolutionText = resolution ? T.wordAccepted : T.wordsDenied;
      }
      api.Contest.arbitrateRequest({
        contest_alias: payload.details.alias,
        username,
        resolution,
        note: resolutionText,
      })
        .then(() => {
          if (resolution) {
            ui.success(T.arbitrateRequestAcceptSuccessfully);
          } else {
            ui.success(T.arbitrateRequestDenySuccessfully);
          }
          methods.refreshRequests();
        })
        .catch(ui.apiError);
    },
    refreshDetails: (): void => {
      api.Contest.adminDetails({
        contest_alias: payload.details.alias,
      })
        .then((response) => {
          state.details = response;
        })
        .catch(ui.apiError);
    },
    refreshGroups: (): void => {
      api.Contest.users({
        contest_alias: payload.details.alias,
      })
        .then((response) => {
          state.groups = response.groups;
        })
        .catch(ui.apiError);
    },
    refreshProblems: (problemAdded: boolean): void => {
      api.Contest.problems({
        contest_alias: payload.details.alias,
      })
        .then((response) => {
          state.problems = response.problems;
          if (
            problemAdded &&
            !state.details.languages.includes('cat') &&
            state.problems.some((problem) =>
              problem.languages.split(',').includes('cat'),
            )
          ) {
            api.Contest.update({
              contest_alias: state.details.alias,
              languages: state.details.languages.concat(['cat']),
            })
              .then(() => {
                state.details.languages.push('cat');
                ui.warning(T.contestEditCatLanguageAddedWarning);
              })
              .catch(ui.apiError);
          }
        })
        .catch(ui.apiError);
    },
    refreshRequests: (): void => {
      api.Contest.requests({
        contest_alias: payload.details.alias,
      })
        .then((response) => {
          state.requests = response.users;
        })
        .catch(ui.apiError);
    },
    refreshUsers: (): void => {
      api.Contest.users({
        contest_alias: payload.details.alias,
      })
        .then((response) => {
          state.users = response.users;
        })
        .catch(ui.apiError);
    },
    refreshAdmins: (): void => {
      api.Contest.admins({
        contest_alias: payload.details.alias,
      })
        .then((response) => {
          state.admins = response.admins;
        })
        .catch(ui.apiError);
    },
    refreshGroupAdmins: (): void => {
      api.Contest.admins({
        contest_alias: payload.details.alias,
      })
        .then((response) => {
          state.groupAdmins = response.group_admins;
        })
        .catch(ui.apiError);
    },
    downloadCsvFile: (fileName: string, table: TableCell[][]): void => {
      const blob = new Blob([toCsv(table)], {
        type: 'text/csv;charset=utf-8;',
      });
      const hiddenElement = document.createElement('a');
      hiddenElement.href = window.URL.createObjectURL(blob);
      hiddenElement.target = '_blank';
      hiddenElement.download = fileName;
      hiddenElement.click();
    },
  };

  const app = createApp({
    methods,
    render: () =>
      h(contest_Edit, {
        admins: state.admins,
        details: state.details,
        initialTab: state.initialTab,
        groupAdmins: state.groupAdmins,
        groups: state.groups,
        problems: state.problems,
        requests: state.requests,
        users: state.users,
        searchResultProblems: state.searchResultProblems,
        searchResultUsers: state.searchResultUsers,
        searchResultTeamsGroups: state.searchResultTeamsGroups,
        searchResultGroups: state.searchResultGroups,
        teamsGroup: state.teamsGroup,
        originalContestAdmissionMode: payload.original_contest_admission_mode,
        certificatesDetails: state.certificatesDetails,
        invalidParameterName: state.invalidParameterName,
        onUpdateSearchResultProblems: ({
          query,
          searchType,
        }: {
          query: string;
          searchType: SearchTypes;
        }) => {
          api.Problem.listForTypeahead({
            query,
            search_type: searchType,
          })
            .then((data) => {
              // Problems previously added into the contest should not be
              // shown in the dropdown
              const addedProblems = new Set(
                state.problems.map((problem) => problem.alias),
              );
              state.searchResultProblems = data.results
                .filter((problem) => !addedProblems.has(problem.key))
                .map(({ key, value }, index) => ({
                  key: key,
                  value: `${String(index + 1).padStart(2, '0')}.-  ${ui.escape(
                    value,
                  )} (<strong>${ui.escape(key)}</strong>)`,
                }));
            })
            .catch(ui.apiError);
        },
        onUpdateSearchResultGroups: (query: string) => {
          api.Group.list({
            query,
          })
            .then((data) => {
              // Groups previously added into the contest should not be
              // shown in the dropdown
              const addedGroups = new Set(
                state.groups.map((group) => group.alias),
              );
              state.searchResultGroups = data
                .filter((group) => !addedGroups.has(group.value))
                .map((group) => ({
                  key: group.value,
                  value: `${ui.escape(group.label)} (<strong>${ui.escape(
                    group.value,
                  )}</strong>)`,
                }));
            })
            .catch(ui.apiError);
        },
        onUpdateSearchResultUsers: (query: string) => {
          api.User.list({ query })
            .then(({ results }) => {
              // Users previously invited to the contest should not be shown
              // in the dropdown
              const addedUsers = new Set(
                state.users.map((user) => user.username),
              );

              state.searchResultUsers = results
                .filter((user) => !addedUsers.has(user.key))
                .map(({ key, value }: types.ListItem) => ({
                  key,
                  value: `${ui.escape(key)} (<strong>${ui.escape(
                    value,
                  )}</strong>)`,
                }));
            })
            .catch(ui.apiError);
        },
        onUpdateSearchResultTeamsGroups: (query: string) => {
          api.TeamsGroup.list({
            query,
          })
            .then((data) => {
              state.searchResultTeamsGroups = data.map(
                ({ key, value }: { key: string; value: string }) => ({
                  key,
                  value: `${ui.escape(value)} (<strong>${ui.escape(
                    key,
                  )}</strong>)`,
                }),
              );
            })
            .catch(ui.apiError);
        },
        onUpdateContest: ({
          contest,
          teamsGroupAlias,
        }: {
          contest: types.ContestAdminDetails;
          teamsGroupAlias?: string;
        }): void => {
          api.Contest.update({
            ...contest,
            contest_alias: contest.alias,
            alias: null,
            teams_group_alias: teamsGroupAlias,
            contest_for_teams: !!teamsGroupAlias,
          })
            .then((data) => {
              if (teamsGroupAlias && data.teamsGroupName) {
                state.teamsGroup = {
                  alias: teamsGroupAlias,
                  name: data.teamsGroupName,
                };
              }
              state.details.title = data.title;
              ui.success(
                ui.formatString(T.contestEditContestEdited, {
                  alias: contest.alias,
                }),
              );
            })
            .catch(ui.apiError);
        },
        onAddProblem: ({
          problem,
          isUpdate = false,
        }: {
          problem: types.ProblemsetProblem;
          isUpdate: boolean;
        }) => {
          api.Contest.addProblem({
            contest_alias: payload.details.alias,
            order_in_contest: problem.order,
            problem_alias: problem.alias,
            points: problem.points,
            commit: problem.commit,
          })
            .then((data) => {
              methods.refreshProblems(true);
              if (isUpdate) {
                ui.success(T.problemSuccessfullyUpdated);
                return;
              }
              if (data.solutionStatus === 'not_found') {
                ui.success(T.problemSuccessfullyAdded);
              } else {
                ui.warning(T.warningPublicSolution);
              }
            })
            .catch(ui.apiError);
        },
        onGetVersions: ({
          request,
          target,
        }: {
          request: { problemAlias: string };
          target: {
            versionLog: types.ProblemVersion[];
            problems: types.ProblemsetProblem[];
            selectedRevision: types.ProblemVersion;
            publishedRevision: types.ProblemVersion;
          };
        }) => {
          api.Problem.versions({
            problem_alias: request.problemAlias,
            problemset_id: payload.details.problemset_id,
          })
            .then((result) => {
              target.versionLog = result.log;
              let currentProblem = null;
              for (const problem of target.problems) {
                if (problem.alias === request.problemAlias) {
                  currentProblem = problem;
                  break;
                }
              }
              let publishedCommitHash = result.published;
              if (currentProblem != null) {
                publishedCommitHash = currentProblem.commit;
              }
              for (const revision of result.log) {
                if (publishedCommitHash === revision.commit) {
                  target.selectedRevision = target.publishedRevision = revision;
                  break;
                }
              }
            })
            .catch(ui.apiError);
        },
        onRemoveProblem: (problemAlias: string) => {
          api.Contest.removeProblem({
            contest_alias: payload.details.alias,
            problem_alias: problemAlias,
          })
            .then(() => {
              ui.success(T.problemSuccessfullyRemoved);
              methods.refreshProblems(false);
            })
            .catch(ui.apiError);
        },
        onRunsDiff: (
          problemAlias: string,
          versionsComponent: types.CommitRunsDiff,
          selectedCommit: types.ProblemVersion,
        ) => {
          api.Contest.runsDiff({
            problem_alias: problemAlias,
            contest_alias: payload.details.alias,
            version: selectedCommit.version,
          })
            .then((response) => {
              versionsComponent.runsDiff[selectedCommit.version] = response.diff;
            })
            .catch(ui.apiError);
        },
        onUpdateAdmissionMode: ({
          admissionMode,
          defaultShowAllContestantsInScoreboard,
        }: {
          admissionMode: string;
          defaultShowAllContestantsInScoreboard: boolean;
        }) => {
          api.Contest.update({
            contest_alias: payload.details.alias,
            admission_mode: admissionMode,
            default_show_all_contestants_in_scoreboard: defaultShowAllContestantsInScoreboard,
          })
            .then(() => {
              state.details.admission_mode = admissionMode;
              state.details.default_show_all_contestants_in_scoreboard = defaultShowAllContestantsInScoreboard;
              ui.success(
                ui.formatString(T.contestEditContestEdited, {
                  alias: payload.details.alias,
                }),
              );
              methods.refreshDetails();
              if (admissionMode === 'registration') {
                methods.refreshRequests();
              }
            })
            .catch(ui.apiError);
        },
        onAddUser: (contestants: string[]) => {
          Promise.allSettled(
            contestants.map((user: string) =>
              api.Contest.addUser({
                contest_alias: payload.details.alias,
                usernameOrEmail: user,
              }).catch(() => Promise.reject(user)),
            ),
          )
            .then((results) => {
              const contestantsWithError: string[] = results
                .filter(
                  (result): result is PromiseRejectedResult =>
                    result.status === 'rejected',
                )
                .map((result) => result.reason);
              methods.refreshUsers();
              methods.refreshRequests();
              if (!contestantsWithError.length) {
                ui.success(
                  contestants.length === 1
                    ? T.singleUserAddSuccess
                    : T.bulkUserAddSuccess,
                );
              } else {
                ui.error(
                  ui.formatString(T.bulkUserAddError, {
                    userEmail: contestantsWithError.join('<br>'),
                  }),
                );
              }
            })
            .catch(ui.ignoreError);
        },
        onRemoveUser: (contestant: types.ContestUser) => {
          api.Contest.removeUser({
            contest_alias: payload.details.alias,
            usernameOrEmail: contestant.username,
          })
            .then(() => {
              ui.success(T.userRemoveSuccess);
              methods.refreshUsers();
            })
            .catch(ui.apiError);
        },
        onSaveEndTime: (user: types.ContestUser) => {
          if (user.end_time === undefined) {
            return;
          }
          api.Contest.updateEndTimeForIdentity({
            contest_alias: payload.details.alias,
            username: user.username,
            end_time: user.end_time,
          })
            .then(() => {
              ui.success(T.userEndTimeUpdatedSuccessfully);
            })
            .catch(ui.apiError);
        },
        onAcceptRequest: ({ username }: { username: string }) => {
          methods.arbitrateRequest(username, true);
        },
        onDenyRequest: ({
          username,
          resolutionText,
        }: {
          username: string;
          resolutionText: null | string;
        }) => {
          methods.arbitrateRequest(username, false, resolutionText);
        },
        onAddAdmin: (username: string) => {
          api.Contest.addAdmin({
            contest_alias: payload.details.alias,
            usernameOrEmail: username,
          })
            .then(() => {
              ui.success(T.adminAdded);
              methods.refreshAdmins();
            })
            .catch(ui.apiError);
        },
        onRemoveAdmin: (username: string) => {
          api.Contest.removeAdmin({
            contest_alias: payload.details.alias,
            usernameOrEmail: username,
          })
            .then(() => {
              ui.success(T.adminRemoved);
              methods.refreshAdmins();
            })
            .catch(ui.apiError);
        },
        onAddGroupAdmin: (groupAlias: string) => {
          api.Contest.addGroupAdmin({
            contest_alias: payload.details.alias,
            group: groupAlias,
          })
            .then(() => {
              ui.success(T.groupAdminAdded);
              methods.refreshGroupAdmins();
            })
            .catch(ui.apiError);
        },
        onRemoveGroupAdmin: (groupAlias: string) => {
          api.Contest.removeGroupAdmin({
            contest_alias: payload.details.alias,
            group: groupAlias,
          })
            .then(() => {
              ui.success(T.groupAdminRemoved);
              methods.refreshGroupAdmins();
            })
            .catch(ui.apiError);
        },
        onAddGroup: (groupAlias: string) => {
          api.Contest.addGroup({
            contest_alias: payload.details.alias,
            group: groupAlias,
          })
            .then(() => {
              ui.success(T.contestGroupAdded);
              methods.refreshGroups();
            })
            .catch(ui.apiError);
        },
        onRemoveGroup: (groupAlias: string) => {
          api.Contest.removeGroup({
            contest_alias: payload.details.alias,
            group: groupAlias,
          })
            .then(() => {
              ui.success(T.contestGroupRemoved);
              methods.refreshGroups();
            })
            .catch(ui.apiError);
        },
        onCloneContest: (
          title: string,
          alias: string,
          description: string,
          startTime: Date,
        ) => {
          api.Contest.clone({
            contest_alias: payload.details.alias,
            title: title,
            alias: alias,
            description: description,
            start_time: startTime.getTime() / 1000,
          })
            .then(() => {
              ui.success(T.contestEditContestClonedSuccessfully);
            })
            .catch(ui.apiError);
        },
        onArchiveContest: (contestAlias: string, archive: string) => {
          api.Contest.archive({ contest_alias: contestAlias, archive })
            .then(() => {
              if (archive) {
                ui.success(T.contestEditArchivedSuccess);
                return;
              }
              ui.success(T.contestEditUnarchivedSuccess);
            })
            .catch(ui.apiError);
        },
        onReplaceTeamsGroup: ({
          alias,
          name,
        }: {
          alias: string;
          name: string;
        }) => {
          api.Contest.replaceTeamsGroup({
            contest_alias: payload.details.alias,
            teams_group_alias: alias,
          })
            .then(() => {
              state.teamsGroup = { alias, name };
              ui.success(T.contestEditTeamsGroupReplaced);
            })
            .catch(ui.apiError);
        },
        onLanguageRemoveBlocked: (language: string) => {
          ui.warning(
            ui.formatString(T.contestNewFormLanguageRemoveBlockedWarning, {
              language: language,
            }),
          );
        },
        onDownloadCsvScoreboard: (contestAlias: string) => {
          api.Contest.scoreboard({ contest_alias: contestAlias })
            .then((result) => {
              const table: TableCell[][] = [];
              const header = [
                T.profileContestsTablePlace,
                T.profileUsername,
                T.profileName,
              ];
              for (let index = 0; index < result.problems.length; index++) {
                header.push(ui.columnName(index));
              }
              header.push('Total');
              table.push(header);
              for (const user of result.ranking) {
                const row: TableCell[] = [
                  user.place || '',
                  user.username,
                  user.name || '',
                ];
                for (const problem of user.problems) {
                  if (problem.runs > 0) {
                    row.push(problem.points.toFixed(2));
                  } else {
                    row.push('');
                  }
                }
                row.push(user.total.points.toFixed(2));
                table.push(row);
              }
              methods.downloadCsvFile(`${contestAlias}_scoreboard.csv`, table);
            })
            .catch(ui.apiError);
        },
        onShowCopyMessage: (): void => {
          ui.success(T.contestEditContestLinkCopiedToClipboard);
        },
        onGenerateCertificates: (certificateCutoff: number) => {
          api.Certificate.generateContestCertificates({
            certificates_cutoff: certificateCutoff,
            contest_alias: payload.details.alias,
          })
            .then(() => {
              state.certificatesDetails.certificatesStatus = 'queued';
              state.certificatesDetails.certificateCutoff = certificateCutoff;
              ui.success(T.contestCertificatesGenerateSuccessfully);
            })
            .catch(ui.apiError);
        },
      }),
  });
  app.mount('#main-container');
});

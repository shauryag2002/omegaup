import teamsgroup_Edit, {
  AvailableTabs,
} from '../components/teamsgroup/Edit.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';
import * as CSV from '@/third_party/js/csv.js/csv.js';
import {
  downloadCsvFile,
  generateHumanReadablePassword,
  generatePassword,
  getCSVRecords,
  identityOptionalFields,
  identityRequiredFields,
} from '../groups';

export type CsvTeam = types.Identity & { usernames: string };

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.TeamGroupEditPayload();
  const searchResultSchools: types.SchoolListItem[] = [];
  const state = reactive({
    tab: window.location.hash
      ? window.location.hash.substr(1)
      : AvailableTabs.Teams,
    teamsIdentities: payload.identities,
    teamsMembers: payload.teamsMembers,
    userErrorRow: null,
    searchResultUsers: [] as types.ListItem[],
    isLoading: false,
    searchResultSchools: searchResultSchools,
  });

  const methods = {
    refreshTeamsList: (): void => {
      api.TeamsGroup.teams({ team_group_alias: payload.teamGroup.alias })
        .then((data) => {
          state.teamsIdentities = data.identities;
        })
        .catch(ui.apiError);
    },
    refreshTeamsMembersList: (): void => {
      api.TeamsGroup.teamsMembers({
        team_group_alias: payload.teamGroup.alias,
      })
        .then((data) => {
          state.teamsMembers = data.teamsUsers;
        })
        .catch(ui.apiError);
    },
  };

  const app = createApp({
    methods,
    render: () =>
      h(teamsgroup_Edit, {
        alias: payload.teamGroup.alias,
        name: payload.teamGroup.name,
        description: payload.teamGroup.description,
        numberOfContestants: payload.teamGroup.numberOfContestants,
        maxNumberOfContestants: payload.maxNumberOfContestants,
        countries: payload.countries,
        isOrganizer: payload.isOrganizer,
        tab: state.tab,
        teamsIdentities: state.teamsIdentities,
        teamsMembers: state.teamsMembers,
        userErrorRow: state.userErrorRow,
        searchResultUsers: state.searchResultUsers,
        searchResultSchools: state.searchResultSchools,
        isLoading: state.isLoading,
        onUpdateTeamsGroup: ({
          name,
          description,
          numberOfContestants,
        }: {
          name: string;
          description: string;
          numberOfContestants: number;
        }) => {
          api.TeamsGroup.update({
            alias: payload.teamGroup.alias,
            name,
            description,
            numberOfContestants,
          })
            .then(() => {
              ui.success(T.teamsGroupEditGroupUpdated);
            })
            .catch(ui.apiError);
        },
        onEditIdentityTeam: ({
          originalUsername,
          identity,
        }: {
          originalUsername: string;
          identity: CsvTeam;
        }) => {
          api.Identity.updateIdentityTeam({
            ...identity,
            group_alias: payload.teamGroup.alias,
            original_username: originalUsername,
            school_name: identity.school,
          })
            .then(() => {
              ui.success(T.teamsGroupEditTeamsUpdated);
              methods.refreshTeamsList();
            })
            .catch(ui.apiError);
        },
        onChangePasswordIdentityTeam: ({
          username,
          newPassword,
          newPasswordRepeat,
        }: {
          username: string;
          newPassword: string;
          newPasswordRepeat: string;
        }) => {
          if (newPassword !== newPasswordRepeat) {
            ui.error(T.userPasswordMustBeSame);
            return;
          }

          api.Identity.changePassword({
            group_alias: payload.teamGroup.alias,
            password: newPassword,
            username: username,
          })
            .then(() => {
              methods.refreshTeamsList();
              ui.success(T.teamsGroupEditTeamsPasswordUpdated);
            })
            .catch(ui.apiError);
        },
        onChangePasswordIdentity: ({
          username,
          newPassword,
        }: {
          username: string;
          newPassword: string;
        }) => {
          api.Identity.changePassword({
            group_alias: payload.teamGroup.alias,
            password: newPassword,
            username: username,
          })
            .then(() => {
              ui.success(T.teamsGroupEditTeamsPasswordUpdated);
            })
            .catch(ui.apiError);
        },
        remove: (username: string) => {
          api.Group.removeUser({
            group_alias: payload.teamGroup.alias,
            usernameOrEmail: username,
          })
            .then(() => {
              methods.refreshTeamsList();
              ui.success(T.teamsGroupEditTeamsRemoved);
            })
            .catch(ui.apiError);
        },
        onUpdateSearchResultUsers: (query: string) => {
          api.User.list({ query })
            .then(({ results }) => {
              // Users previously invited to any team in the current teams
              // group can not be added to another, so they should not be
              // shown in the dropdown
              const addedUsers = new Set(
                state.teamsMembers.map((user) => user.username),
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
        onUpdateSearchResultSchools: (query: string) => {
          api.School.list({ query })
            .then(({ results }) => {
              if (!results.length) {
                state.searchResultSchools = [
                  {
                    key: 0,
                    value: query,
                  },
                ];
                return;
              }
              state.searchResultSchools = results.map(
                ({ key, value }: types.SchoolListItem) => ({
                  key,
                  value,
                }),
              );
            })
            .catch(ui.apiError);
        },
        onBulkIdentities: ({
          identities,
          identitiesTeams,
        }: {
          identities: types.Identity[];
          identitiesTeams: {
            [team: string]: { username: string; password?: string };
          };
        }) => {
          state.isLoading = true;
          api.Identity.bulkCreateForTeams({
            team_identities: JSON.stringify(
              identities.map((identity) => ({
                ...identity,
                usernames: JSON.stringify(identitiesTeams[identity.username]),
              })),
            ),
            team_group_alias: payload.teamGroup.alias,
          })
            .then(() => {
              methods.refreshTeamsList();
              methods.refreshTeamsMembersList();
              window.location.hash = `#${AvailableTabs.Teams}`;
              state.tab = AvailableTabs.Teams;
              ui.success(T.groupsIdentitiesSuccessfullyCreated);
            })
            .catch((data) => {
              ui.error(data.error);
              state.userErrorRow = data.parameter;
            })
            .finally(() => {
              state.isLoading = false;
            });
        },
        onInvalidFile: () => {
          ui.error(T.groupsInvalidCsv);
        },

        onUpdateIdentityTeam: (identity: types.Identity) => {
          if (identity.school && identity.school_id) {
            searchResultSchools.splice(0, searchResultSchools.length);
            searchResultSchools.push({
              key: identity.school_id,
              value: identity.school,
            });
          }
        },
        onAddMembers: ({
          teamUsername,
          usersToAdd,
        }: {
          teamUsername: string;
          usersToAdd: string[];
        }) => {
          api.TeamsGroup.addMembers({
            team_group_alias: teamUsername,
            usernames: usersToAdd,
          })
            .then(() => {
              ui.success(T.groupEditMemberAdded);
              methods.refreshTeamsMembersList();
            })
            .catch(ui.apiError);
        },
        onRemoveMember: ({
          teamUsername,
          username,
        }: {
          teamUsername: string;
          username: string;
        }) => {
          api.TeamsGroup.removeMember({
            team_group_alias: teamUsername,
            username,
          })
            .then(() => {
              ui.success(T.groupEditMemberRemoved);
              methods.refreshTeamsMembersList();
            })
            .catch(ui.apiError);
        },
        onDownloadTeams: (identities: types.Participant[]) => {
          downloadCsvFile({
            fileName: `identities_${payload.teamGroup.alias}.csv`,
            columns: [
              'username',
              'name',
              'country_id',
              'state_id',
              'gender',
              'school_name',
              'participant_username',
              'participant_password',
            ],
            records: identities,
          });
        },
        onReadCsv: ({
          identitiesTeams,
          identities,
          file,
          humanReadable,
          selfGeneratedIdentities,
          numberOfContestants,
        }: {
          identitiesTeams: {
            [team: string]: { username: string; password?: string }[];
          };
          identities: CsvTeam[];
          file: File;
          humanReadable: boolean;
          selfGeneratedIdentities: boolean;
          numberOfContestants: number;
        }) => {
          CSV.fetch({ file }).done((dataset: CSV.Dataset) => {
            if (!dataset.fields) {
              ui.error(T.groupsInvalidCsv);
              return;
            }
            const records = getCSVRecords<CsvTeam>({
              fields: dataset.fields,
              records: dataset.records,
              requiredFields: identityRequiredFields,
              optionalFields: identityOptionalFields,
            });
            for (const {
              username,
              name,
              country_id,
              state_id,
              gender,
              school_name,
              usernames,
            } of records) {
              identities.push({
                username: `teams:${payload.teamGroup.alias}:${username}`,
                name,
                password: humanReadable
                  ? generateHumanReadablePassword()
                  : generatePassword(),
                country_id,
                state_id,
                school_name,
                gender: gender ?? 'decline',
                usernames,
              });
              const members: { username: string; password?: string }[] =
                usernames?.split(';').map((user) => ({ username: user })) ?? [];

              const group = payload.teamGroup.alias;
              if (selfGeneratedIdentities) {
                const numberOfExistingUsers = members.length;
                const numberOfContestantsToGenerate =
                  numberOfContestants - numberOfExistingUsers;
                for (let i = 0; i < numberOfContestantsToGenerate; i++) {
                  members.push({
                    username: `${group}:${username}_identity_${i}`,
                    password: humanReadable
                      ? generateHumanReadablePassword()
                      : generatePassword(),
                  });
                }
              }
              identitiesTeams[`teams:${payload.teamGroup.alias}:${username}`] =
                members;
            }
            ui.dismissNotifications();
            state.userErrorRow = null;
          });
        },
      }),
  });
  app.mount('#main-container');
});

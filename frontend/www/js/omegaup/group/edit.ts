import group_Edit, { AvailableTabs } from '../components/group/Edit.vue';
import group_Members from '../components/group/Members.vue';
import group_Scoreboards from '../components/group/Scoreboards.vue';
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

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.GroupEditPayload();
  const searchResultSchools: types.SchoolListItem[] = [];
  const state = reactive({
    tab: window.location.hash
      ? window.location.hash.substring(1)
      : AvailableTabs.Members,
    identities: payload.identities.filter(
      (identity) => !identity.username.includes(':'),
    ),
    identitiesCsv: payload.identities.filter((identity) =>
      identity.username.includes(':'),
    ),
    scoreboards: payload.scoreboards,
    userErrorRow: null,
    searchResultUsers: [] as types.ListItem[],
    searchResultSchools: searchResultSchools,
  });

  interface ScoreboardsExposed {
    reset: () => void;
  }

  interface MembersExposed {
    showEditForm: boolean;
    showChangePasswordForm: boolean;
    identity: types.Identity;
    username: string;
    reset: () => void;
    $el: HTMLElement;
  }

  const methods = {
    refreshGroupScoreboards: (): void => {
      api.Group.details({ group_alias: payload.groupAlias })
        .then((group) => {
          state.scoreboards = group.scoreboards;
        })
        .catch(ui.apiError);
    },
    refreshMemberList: (): void => {
      api.Group.members({ group_alias: payload.groupAlias })
        .then((data) => {
          state.identities = data.identities.filter(
            (identity) => !identity.username.includes(':'),
          );
          state.identitiesCsv = data.identities.filter((identity) =>
            identity.username.includes(':'),
          );
        })
        .catch(ui.apiError);
    },
  };

  const app = createApp({
    methods,
    render: () =>
      h(group_Edit, {
        groupAlias: payload.groupAlias,
        groupName: payload.groupName,
        groupDescription: payload.groupDescription,
        countries: payload.countries,
        isOrganizer: payload.isOrganizer,
        tab: state.tab,
        identities: state.identities,
        identitiesCsv: state.identitiesCsv,
        scoreboards: state.scoreboards,
        userErrorRow: state.userErrorRow,
        searchResultUsers: state.searchResultUsers,
        searchResultSchools: state.searchResultSchools,
        hasVisitedSection: payload.hasVisitedSection,
        onUpdateGroup: (name: string, description: string) => {
          api.Group.update({
            alias: payload.groupAlias,
            name: name,
            description: description,
          })
            .then(() => {
              ui.success(T.groupEditGroupUpdated);
            })
            .catch(ui.apiError);
        },
        onCreateScoreboard: (
          source: ScoreboardsExposed,
          scoreboardName: string,
          scoreboardAlias: string,
          scoreboardDescription: string,
        ) => {
          api.Group.createScoreboard({
            group_alias: payload.groupAlias,
            alias: scoreboardAlias,
            name: scoreboardName,
            description: scoreboardDescription,
          })
            .then(() => {
              ui.success(T.groupEditScoreboardsAdded);
              methods.refreshGroupScoreboards();
              source.reset();
            })
            .catch(ui.apiError);
        },
        onAddMember: (source: MembersExposed, username: string) => {
          api.Group.addUser({
            group_alias: payload.groupAlias,
            usernameOrEmail: username,
          })
            .then(() => {
              methods.refreshMemberList();
              ui.success(T.groupEditMemberAdded);
              source.reset();
            })
            .catch(ui.apiError);
        },
        onEditIdentity: (source: MembersExposed, identity: types.Identity) => {
          source.showEditForm = true;
          source.showChangePasswordForm = false;
          source.identity = identity;
          source.username = identity.username;
          if (identity.school && identity.school_id) {
            searchResultSchools.splice(0, searchResultSchools.length);
            searchResultSchools.push({
              key: identity.school_id,
              value: identity.school,
            });
          }
        },
        onEditIdentityMember: (request: {
          originalUsername: string;
          identity: types.Identity;
          showEditForm: boolean;
        }) => {
          api.Identity.update({
            ...request.identity,
            original_username: request.originalUsername,
            group_alias: payload.groupAlias,
            school_name: request.identity.school,
          })
            .then(() => {
              ui.success(T.groupEditMemberUpdated);
              request.showEditForm = false;
              methods.refreshMemberList();
            })
            .catch(ui.apiError);
        },
        onChangePasswordIdentity: (source: MembersExposed, username: string) => {
          source.showEditForm = false;
          source.showChangePasswordForm = true;
          source.username = username;
        },
        onChangePasswordIdentityMember: (
          source: MembersExposed,
          username: string,
          newPassword: string,
          newPasswordRepeat: string,
        ) => {
          if (newPassword !== newPasswordRepeat) {
            ui.error(T.userPasswordMustBeSame);
            return;
          }

          api.Identity.changePassword({
            group_alias: payload.groupAlias,
            password: newPassword,
            username: username,
          })
            .then(() => {
              methods.refreshMemberList();
              ui.success(T.groupEditMemberPasswordUpdated);
              source.showChangePasswordForm = false;
              source.reset();
            })
            .catch(ui.apiError);
        },
        remove: (username: string) => {
          api.Group.removeUser({
            group_alias: payload.groupAlias,
            usernameOrEmail: username,
          })
            .then(() => {
              methods.refreshMemberList();
              ui.success(T.groupEditMemberRemoved);
            })
            .catch(ui.apiError);
        },
        cancel: (source: MembersExposed) => {
          methods.refreshMemberList();
          source.showEditForm = false;
          source.showChangePasswordForm = false;
          source.$el.scrollIntoView();
        },
        onBulkIdentities: (identities: types.Identity[]) => {
          api.Identity.bulkCreate({
            identities: JSON.stringify(identities),
            group_alias: payload.groupAlias,
          })
            .then(() => {
              methods.refreshMemberList();
              window.location.hash = `#${AvailableTabs.Members}`;
              state.tab = AvailableTabs.Members;
              ui.success(T.groupsIdentitiesSuccessfullyCreated);
            })
            .catch((data) => {
              ui.error(data.error);
              state.userErrorRow = data.parameter;
            });
        },
        onDownloadIdentities: (identities: types.Identity[]) => {
          downloadCsvFile({
            fileName: `identities_${payload.groupAlias}.csv`,
            columns: [
              'username',
              'name',
              'password',
              'country_id',
              'state_id',
              'gender',
              'school_name',
            ],
            records: identities,
          });
        },
        onReadCsv: ({
          identities,
          file,
          humanReadable,
        }: {
          identities: types.Identity[];
          file: File;
          humanReadable: boolean;
        }) => {
          CSV.fetch({ file })
            .done((dataset: CSV.Dataset) => {
              if (!dataset.fields) {
                ui.error(T.groupsInvalidCsv);
                return;
              }
              const records = getCSVRecords<types.Identity>({
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
              } of records) {
                identities.push({
                  username: `${payload.groupAlias}:${username}`,
                  name,
                  password: humanReadable
                    ? generateHumanReadablePassword()
                    : generatePassword(),
                  country_id,
                  state_id,
                  gender,
                  school_name,
                });
              }
              ui.dismissNotifications();
              state.userErrorRow = null;
            })
            .fail((data: { error: string }) => {
              ui.error(data.error);
            });
        },
        onInvalidFile: () => {
          ui.error(T.groupsInvalidCsv);
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
      }),
  });
  app.mount('#main-container');
});

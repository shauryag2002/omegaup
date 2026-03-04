import course_Form from '../components/course/Form.vue';
import { OmegaUp } from '../omegaup';
import { messages, types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import { createApp, h, reactive } from 'vue';
import T from '../lang';

OmegaUp.on('ready', () => {
  const now = new Date();
  const finishTime = new Date();
  finishTime.setDate(finishTime.getDate() + 30);
  const defaultStartTime = now;
  const defaultFinishTime = finishTime;
  const searchResultSchools: types.SchoolListItem[] = [];
  const payload = types.payloadParsers.CourseNewPayload();
  const state = reactive({
    invalidParameterName: null as null | string,
    searchResultSchools: searchResultSchools,
  });

  createApp({
    render: () =>
      h(course_Form as any, {
        course: {
          alias: '',
          description: '',
          start_time: defaultStartTime,
          finish_time: defaultFinishTime,
          show_scoreboard: false,
          level: null,
          objective: null,
          name: '',
          school_name: '',
          languages: Object.keys(payload.languages),
          needs_basic_information: false,
          requests_user_information: 'no',
          is_curator: payload.is_curator,
          is_admin: payload.is_admin,
          hasVisitedSection: payload.hasVisitedSection,
        },
        allLanguages: payload.languages,
        invalidParameterName: state.invalidParameterName,
        searchResultSchools: state.searchResultSchools,
        hasVisitedSection: payload.hasVisitedSection,
        submit: (request: messages.CourseCreateRequest) => {
          new Promise<number | null>((resolve, reject) => {
            if (request.school?.key) {
              resolve(request.school.key);
            } else if (request.school?.value) {
              api.School.create({ name: request.school.value })
                .then((data) => {
                  resolve(data.school_id);
                })
                .catch((error) => {
                  ui.apiError(error);
                  state.invalidParameterName = 'school';
                });
            } else {
              reject(new Error(T.schoolNotSelected));
            }
          })
            .then((schoolId) => {
              if (schoolId) {
                request.school_id = schoolId;
              }
              api.Course.create(request)
                .then(() => {
                  state.invalidParameterName = '';
                  window.location.replace(
                    `/course/${request.alias}/edit/#content`,
                  );
                })
                .catch((error) => {
                  ui.apiError(error);
                  state.invalidParameterName = error.parameter || '';
                });
            })
            .catch((error) => {
              ui.error(error.message);
              state.invalidParameterName = 'school';
            });
        },
        cancel: () => {
          window.location.href = '/course/';
        },
        onUpdateSearchResultSchools: (query: string) => {
          if (state.invalidParameterName === 'school') {
            state.invalidParameterName = '';
          }
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
        onInvalidLanguages: () => {
          ui.error(T.courseNewFormLanguagesRequired);
          state.invalidParameterName = 'languages';
        },
        onClearLanguageError: () => {
          if (state.invalidParameterName === 'languages') {
            state.invalidParameterName = null;
            ui.dismissNotifications();
          }
        },
      }),
  }).mount('#main-container');
});

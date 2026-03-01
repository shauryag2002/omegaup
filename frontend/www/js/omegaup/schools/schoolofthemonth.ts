import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';
import schoolOfTheMonth_List from '../components/schoolofthemonth/List.vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.SchoolOfTheMonthPayload();
  const state = reactive({
    schoolIsSelected:
      payload.isMentor && payload.options && payload.options.schoolIsSelected,
  });

  createApp({
    render: () =>
      h(schoolOfTheMonth_List, {
        schoolsOfPreviousMonth: payload.schoolsOfPreviousMonth,
        schoolsOfPreviousMonths: payload.schoolsOfPreviousMonths,
        candidatesToSchoolOfTheMonth: payload.candidatesToSchoolOfTheMonth,
        isMentor: payload.isMentor,
        canChooseSchool:
          payload.isMentor &&
          payload.options &&
          payload.options.canChooseSchool,
        schoolIsSelected: state.schoolIsSelected,
        onSelectSchool: function (schoolId: number) {
          api.School.selectSchoolOfTheMonth({
            school_id: schoolId,
          })
            .then(() => {
              ui.success(T.schoolOfTheMonthSelectedSuccessfully);
              state.schoolIsSelected = true;
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

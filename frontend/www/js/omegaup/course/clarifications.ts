import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';
import * as api from '../api';
import * as ui from '../ui';

import course_Clarifications from '../components/course/Clarifications.vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CourseClarificationsPayload();
  createApp({
    render: () =>
      h(course_Clarifications, {
        isAdmin: payload.is_admin || payload.is_teaching_assistant,
        clarifications: payload.clarifications,
        pagerItems: payload.pagerItems,
        pageSize: payload.length,
        page: payload.page,
        onClarificationResponse: (clarification: types.Clarification) => {
          api.Clarification.update(clarification)
            .then(() => window.location.reload())
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');
});

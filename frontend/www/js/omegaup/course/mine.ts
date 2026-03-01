import course_List from '../components/course/Mine.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CourseListMinePayload();
  const headerPayload = types.payloadParsers.CommonPayload();
  createApp({
    render: () =>
      h(course_List, {
        courses: payload.courses,
        isMainUserIdentity: headerPayload?.isMainUserIdentity ?? false,
      }),
  }).mount('#main-container');
});

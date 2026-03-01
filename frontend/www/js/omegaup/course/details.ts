import { createApp, h } from 'vue';
import course_Details from '../components/course/Details.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CourseDetailsPayload();
  const headerPayload = types.payloadParsers.CommonPayload();
  createApp({
    render: () =>
      h(course_Details, {
        course: payload.details,
        progress: payload.progress,
        currentUsername: headerPayload.currentUsername,
      }),
  }).mount('#main-container');
});

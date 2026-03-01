import course_SubmissionsList from '../components/activity/SubmissionsList.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CourseSubmissionsListPayload();
  createApp({
    render: () =>
      h(course_SubmissionsList, {
        solvedProblems: payload.solvedProblems,
        unsolvedProblems: payload.unsolvedProblems,
      }),
  }).mount('#main-container');
});

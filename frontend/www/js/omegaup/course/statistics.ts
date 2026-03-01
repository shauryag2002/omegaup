import course_Statistics from '../components/course/Statistics.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import T from '../lang';
import { createApp, h } from 'vue';

OmegaUp.on('ready', function () {
  const payload = types.payloadParsers.CourseStatisticsPayload();
  createApp({
    render: () =>
      h(course_Statistics, {
        T: T,
        course: payload.course,
        problemStats: payload.problemStats,
        verdicts: payload.verdicts,
      }),
  }).mount('#main-container');
});

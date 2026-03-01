import course_Homepage from '../components/course/Homepage.vue';
import { OmegaUp } from '../omegaup';
import { createApp, h } from 'vue';

OmegaUp.on('ready', () => {
  createApp({
    render: () => h(course_Homepage),
  }).mount('#main-container');
});

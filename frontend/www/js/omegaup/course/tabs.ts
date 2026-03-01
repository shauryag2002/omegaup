import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import { createApp, h } from 'vue';
import course_Tabs, { Tab } from '../components/course/Tabs.vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CourseTabsPayload();
  const commonPayload = types.payloadParsers.CommonPayload();
  const locationHashTab = window.location.hash.substr(1);
  let selectedTab = Tab.Public;
  for (const tab of Object.values(Tab)) {
    if (locationHashTab === tab) {
      selectedTab = locationHashTab;
      break;
    }
  }
  createApp({
    render: () =>
      h(course_Tabs, {
        courses: payload.courses,
        loggedIn: commonPayload.isLoggedIn,
        selectedTab,
        hasVisitedSection: payload.hasVisitedSection,
      }),
  }).mount('#main-container');
});

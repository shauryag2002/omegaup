import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';
import coderofthemonth_List from '../components/coderofthemonth/List.vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CoderOfTheMonthPayload();
  const locationHash = window.location.hash.substring(1).split('/')[0];
  const selectedTab = getSelectedValidTab(locationHash);
  if (selectedTab !== locationHash) {
    window.location.hash = selectedTab;
  }
  const state = reactive({
    coderIsSelected:
      payload.isMentor && payload.options && payload.options.coderIsSelected,
  });

  createApp({
    render: () =>
      h(coderofthemonth_List, {
        codersOfCurrentMonth: payload.codersOfCurrentMonth,
        codersOfPreviousMonth: payload.codersOfPreviousMonth,
        candidatesToCoderOfTheMonth: payload.candidatesToCoderOfTheMonth,
        isMentor: payload.isMentor,
        selectedTab,
        canChooseCoder: payload.isMentor && payload.options?.canChooseCoder,
        coderIsSelected: state.coderIsSelected,
        category: payload.category,
        onSelectCoder: (coderUsername: string, category: string) => {
          api.User.selectCoderOfTheMonth({
            username: coderUsername,
            category: category,
          })
            .then(() => {
              ui.success(
                payload.category == 'all'
                  ? T.coderOfTheMonthSelectedSuccessfully
                  : T.coderOfTheMonthFemaleSelectedSuccessfully,
              );
              state.coderIsSelected = true;
            })
            .catch(ui.apiError);
        },
      }),
  }).mount('#main-container');

  function getSelectedValidTab(tab: string): string {
    const validTabs = [
      'codersOfTheMonth',
      'codersOfPreviousMonth',
      'candidatesToCoderOfTheMonth',
    ];
    const defaultTab = 'codersOfTheMonth';
    const isValidTab = validTabs.includes(tab);
    return isValidTab ? tab : defaultTab;
  }
});

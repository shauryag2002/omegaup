import { mount } from '@vue/test-utils';

import Tabs from './Tabs.vue';
import BootstrapVueNext from 'bootstrap-vue-next';
import store from '@/js/omegaup/problem/creator/store';

import T from '../../../lang';
import { nextTick } from 'vue';


describe('Tabs.vue', () => {
  it('Should contain all 4 tabs', async () => {
    const wrapper = mount(Tabs, { global: { plugins: [store, BootstrapVueNext] } });

    const expectedText = [
      T.problemCreatorStatement,
      T.problemCreatorCode,
      T.problemCreatorTestCases,
      T.problemCreatorSolution,
    ];

    // BootstrapVue takes a tick to render the content inside the tabs
    await nextTick();

    const buttons = wrapper.findAll('[data-problem-creator-tab]');
    expect(expectedText.length).toEqual(buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      expect(buttons.at(i).text()).toEqual(expectedText[i]);
    }
  });
});

import { shallowMount } from '@vue/test-utils';

import CasesTab from './CasesTab.vue';
import Sidebar from './Sidebar.vue';
import AddPanel from './AddPanel.vue';
import { createBootstrap } from 'bootstrap-vue-next';
import { nextTick } from 'vue';

describe('Tabs.vue', () => {
  it('Should contain 3 buttons and Groups text', async () => {
    const wrapper = shallowMount(CasesTab, {
      global: { plugins: [createBootstrap()] },
    });

    const sidebar = wrapper.findComponent(Sidebar);
    expect(sidebar.exists()).toBe(true);
  });
  it('Should render "AddPanel.vue" conditionally', async () => {
    const wrapper = shallowMount(CasesTab, {
      global: { plugins: [createBootstrap()] },
    });

    let addWindow = wrapper.findComponent(AddPanel);
    expect(addWindow.element).toBeUndefined();

    wrapper.setData({ shouldShowAddWindow: true });

    await nextTick();

    addWindow = wrapper.findComponent(AddPanel);
    expect(addWindow.element).not.toBeUndefined();
  });
});

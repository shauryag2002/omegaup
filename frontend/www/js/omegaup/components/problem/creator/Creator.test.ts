import { shallowMount, createLocalVue } from '@vue/test-utils';

import Creator from './Creator.vue';
import Header from './Header.vue';
import Tabs from './Tabs.vue';

import BootstrapVue, { IconsPlugin } from 'bootstrap-vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(IconsPlugin);

describe('Creator.vue', () => {
  it('Should contain Header and Tabs Components', async () => {
    const wrapper = shallowMount(Creator, { localVue });

    expect(wrapper.findComponent(Header).exists()).toBe(true);
    expect(wrapper.findComponent(Tabs).exists()).toBe(true);
  });

  it('Should delegate zip import to header component', async () => {
    const wrapper = shallowMount(Creator, { localVue });
    const zipFile = new File(['zip-content'], 'sumas.zip', {
      type: 'application/zip',
    });
    const importZipFile = jest.fn().mockResolvedValue({ problemName: 'sumas' });
    Object.defineProperty(wrapper.vm, '$refs', {
      value: {
        creatorHeader: {
          importZipFile,
        },
      },
      configurable: true,
    });

    await (wrapper.vm as any).importZipFile(zipFile);

    expect(importZipFile).toHaveBeenCalledWith(zipFile);
  });
});

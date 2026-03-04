import { shallowMount, VueWrapper } from '@vue/test-utils';

import SolutionTab from './SolutionTab.vue';
import { createBootstrap } from 'bootstrap-vue-next';
import store from '@/js/omegaup/problem/creator/store';
import T from '../../../../lang';

describe('SolutionTab.vue', () => {
  it('Should contain markdown buttons and contents and update the store accordingly', async () => {
    const wrapper = shallowMount(SolutionTab, {
      global: { plugins: [store, createBootstrap()] },
    });

    const markdownButtons = wrapper.find('div.wmd-button-bar');
    expect(markdownButtons.exists()).toBe(true);

    const textArea = wrapper.find('textarea.wmd-input');
    expect(textArea.exists()).toBe(true);
    textArea.setValue('Hello omegaUp');

    expect(wrapper.vm.currentSolutionMarkdown).toBe('Hello omegaUp');

    const markdownContent = wrapper.findComponent(
      'omegaup-markdown-stub',
    ) as VueWrapper;
    expect(markdownContent.exists()).toBe(true);

    await wrapper.trigger('click');

    expect(
      (markdownContent.props() as Record<string, unknown>)['markdown'],
    ).toBe(T.problemCreatorMarkdownPreviewInitialRender + 'Hello omegaUp');

    expect(store.state.problemSolutionMarkdown).toBe('');

    const markdownSaveButton = wrapper.find('button.btn-primary');
    expect(markdownSaveButton.exists()).toBe(true);
    await markdownSaveButton.trigger('click');

    expect(store.state.problemSolutionMarkdown).toBe('Hello omegaUp');
  });
});

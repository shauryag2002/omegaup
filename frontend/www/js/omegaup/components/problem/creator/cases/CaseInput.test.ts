import { shallowMount } from '@vue/test-utils';

import CaseInput from './CaseInput.vue';
import { createBootstrap } from 'bootstrap-vue-next';
import T from '../../../../lang';
import { nextTick } from 'vue';
import store from '@/js/omegaup/problem/creator/store';


describe('CaseInput.vue', () => {
  it('Should contain all 4 inputs', async () => {
    const wrapper = shallowMount(CaseInput, {
      global: { plugins: [store, createBootstrap()] },
    });

    const expectedTextInputText = [
      T.problemCreatorCaseName,
      T.problemCreatorGroupName,
      T.problemCreatorPoints,
      T.problemCreatorAutomaticPointsRecommended,
    ];

    await nextTick();

    const inputElements = wrapper.findAll('[label]');

    expect(inputElements.length).toBe(expectedTextInputText.length);

    inputElements.forEach((element, index) => {
      expect(element.attributes('label')).toBe(expectedTextInputText[index]); // We need to make it like this because that's how Vue-Bootstrap input element works
    });
  });
  it('Should handle autoformatting', () => {
    const wrapper = shallowMount(CaseInput, {
      global: { plugins: [store, createBootstrap()] },
    });

    // These any are necessary since wrapper.vm doesn't load the component's methods to typescript, even if they exist
    const invalidString = 'INVALID STRING234 !@#!@#';
    const result = (wrapper.vm as any).formatter(invalidString);
    expect(result).toBe('invalidstring234');

    const invalidNumber = -2;
    const numberResult = (wrapper.vm as any).pointsFormatter(invalidNumber);
    expect(numberResult).toBe(0);
  });
});

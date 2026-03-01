import TagsInput from './TagsInput.vue';
import { mount } from '@vue/test-utils';
import Vue from 'vue';
import common_MultiTypeahead from './MultiTypeahead.vue';

describe('MultiTypeahead.vue', () => {
  it('Should not call update-existing-options with a short query', async () => {
    const wrapper = mount(common_MultiTypeahead, {
      props: {
        existingOptions: [],
      },
    });

    const tagsInput = wrapper.findComponent(TagsInput);
    tagsInput.vm.$emit('change', 'qu');
    expect(wrapper.emitted()).toEqual({});
  });

  it('Should call update-existing-options with a longer query', async () => {
    const wrapper = mount(common_MultiTypeahead, {
      props: {
        existingOptions: [],
      },
    });

    const tagsInput = wrapper.findComponent(TagsInput);
    tagsInput.vm.$emit('change', 'query');
    expect(wrapper.emitted()).toEqual({
      'update-existing-options': [['query']],
    });
  });

  it('Should call update:value with a non-empty tag', async () => {
    const wrapper = mount(common_MultiTypeahead, {
      props: {
        existingOptions: [],
      },
    });

    const tagsInput = wrapper.findComponent(TagsInput);
    tagsInput.vm.$emit('update:modelValue', [{ key: 'key', value: 'value' }]);
    tagsInput.vm.$emit('tag-added', { key: 'key', value: 'value' });
    await Vue.nextTick();
    expect(wrapper.emitted()).toEqual({
      'update:value': [
        [[{ key: 'key', value: 'value' }]],
        [[{ key: 'key', value: 'value' }]],
      ],
    });
  });

  it('Should call update:value with an empty tag', async () => {
    const wrapper = mount(common_MultiTypeahead, {
      props: {
        existingOptions: [{ key: 'key', value: 'value' }],
      },
    });

    const tagsInput = wrapper.findComponent(TagsInput);
    tagsInput.vm.$emit('update:modelValue', []);
    tagsInput.vm.$emit('tag-removed', { key: 'key', value: 'value' });
    await Vue.nextTick();
    expect(wrapper.emitted()).toEqual({
      'update:value': [[[]]],
    });
  });
});

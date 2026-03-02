<template>
  <div class="root d-flex flex-row h-100">
    <textarea
      v-model="contents"
      class="col pl-1"
      :class="theme"
      :disabled="readOnly"
      :data-title="title"
    ></textarea>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import store from './GraderStore';

export default defineComponent({
  name: 'TextEditor',
  props: {
    storeMapping: {
      type: Object as PropType<{ [key: string]: string }>,
      required: true,
    },
    extension: { type: String, required: true },
    module: { type: String, default: 'NA' },
    readOnly: { type: Boolean, default: false },
  },
  setup(props) {
    const theme = computed((): string => store.getters['theme']);

    const filename = computed((): string => {
      if (props.storeMapping.module) {
        return `${store.getters[props.storeMapping.module]}.${props.extension}`;
      }
      return `${props.module}.${props.extension}`;
    });

    const contents = computed({
      get: (): string => store.getters[props.storeMapping.contents],
      set: (value: string) => {
        if (props.readOnly) return;
        store.dispatch(props.storeMapping.contents, value);
      },
    });

    const title = computed((): string => filename.value);

    return {
      theme,
      filename,
      contents,
      title,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../sass/main.scss';

textarea {
  font-family: 'Droid Sans Mono', 'Courier New', monospace,
    'Droid Sans Fallback';
  border: 0px;
  resize: none;

  &.vs {
    background: var(--vs-background-color);
    color: var(--vs-font-color);
  }

  &.vs-dark {
    background: var(--vs-dark-background-color);
    color: var(--vs-dark-font-color);
  }
}
</style>

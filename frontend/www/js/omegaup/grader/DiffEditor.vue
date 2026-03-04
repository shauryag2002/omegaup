<template>
  <div></div>
</template>

<script lang="ts">
// TODO: replace all instances of any with correct type
import {
  defineComponent,
  computed,
  watch,
  onMounted,
  ref,
  getCurrentInstance,
  PropType,
} from 'vue';
import store from './GraderStore';
import * as monaco from 'monaco-editor';

export default defineComponent({
  name: 'DiffEditor',
  props: {
    storeMapping: {
      type: Object as PropType<{ [key: string]: string }>,
      required: true,
    },
    readOnly: { type: Boolean, default: false },
  },
  setup(props) {
    const _originalModel = ref<monaco.editor.ITextModel | null>(null);
    const _modifiedModel = ref<monaco.editor.ITextModel | null>(null);
    const _editor = ref<monaco.editor.IStandaloneDiffEditor | null>(null);

    const theme = computed((): string => store.getters['theme']);

    const originalContents = computed(
      (): string => store.getters[props.storeMapping.originalContents],
    );

    const modifiedContents = computed(
      (): string => store.getters[props.storeMapping.modifiedContents],
    );

    watch(originalContents, (value) => {
      if (_originalModel.value) {
        _originalModel.value.setValue(value);
      }
    });

    watch(modifiedContents, (value) => {
      if (_modifiedModel.value) {
        _modifiedModel.value.setValue(value);
      }
    });

    onMounted(() => {
      const instance = getCurrentInstance();
      const el = instance?.proxy?.$el as HTMLElement;

      _originalModel.value = monaco.editor.createModel(
        originalContents.value,
        'text/plain',
      );
      _modifiedModel.value = monaco.editor.createModel(
        modifiedContents.value,
        'text/plain',
      );

      // both sides are either editable or not at the same time
      _editor.value = monaco.editor.createDiffEditor(el, {
        theme: theme.value,
        originalEditable: !props.readOnly,
        readOnly: props.readOnly,
      });

      _editor.value.setModel({
        original: _originalModel.value,
        modified: _modifiedModel.value,
      });
    });

    function onResize(): void {
      if (_editor.value) {
        _editor.value.layout();
      }
    }

    return {
      theme,
      originalContents,
      modifiedContents,
      onResize,
    };
  },
});
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>

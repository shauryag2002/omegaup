<template>
  <div ref="editorContainer" class="vue-codemirror-wrap"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

export default defineComponent({
  name: 'CodemirrorEditor',
  props: {
    value: { type: String, default: '' },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['change', 'input'],
  setup(props, { emit, expose }) {
    const editorContainer = ref<HTMLElement | null>(null);
    let editor: CodeMirror.Editor | null = null;

    function refresh(): void {
      editor?.refresh();
    }

    onMounted(() => {
      if (!editorContainer.value) return;
      editor = CodeMirror(editorContainer.value, {
        ...props.options,
        value: props.value,
      });

      editor.on('change', (cm) => {
        const val = cm.getValue();
        emit('change', val);
        emit('input', val);
      });
    });

    onBeforeUnmount(() => {
      if (editor) {
        const wrapper = editor.getWrapperElement();
        wrapper?.parentNode?.removeChild(wrapper);
        editor = null;
      }
    });

    watch(
      () => props.value,
      (newVal) => {
        if (editor && newVal !== editor.getValue()) {
          editor.setValue(newVal);
        }
      },
    );

    watch(
      () => props.options,
      (newOptions) => {
        if (!editor) return;
        for (const [key, val] of Object.entries(newOptions)) {
          editor.setOption(key as keyof CodeMirror.EditorConfiguration, val);
        }
      },
      { deep: true },
    );

    expose({ editor, refresh });

    return {
      editorContainer,
      refresh,
    };
  },
});
</script>

<template>
  <div :class="['h-100', 'd-flex', 'flex-column', theme]">
    <div class="editor-toolbar d-flex align-items-center p-1 form-inline">
      <label class="mr-1 mb-0 p-1">{{ T.fontSize }}</label>
      <select
        v-model="selectedFontSize"
        class="custom-select-sm"
        @change="onFontSizeChange"
      >
        <option v-for="size in fontSizes" :key="size" :value="size">
          {{ size }}px
        </option>
      </select>
    </div>
    <div ref="editorContainer" class="editor flex-grow-1 w-100 h-100"></div>
  </div>
</template>

<script lang="ts">
// TODO: replace all instances of any with correct type
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  PropType,
} from 'vue';
import store from './GraderStore';
import * as Util from './util';
import * as monaco from 'monaco-editor';
import T from '../lang';

export default defineComponent({
  name: 'MonacoEditor',
  props: {
    // TODO: place more restrictions on value of keys inside storeMapping
    storeMapping: {
      type: Object as PropType<{ [key: string]: string }>,
      required: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;
    let model: monaco.editor.ITextModel | null = null;

    const selectedFontSize = ref<number>(12);
    const fontSizes: number[] = [12, 14, 16, 18, 20];

    const editorContainer = ref<HTMLElement | null>(null);

    const theme = computed((): string => store.getters['theme']);
    const language = computed(
      (): string => store.getters[props.storeMapping.language],
    );
    const module = computed(
      (): string => store.getters[props.storeMapping.module],
    );

    const contents = computed({
      get: (): string => store.getters[props.storeMapping.contents],
      set: (value: string) => {
        store.dispatch(props.storeMapping.contents, value);
      },
    });

    const filename = computed(
      (): string =>
        `${module.value}.${Util.supportedLanguages[language.value].extension}`,
    );
    const title = computed((): string => filename.value);

    watch(language, (value: string) => {
      if (model) {
        monaco.editor.setModelLanguage(
          model,
          Util.supportedLanguages[value].modelMapping,
        );
      }
    });

    watch(contents, (value: string) => {
      if (model && model.getValue() !== value) {
        model.setValue(value);
      }
    });

    watch(theme, (value: string) => {
      if (editor) {
        editor.updateOptions({
          theme: value,
        });
      }
    });

    function onResize(): void {
      if (editor) {
        // scaling does not work as intended
        // the cursor does not click where it's supposed to
        // this is an alternative solution to zooming in/out
        editor.layout();
      }
    }

    function onCodeAndLanguageSet(e: any) {
      e.detail.code = contents.value;
      e.detail.language = language.value;
    }

    function onFontSizeChange(): void {
      if (editor) {
        editor.updateOptions({ fontSize: selectedFontSize.value });
      }
    }

    onMounted(() => {
      window.addEventListener('code-and-language-set', onCodeAndLanguageSet);

      const container = editorContainer.value;
      if (!container) return;

      editor = monaco.editor.create(container, {
        autoIndent: 'brackets',
        formatOnPaste: true,
        formatOnType: true,
        language: Util.supportedLanguages[language.value].modelMapping,
        readOnly: props.readOnly,
        theme: theme.value,
        value: contents.value,
        fontSize: selectedFontSize.value,
      } as monaco.editor.IStandaloneEditorConstructionOptions);
      model = editor.getModel();
      if (!model) return;

      model.onDidChangeContent(() => {
        store.dispatch(props.storeMapping.contents, model?.getValue() || '');
      });

      window.addEventListener('resize', onResize);
      onResize();
    });

    onUnmounted(() => {
      window.removeEventListener('code-and-language-set', onCodeAndLanguageSet);
      window.removeEventListener('resize', onResize);
    });

    return {
      T,
      selectedFontSize,
      fontSizes,
      editorContainer,
      theme,
      onFontSizeChange,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../sass/main.scss';

.editor-toolbar {
  background: var(--monaco-editor-toolbar-background-color);
  border-bottom: 1px solid var(--monaco-editor-toolbar-border-bottom-color);
}

.editor-toolbar label {
  font-size: 12px;
  background: var(--monaco-editor-toolbar-label-background-color);
  color: var(--monaco-editor-toolbar-label-color);
  border: 1px solid var(--monaco-editor-toolbar-label-border-color);
}

.editor-toolbar select {
  font-size: 10px;
}

.editor {
  border: 1px solid var(--monaco-editor-toolbar-label-border-color);
}

/* Dark theme styles */
.vs-dark .editor-toolbar {
  background: var(--vs-dark-background-color);
}

.vs-dark .editor-toolbar label {
  background: var(--vs-dark-background-color);
  color: var(--vs-dark-font-color);
}

.vs-dark .editor-toolbar select {
  background-color: var(--vs-dark-background-color);
  color: var(--vs-dark-font-color);
}

.vs-dark .editor {
  border: 1px solid var(--vs-dark-font-color);
}
</style>

<template>
  <div data-code-mirror>
    <codemirror-editor
      ref="cmWrapper"
      :options="editorOptions"
      :value="value"
      @change="onChange"
      @input="onInput"
    ></codemirror-editor>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import T from '../../lang';
import CodemirrorEditor from '../common/CodemirrorEditor.vue';

export const languageModeMap: {
  [language: string]: string;
} = {
  c: 'text/x-csrc',
  'c11-gcc': 'text/x-csrc',
  'c11-clang': 'text/x-csrc',
  cpp: 'text/x-c++src',
  'cpp17-gcc': 'text/x-c++src',
  'cpp17-clang': 'text/x-c++src',
  'cpp20-gcc': 'text/x-c++src',
  'cpp20-clang': 'text/x-c++src',
  java: 'text/x-java',
  kt: 'text/x-kotlin',
  py: 'text/x-python',
  py2: 'text/x-python',
  py3: 'text/x-python',
  rb: 'text/x-ruby',
  pl: 'text/x-perl',
  cs: 'text/x-csharp',
  pas: 'text/x-pascal',
  cat: 'text/plain',
  hs: 'text/x-haskell',
  cpp11: 'text/x-c++src',
  'cpp11-gcc': 'text/x-c++src',
  'cpp11-clang': 'text/x-c++src',
  lua: 'text/x-lua',
  go: 'text/x-go',
  rs: 'text/x-rust',
  js: 'text/x-javascript',
};

// Preload all language modes.
export const modeList: string[] = [
  'clike',
  'python',
  'ruby',
  'perl',
  'pascal',
  'haskell',
  'lua',
  'go',
  'rust',
  'javascript',
];

for (const mode of modeList) {
  require(`codemirror/mode/${mode}/${mode}.js`);
}

export interface EditorOptions {
  tabSize: number;
  lineNumbers: boolean;
  mode?: string;
  readOnly: boolean;
  gutters?: string[];
}

export default defineComponent({
  name: 'CodeView',
  components: {
    'codemirror-editor': CodemirrorEditor,
  },
  props: {
    language: { type: String, default: 'cpp17-gcc' },
    readonly: { type: Boolean, default: false },
    value: { type: String, required: true },
  },
  emits: ['change', 'input', 'change-language'],
  setup(props, { emit, expose }) {
    const cmWrapper = ref<InstanceType<typeof CodemirrorEditor> | null>(null);
    const mode = ref(
      languageModeMap[props.language] || languageModeMap['cpp17-gcc'],
    );

    function refresh() {
      (cmWrapper.value as any)?.refresh();
    }

    const editorOptions = computed((): EditorOptions => {
      return {
        tabSize: 2,
        lineNumbers: true,
        mode: mode.value,
        readOnly: props.readonly,
      };
    });

    function onChange(value: string): void {
      emit('change', value);
    }

    function onInput(value: string): void {
      emit('input', value);
    }

    watch(
      () => props.language,
      (newLanguage: string) => {
        mode.value = languageModeMap[newLanguage];
      },
    );

    onMounted(() => {
      refresh();
      const codeAndLanguage = {
        code: props.value,
        language: props.language,
      };
      window.dispatchEvent(
        new CustomEvent('code-and-language-set', { detail: codeAndLanguage }),
      );

      onInput(codeAndLanguage.code);
      onChange(codeAndLanguage.code);
      emit('change-language', codeAndLanguage.language);
    });

    expose({ refresh });

    return {
      cmWrapper,
      mode,
      editorOptions,
      onChange,
      onInput,
      refresh,
    };
  },
});
</script>

<style lang="scss">
@import '../../../../sass/main.scss';

[data-code-mirror] {
  height: 100%;

  .vue-codemirror-wrap {
    height: 95%;

    .CodeMirror {
      height: 100%;

      .CodeMirror-scroll {
        height: 226px;
      }
    }
  }
}
</style>

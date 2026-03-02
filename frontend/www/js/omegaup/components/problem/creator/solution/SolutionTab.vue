<template>
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-md-6 d-flex flex-column">
          <div
            ref="markdownButtonBar"
            class="wmd-button-bar"
            data-solution-markdown-toolbar
          ></div>
          <textarea
            ref="markdownInput"
            v-model="currentSolutionMarkdown"
            data-problem-creator-solution-editor-markdown
            class="wmd-input"
            @change="currentSolutionMarkdown = $event.target.value"
          ></textarea>
        </div>
        <div class="col-md-6 d-flex flex-column">
          <omegaup-markdown
            data-problem-creator-solution-previewer-markdown
            :markdown="
              T.problemCreatorMarkdownPreviewInitialRender +
              currentSolutionMarkdown
            "
            preview="true"
          ></omegaup-markdown>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <button
            data-problem-creator-solution-save-markdown
            class="btn btn-primary"
            type="submit"
            @click="updateMarkdown"
          >
            {{ T.problemCreatorMarkdownSave }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, nextTick, PropType } from 'vue';
import { useStore } from 'vuex';
import type { StoreState } from '../../../../problem/creator/types';
import * as Markdown from '@/third_party/js/pagedown/Markdown.Editor.js';
import * as markdown from '../../../../markdown';
import * as ui from '../../../../ui';
import T from '../../../../lang';
import { TabIndex } from '../Tabs.vue';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { getCookie, setCookie } from '../../../../cookies';
import ProblemMarkdown from '../../ProblemMarkdown.vue';

const markdownConverter = new markdown.Converter({
  preview: true,
});

export default defineComponent({
  name: 'SolutionTab',
  components: {
    'omegaup-markdown': ProblemMarkdown,
  },
  props: {
    currentSolutionMarkdownProp: {
      type: String,
      default: T.problemCreatorEmpty,
    },
    activeTabIndex: {
      type: Number as PropType<TabIndex>,
      required: true,
    },
  },
  emits: ['show-update-success-message'],
  setup(props, { emit }) {
    const store = useStore<StoreState>();
    const markdownButtonBar = ref<HTMLDivElement | null>(null);
    const markdownInput = ref<HTMLTextAreaElement | null>(null);

    let markdownEditor: Markdown.Editor | null = null;

    const currentSolutionMarkdownInternal = ref<string>(T.problemCreatorEmpty);

    const currentSolutionMarkdown = computed({
      get: () => currentSolutionMarkdownInternal.value,
      set: (newMarkdown: string) => {
        currentSolutionMarkdownInternal.value = newMarkdown;
      },
    });

    watch(() => props.currentSolutionMarkdownProp, () => {
      currentSolutionMarkdown.value = props.currentSolutionMarkdownProp;
    });

    watch(() => props.activeTabIndex, (newIndex: TabIndex) => {
      if (newIndex === TabIndex.Solution) {
        nextTick(() => {
          startIntroGuide();
        });
      }
    });

    onMounted(() => {
      markdownEditor = new Markdown.Editor(markdownConverter.converter, '', {
        panels: {
          buttonBar: markdownButtonBar.value,
          preview: null,
          input: markdownInput.value,
        },
      });
      markdownEditor.run();
    });

    function updateMarkdown() {
      store.commit('updateSolutionMarkdown', currentSolutionMarkdown.value);
      emit('show-update-success-message');
    }

    function startIntroGuide() {
      if (!getCookie('has-visited-solution-tab')) {
        introJs()
          .setOptions({
            nextLabel: T.interactiveGuideNextButton,
            prevLabel: T.interactiveGuidePreviousButton,
            doneLabel: T.interactiveGuideDoneButton,
            steps: [
              {
                title: T.problemCreatorSolutionTabIntroToolbarTitle,
                intro: T.problemCreatorSolutionTabIntroToolbarIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-solution-markdown-toolbar]',
),
              },
              {
                title: T.problemCreatorSolutionTabIntroEditorTitle,
                intro: T.problemCreatorSolutionTabIntroEditorIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-problem-creator-solution-editor-markdown]',
),
              },
              {
                title: T.problemCreatorSolutionTabIntroPreviewTitle,
                intro: T.problemCreatorSolutionTabIntroPreviewIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-problem-creator-solution-previewer-markdown]',
),
              },
              {
                title: T.problemCreatorSolutionTabIntroSaveTitle,
                intro: T.problemCreatorSolutionTabIntroSaveIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-problem-creator-solution-save-markdown]',
),
              },
            ],
          })
          .start();
        setCookie('has-visited-solution-tab', true);
      }
    }

    return {
      T,
      ui,
      markdownButtonBar,
      markdownInput,
      currentSolutionMarkdown,
      updateMarkdown,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../../../../sass/main.scss';
@import '../../../../../../third_party/js/pagedown/demo/browser/demo.css';

.wmd-preview,
.wmd-button-bar {
  background-color: var(--wmd-button-bar-background-color);
}

.row {
  .wmd-button-bar {
    flex-shrink: 0;
  }

  .wmd-input {
    flex: 1;
    min-height: 400px;
    height: auto !important;
    resize: vertical;
  }

  [data-problem-creator-solution-previewer-markdown] {
    flex: 1;
    min-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--markdown-preview-border-color);
    padding: 10px;
    width: 100%;
    margin-top: 35px;
    overflow-wrap: anywhere;
  }
}
</style>

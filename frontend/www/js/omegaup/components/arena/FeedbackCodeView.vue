<template>
  <div>
    <div class="container-fluid" data-feedback-code-mirror>
      <textarea
        v-show="false"
        ref="cm-editor"
        v-model="ensureTenLinesInSolution"
      ></textarea>
    </div>
    <div v-if="!readonly" class="container-fluid text-right py-2">
      <button
        data-button-send-feedback
        class="btn btn-primary mx-2"
        :disabled="!numberOfComments"
        @click.prevent="saveFeedbackList"
      >
        {{ T.submissionSendFeedback }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
// TODO: Only display the gutters in the component if the logged-in user is an
// admin or teaching assistant.
import { defineComponent, ref, computed, onMounted, nextTick, createApp, PropType } from 'vue';
import T from '../../lang';
import CodeMirror from 'codemirror';
import { EditorOptions, languageModeMap, modeList } from './CodeView.vue';
import Feedback, { ArenaCourseFeedback, FeedbackStatus } from './Feedback.vue';
import FeedbackThread from './FeedbackThread.vue';

for (const mode of modeList) {
  require(`codemirror/mode/${mode}/${mode}.js`);
}

export default defineComponent({
  name: 'FeedbackCodeView',
  components: {},
  props: {
    language: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
    feedbackMap: {
      type: Object as PropType<Map<number, ArenaCourseFeedback>>,
      default: () => new Map<number, ArenaCourseFeedback>(),
    },
    feedbackThreadMap: {
      type: Object as PropType<Map<number, ArenaCourseFeedback>>,
      default: () => new Map<number, ArenaCourseFeedback>(),
    },
    currentUsername: {
      type: String,
      required: true,
    },
    currentUserClassName: {
      type: String,
      required: true,
    },
  },
  emits: ['save-feedback-list', 'submit-feedback-thread'],
  setup(props, { emit }) {
    const cmEditor = ref<HTMLTextAreaElement | null>(null);
    const mode = languageModeMap[props.language] ?? languageModeMap['cpp17-gcc'];
    const mapChangeTracker = ref(1);

    const feedbackList = computed((): ArenaCourseFeedback[] => {
      if (!mapChangeTracker.value) {
        throw new Error('unreachable code');
      }
      return Array.from(props.feedbackMap.values());
    });

    const numberOfComments = computed((): number => {
      return feedbackList.value.length;
    });

    const editorOptions = computed((): EditorOptions => {
      return {
        tabSize: 2,
        lineNumbers: true,
        mode: mode,
        readOnly: true,
        gutters: ['CodeMirror-linenumbers', 'custom-gutter'],
      };
    });

    const ensureTenLinesInSolution = computed({
      get: (): string => {
        let linesToAdd = 10 - props.value.split('\n').length;
        if (linesToAdd <= 0) {
          return props.value;
        }
        return props.value + '\n'.repeat(linesToAdd);
      },
      set: () => {
        // no-op: textarea is hidden and used only for CodeMirror initialization
      },
    });

    function setFeedback({
      lineNumber,
      text = null,
      status,
    }: {
      lineNumber: number;
      text: string | null;
      status: FeedbackStatus;
    }): void {
      props.feedbackMap.set(lineNumber, {
        lineNumber,
        text,
        status,
      });
      mapChangeTracker.value++;
    }

    function deleteFeedback({ lineNumber }: { lineNumber: number }): void {
      props.feedbackMap.delete(lineNumber);
      mapChangeTracker.value++;
    }

    function saveFeedbackList(): void {
      emit(
        'save-feedback-list',
        feedbackList.value.map((feedback) => ({
          lineNumber: feedback.lineNumber,
          feedback: feedback.text,
        })),
      );
    }

    onMounted(() => {
      const editor = CodeMirror.fromTextArea(cmEditor.value!, editorOptions.value);

      for (const [feedbackKey, feedback] of props.feedbackMap) {
        const container = document.createElement('div');
        const feedbackApp = createApp(Feedback as any, { feedback });
        const feedbackInstance = feedbackApp.mount(container);

        editor.addLineWidget(
          feedback.lineNumber,
          feedbackInstance.$el as HTMLElement,
          {
            className: 'px-2',
          },
        );

        const feedbackThreadMapEntries = [...props.feedbackThreadMap]
          .filter(
            ([, feedbackThreadValue]) =>
              feedbackThreadValue.lineNumber == feedbackKey,
          )
          .sort(
            (
              a: [number, ArenaCourseFeedback],
              b: [number, ArenaCourseFeedback],
            ) => a[0] - b[0],
          );
        for (const [, feedbackThread] of feedbackThreadMapEntries) {
          const threadContainer = document.createElement('div');
          const feedbackThreadApp = createApp(FeedbackThread as any, {
            feedbackThread,
            saved: true,
            onSubmitFeedbackThread: (ft: ArenaCourseFeedback) => {
              emit('submit-feedback-thread', {
                ...ft,
                submissionFeedbackId: (feedback as any).submissionFeedbackId,
              });
            },
          });
          const feedbackThreadInstance = feedbackThreadApp.mount(threadContainer);
          editor.addLineWidget(
            feedback.lineNumber,
            feedbackThreadInstance.$el as HTMLElement,
            {
              className: 'px-2',
            },
          );
        }

        const newThreadContainer = document.createElement('div');
        const feedbackThreadNewApp = createApp(FeedbackThread as any, {
          feedbackThread: {
            lineNumber: feedback.lineNumber,
            text: null,
            status: FeedbackStatus.New,
            author: props.currentUsername,
            authorClassname: props.currentUserClassName,
          },
          onSubmitFeedbackThread: (ft: ArenaCourseFeedback) => {
            emit('submit-feedback-thread', {
              ...ft,
              submissionFeedbackId: (feedback as any).submissionFeedbackId,
            });
          },
        });
        const feedbackThreadNewInstance = feedbackThreadNewApp.mount(newThreadContainer);
        editor.addLineWidget(
          feedback.lineNumber,
          feedbackThreadNewInstance.$el as HTMLElement,
          {
            className: 'px-2',
          },
        );
      }

      if (props.readonly) {
        return;
      }

      editor.on(
        'gutterClick',
        (editor: CodeMirror.Editor, lineNumber: number) => {
          if (editor.lineInfo(lineNumber).widgets?.length ?? 0 > 0) {
            // There's already a widget in this line, so avoid creating another one.
            return;
          }

          let lineWidget: CodeMirror.LineWidget;
          const gutterContainer = document.createElement('div');
          const feedbackApp = createApp(Feedback as any, {
            feedback: {
              text: null,
              lineNumber,
              status: FeedbackStatus.New,
            },
            onSubmit: (fb: ArenaCourseFeedback) => {
              nextTick(() => {
                // Now that the DOM has changed, we need to tell CodeMirror to
                // recalculate the height of the line widget so that it knows which
                // y coordinate corresponds to which line.
                lineWidget.changed();
              });
              setFeedback(fb);
            },
            onCancel: () => {
              editor.removeLineWidget(lineWidget);
              feedbackApp.unmount();
            },
            onDelete: (fb: ArenaCourseFeedback) => {
              deleteFeedback({ lineNumber: fb.lineNumber });
              editor.removeLineWidget(lineWidget);
              feedbackApp.unmount();
            },
          });
          const feedbackGutterInstance = feedbackApp.mount(gutterContainer);
          lineWidget = editor.addLineWidget(
            lineNumber,
            feedbackGutterInstance.$el as HTMLElement,
            {
              className: 'px-2',
            },
          );
        },
      );
    });

    return {
      T,
      'cm-editor': cmEditor,
      ensureTenLinesInSolution,
      numberOfComments,
      saveFeedbackList,
    };
  },
});

</script>

<style lang="scss">
@import '../../../../sass/main.scss';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.css';

[data-feedback-code-mirror] {
  height: auto;

  .cm-s-default {
    height: 95%;

    .CodeMirror-sizer {
      min-height: 100% !important;
    }

    .CodeMirror-linenumber {
      width: 4em !important;
      cursor: pointer;
    }

    .CodeMirror-linenumber::after {
      font: var(--fa-font-solid);
      width: 1em;
      content: '';
      display: inline-block;
      vertical-align: middle;
      font-weight: 900;
      color: var(--btn-ok-background-color);
      font-size: x-large;
    }

    .CodeMirror-linenumber:hover::after {
      content: '\f0fe';
    }

    .CodeMirror {
      height: auto;

      .CodeMirror-scroll {
        height: auto;
      }
    }
  }
}
</style>

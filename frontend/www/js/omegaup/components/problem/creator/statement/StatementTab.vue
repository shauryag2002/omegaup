<template>
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-md-6 d-flex flex-column">
          <div ref="markdownButtonBar" class="wmd-button-bar"></div>
          <textarea
            ref="markdownInput"
            v-model="currentMarkdown"
            data-problem-creator-editor-markdown
            class="wmd-input"
            @change="currentMarkdown = ($event.target as HTMLTextAreaElement).value"
            @paste="handlePaste"
            @drop="handleDrop"
          ></textarea>
        </div>
        <div class="col-md-6 d-flex flex-column">
          <ProblemMarkdown
            data-problem-creator-previewer-markdown
            :markdown="
              T.problemCreatorMarkdownPreviewInitialRender + currentMarkdown
            "
            preview="true"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <button
            data-problem-creator-save-markdown
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

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import * as Markdown from '@/third_party/js/pagedown/Markdown.Editor.js';
import * as markdown from '../../../../markdown';
import T from '../../../../lang';
import * as ui from '../../../../ui';
import ProblemMarkdown from '../../ProblemMarkdown.vue';

const store = useStore();

const markdownConverter = new markdown.Converter({
  preview: true,
});

// Template refs
const markdownButtonBar = ref<HTMLDivElement>();
const markdownInput = ref<HTMLTextAreaElement>();

// Props
const props = withDefaults(
  defineProps<{
    currentMarkdownProp?: string;
  }>(),
  {
    currentMarkdownProp: T.problemCreatorEmpty,
  },
);

// Emits
const emit = defineEmits<{
  (e: 'show-update-success-message'): void;
}>();

// State
let markdownEditor: Markdown.Editor | null = null;

// 256 KB limit for images
const MAX_IMAGE_SIZE = 256 * 1024;

const currentMarkdownInternal = ref<string>(T.problemCreatorEmpty);

// Computed
const currentMarkdown = computed({
  get: () => currentMarkdownInternal.value,
  set: (newMarkdown: string) => {
    currentMarkdownInternal.value = newMarkdown;
  },
});

// Watch
watch(
  () => props.currentMarkdownProp,
  () => {
    currentMarkdown.value = props.currentMarkdownProp;
  },
);

// Lifecycle
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

// Methods
function updateMarkdown() {
  store.commit('updateMarkdown', currentMarkdown.value);
  emit('show-update-success-message');
}

/**
 * Validates image file size and shows error if too large.
 * @param file The file to validate
 * @returns true if valid, false if too large
 */
function validateImageSize(file: File): boolean {
  if (file.size > MAX_IMAGE_SIZE) {
    ui.error(
      ui.formatString(
        T.problemCreatorMarkdownImageTooLarge ??
          'The image is too large. The maximum allowed size is %(limit). Please use a smaller image.',
        {
          limit: '256 KB',
        },
      ),
    );
    return false;
  }
  return true;
}

/**
 * Handles paste events to validate image sizes before insertion.
 */
function handlePaste(event: ClipboardEvent): void {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file && !validateImageSize(file)) {
        event.preventDefault();
        return;
      }
    }
  }
}

/**
 * Handles drop events to validate image sizes before insertion.
 */
function handleDrop(event: DragEvent): void {
  const files = event.dataTransfer?.files;
  if (!files) return;

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      if (!validateImageSize(file)) {
        event.preventDefault();
        return;
      }
    }
  }
}
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

  [data-problem-creator-previewer-markdown] {
    flex: 1;
    min-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--markdown-preview-border-color);
    padding: 10px;
    width: 100%;
    margin-top: 35px;
  }
}
</style>

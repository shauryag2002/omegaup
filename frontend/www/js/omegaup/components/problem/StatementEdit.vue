<template>
  <div class="card">
    <div class="card-body">
      <div v-if="showEditControls" class="row">
        <div class="form-group col-md-6">
          <label class="font-weight-bold">{{ T.statementLanguage }}</label>
          <select v-model="currentLanguage" class="form-control">
            <option
              v-for="language in languages"
              :key="language"
              :markdown-contents="currentMarkdown"
              :value="language"
            >
              {{ getLanguageNameText(language) }}
            </option>
          </select>
        </div>
        <div
          class="form-group col-md-6"
          :class="{ 'has-error': errors.includes('message') }"
        >
          <label class="control-label">{{ T.problemEditCommitMessage }}</label>
          <input v-model="commitMessage" class="form-control" />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 d-flex flex-column">
          <div ref="markdownButtonBar" class="wmd-button-bar"></div>
          <textarea
            ref="markdownInput"
            v-model="currentMarkdown"
            class="wmd-input"
            @change="currentMarkdown = $event.target.value"
          ></textarea>
        </div>
        <div class="col-md-6 d-flex flex-column">
          <h1 class="title text-center">{{ title }}</h1>
          <ProblemMarkdown
            data-statement-edit-markdown
            :markdown="currentMarkdown"
            :source-mapping="statement.sources"
            :image-mapping="statement.images"
            preview="true"
          ></ProblemMarkdown>
          <template v-if="markdownType === 'statements'">
            <hr />
            <div>
              <em
                >{{ T.wordsSource }}:
                <span class="source">{{ source }}</span>
              </em>
            </div>
            <div>
              <em
                >{{ T.wordsProblemsetter }}:
                <a class="problemsetter">
                  <UserUsername
                    v-if="problemsetter"
                    :classname="problemsetter.classname"
                    :linkify="true"
                    :username="problemsetter.username"
                  ></UserUsername>
                </a>
              </em>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-if="showEditControls" class="card-footer">
      <form
        class="row"
        enctype="multipart/form-data"
        method="post"
        @submit="onSubmit"
      >
        <div class="col-md-12">
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="commitMessage === ''"
          >
            {{
              markdownType === 'solutions'
                ? T.problemEditFormUpdateSolution
                : T.problemEditFormUpdateMarkdown
            }}
          </button>
        </div>
        <input type="hidden" name="message" :value="commitMessage" />
        <input
          type="hidden"
          name="contents"
          :value="JSON.stringify(statements)"
        />
        <input type="hidden" name="directory" :value="markdownType" />
        <input type="hidden" name="problem_alias" :value="alias" />
        <input type="hidden" name="request" value="markdown" />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import * as Markdown from '@/third_party/js/pagedown/Markdown.Editor.js';
import * as markdown from '../../markdown';

import UserUsername from '../user/Username.vue';
import ProblemMarkdown from './ProblemMarkdown.vue';

const markdownConverter = new markdown.Converter({
  preview: true,
});

const props = withDefaults(
  defineProps<{
    alias: string;
    title: string;
    source: string;
    problemsetter?: types.ProblemsetterInfo | null;
    statement: types.ProblemStatement;
    markdownType: string;
    showEditControls?: boolean;
    languages?: string[];
  }>(),
  {
    problemsetter: null,
    showEditControls: true,
    languages: () => ['es', 'en', 'pt'],
  },
);

const emit = defineEmits<{
  (
    e: 'update-markdown-contents',
    statements: types.Statements,
    language: string,
    markdown: string,
  ): void;
  (e: 'update:statement', statement: types.ProblemStatement): void;
}>();

const markdownButtonBar = ref<HTMLDivElement | null>(null);
const markdownInput = ref<HTMLTextAreaElement | null>(null);

const commitMessage = ref(T.updateStatementsCommitMessage);
const currentLanguage = ref(props.statement.language);
const currentMarkdown = ref(props.statement.markdown);
const errors = ref<string[]>([]);
const statements = ref<types.Statements>({});
const markdownEditorInstance = ref<Markdown.Editor | null>(null);

onMounted(() => {
  markdownEditorInstance.value = new Markdown.Editor(
    markdownConverter.converter,
    '',
    {
      panels: {
        buttonBar: markdownButtonBar.value,
        preview: null,
        input: markdownInput.value,
      },
    },
  );
  markdownEditorInstance.value.run();
});

function getLanguageNameText(language: string): string {
  switch (language) {
    case 'en':
      return T.statementLanguageEn;
    case 'es':
      return T.statementLanguageEs;
    case 'pt':
      return T.statementLanguagePt;
    default:
      return '';
  }
}

watch(
  () => props.statement,
  (newStatement: types.ProblemStatement) => {
    currentLanguage.value = newStatement.language;
    currentMarkdown.value = newStatement.markdown;
  },
);

watch(currentLanguage, (newLanguage: string, oldLanguage: string) => {
  if (oldLanguage) statements.value[oldLanguage] = currentMarkdown.value;
  emit(
    'update-markdown-contents',
    statements.value,
    newLanguage,
    currentMarkdown.value,
  );
});

watch(currentMarkdown, (newMarkdown: string) => {
  emit('update:statement', {
    images: props.statement.images,
    language: props.statement.language,
    sources: props.statement.sources,
    markdown: newMarkdown,
  });
});

function onSubmit(e: Event) {
  errors.value = [];
  statements.value[currentLanguage.value] = currentMarkdown.value;
  if (commitMessage.value) {
    return;
  }
  errors.value.push('message');
  ui.error(T.editFieldRequired);
  e.preventDefault();
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
@import '../../../../third_party/js/pagedown/demo/browser/demo.css';

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

  .title {
    flex-shrink: 0;
  }

  [data-statement-edit-markdown] {
    flex: 1;
    min-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--markdown-preview-border-color);
    padding: 10px;
    margin-bottom: 10px;
  }

  hr,
  div {
    flex-shrink: 0;
  }
}
</style>

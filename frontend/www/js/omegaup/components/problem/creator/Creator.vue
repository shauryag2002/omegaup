<template>
  <b-container fluid="lg">
    <b-row>
      <b-col>
        <b-card :header="T.problemCreatorTitle" header-class="h3">
          <CreatorHeader
            @download-zip-file="
              (zipObject) => emit('download-zip-file', zipObject)
            "
            @upload-zip-file="populateProps"
          />
          <CreatorTabs
            data-problem-creator-tabs
            :code-prop="codeProp"
            :extension-prop="extensionProp"
            :current-solution-markdown-prop="currentSolutionMarkdownProp"
            :current-markdown-prop="currentMarkdownProp"
            @show-update-success-message="
              () => emit('show-update-success-message')
            "
            @download-zip-file="
              (zipObject) => emit('download-zip-file', zipObject)
            "
            @download-input-file="
              (fileObject) => emit('download-input-file', fileObject)
            "
          />
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCookie } from '../../../cookies';
import CreatorHeader from './Header.vue';
import CreatorTabs from './Tabs.vue';
import T from '../../../lang';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

const emit = defineEmits<{
  (e: 'download-zip-file', zipObject: any): void;
  (e: 'show-update-success-message'): void;
  (e: 'download-input-file', fileObject: any): void;
}>();

const codeProp = ref<string>(T.problemCreatorEmpty);
const extensionProp = ref<string>(T.problemCreatorEmpty);
const currentSolutionMarkdownProp = ref<string>(T.problemCreatorEmpty);
const currentMarkdownProp = ref<string>(T.problemCreatorEmpty);

onMounted(() => {
  launchIntro();
});

function launchIntro() {
  if (!getCookie('has-visited-problem-creator')) {
    introJs()
      .setOptions({
        nextLabel: T.interactiveGuideNextButton,
        prevLabel: T.interactiveGuidePreviousButton,
        doneLabel: T.interactiveGuideDoneButton,
        steps: [
          {
            title: T.problemCreatorIntroWelcomeTitle,
            intro: T.problemCreatorIntroWelcomeIntro,
          },
          {
            title: T.problemCreatorIntroWorkspaceTitle,
            intro: T.problemCreatorIntroWorkspaceIntro,
            element: document.querySelector(
              '[data-problem-creator-tabs]',
            ) as Element,
          },
          {
            title: T.problemCreatorIntroLoadTitle,
            intro: T.problemCreatorIntroLoadIntro,
            element: document.querySelector(
              '[data-load-problem-button]',
            ) as Element,
          },
          {
            title: T.problemCreatorIntroDownloadTitle,
            intro: T.problemCreatorIntroDownloadIntro,
            element: document.querySelector('[data-download-zip]') as Element,
          },
          {
            title: T.problemCreatorIntroCreateTitle,
            intro: T.problemCreatorIntroCreateIntro,
            element: document.querySelector(
              '[data-create-new-problem-button]',
            ) as Element,
          },
          {
            title: T.problemCreatorIntroNameTitle,
            intro: T.problemCreatorIntroNameIntro,
            element: document.querySelector(
              'input[placeholder="New Problem"]',
            ) as Element,
          },
          {
            title: T.problemCreatorIntroReadyTitle,
            intro: T.problemCreatorIntroReadyIntro,
          },
        ],
      })
      .start();

    cookies?.set('has-visited-problem-creator', true, -1);
  }
}

function populateProps(storeData: { [key: string]: any }) {
  currentMarkdownProp.value = storeData.problemMarkdown;
  codeProp.value = storeData.problemCodeContent;
  extensionProp.value = storeData.problemCodeExtension;
  currentSolutionMarkdownProp.value = storeData.problemSolutionMarkdown;
}
</script>

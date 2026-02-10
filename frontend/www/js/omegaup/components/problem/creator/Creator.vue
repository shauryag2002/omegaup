<template>
  <b-container fluid="lg">
    <b-row>
      <b-col>
        <b-card :header="T.problemCreatorTitle" header-class="h3">
          <creator-header
            ref="creatorHeader"
            :show-header-actions="!hideHeaderActions"
            @download-zip-file="
              (zipObject) => $emit('download-zip-file', zipObject)
            "
            @upload-zip-file="populateProps"
          />
          <creator-tabs
            ref="creatorTabs"
            data-problem-creator-tabs
            :code-prop="codeProp"
            :extension-prop="extensionProp"
            :current-solution-markdown-prop="currentSolutionMarkdownProp"
            :current-markdown-prop="currentMarkdownProp"
            :hide-save-buttons="hideSaveButtons"
            @show-update-success-message="
              () => $emit('show-update-success-message')
            "
            @download-zip-file="
              (zipObject) => $emit('download-zip-file', zipObject)
            "
            @download-input-file="
              (fileObject) => $emit('download-input-file', fileObject)
            "
          />
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref } from 'vue-property-decorator';
import creator_Header from './Header.vue';
import creator_Tabs from './Tabs.vue';
import T from '../../../lang';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

@Component({
  components: {
    'creator-header': creator_Header,
    'creator-tabs': creator_Tabs,
  },
})
export default class Creator extends Vue {
  @Prop({ default: false }) hideHeaderActions!: boolean;
  @Prop({ default: false }) hideSaveButtons!: boolean;
  @Ref('creatorTabs') creatorTabsRef!: creator_Tabs;

  T = T;
  codeProp: string = T.problemCreatorEmpty;
  extensionProp: string = T.problemCreatorEmpty;
  currentSolutionMarkdownProp: string = T.problemCreatorEmpty;
  currentMarkdownProp: string = T.problemCreatorEmpty;

  mounted() {
    this.launchIntro();
  }

  launchIntro() {
    if (!this.$cookies.get('has-visited-problem-creator')) {
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

      this.$cookies.set('has-visited-problem-creator', true, -1);
    }
  }

  populateProps(storeData: { [key: string]: any }) {
    this.currentMarkdownProp = storeData.problemMarkdown;
    this.codeProp = storeData.problemCodeContent;
    this.extensionProp = storeData.problemCodeExtension;
    this.currentSolutionMarkdownProp = storeData.problemSolutionMarkdown;
  }

  saveDraft(): void {
    if (this.creatorTabsRef) {
      this.creatorTabsRef.saveAllDrafts();
    }
  }
}
</script>

<template>
  <b-container fluid="lg">
    <b-row>
      <b-col>
        <b-card :header="T.problemCreatorTitle" header-class="h3">
          <creator-header
            ref="creatorHeader"
            :show-header-actions="!hideHeaderActions"
            :show-name-input="!hideHeaderActions"
            @download-zip-file="onDownloadZipFile"
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
            @show-update-success-message="onShowUpdateSuccessMessage"
            @download-zip-file="onDownloadZipFile"
            @download-input-file="onDownloadInputFile"
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
  @Prop({ default: '' }) closeButtonSelector!: string;
  @Ref('creatorHeader') creatorHeaderRef!: creator_Header;
  @Ref('creatorTabs') creatorTabsRef!: creator_Tabs;

  T = T;
  codeProp: string = T.problemCreatorEmpty;
  extensionProp: string = T.problemCreatorEmpty;
  currentSolutionMarkdownProp: string = T.problemCreatorEmpty;
  currentMarkdownProp: string = T.problemCreatorEmpty;

  mounted() {
    if (this.$store?.state) {
      this.populateProps(this.$store.state as { [key: string]: any });
    }
    this.launchIntro();
  }

  launchIntro() {
    if (document.body.classList.contains('introjs-showing')) {
      return;
    }

    if (!this.$cookies.get('has-visited-problem-creator')) {
      const steps = [
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
      ];

      if (!this.hideHeaderActions) {
        steps.push(
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
        );
      }

      const nameElement = document.querySelector(
        'input[placeholder="New Problem"]',
      ) as Element | null;
      if (nameElement) {
        steps.push({
          title: T.problemCreatorIntroNameTitle,
          intro: T.problemCreatorIntroNameIntro,
          element: nameElement,
        });
      }

      if (this.closeButtonSelector) {
        const closeElement = document.querySelector(
          this.closeButtonSelector,
        ) as Element | null;
        if (closeElement) {
          steps.push({
            title: T.wordsClose,
            intro: T.wordsClose,
            element: closeElement,
          });
        }
      }

      if (!this.hideHeaderActions) {
        steps.push({
          title: T.problemCreatorIntroReadyTitle,
          intro: T.problemCreatorIntroReadyIntro,
        });
      }

      introJs()
        .setOptions({
          nextLabel: T.interactiveGuideNextButton,
          prevLabel: T.interactiveGuidePreviousButton,
          doneLabel: T.interactiveGuideDoneButton,
          steps,
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

  async importZipFile(zipFile: File): Promise<{ [key: string]: any } | null> {
    if (!this.creatorHeaderRef?.importZipFile) {
      return null;
    }
    return this.creatorHeaderRef.importZipFile(zipFile);
  }

  onDownloadZipFile(zipObject: unknown): void {
    this.$emit('download-zip-file', zipObject);
  }

  onDownloadInputFile(fileObject: unknown): void {
    this.$emit('download-input-file', fileObject);
  }

  onShowUpdateSuccessMessage(): void {
    this.$emit('show-update-success-message');
  }
}
</script>

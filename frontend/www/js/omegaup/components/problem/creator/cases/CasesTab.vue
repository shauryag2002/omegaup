<template>
  <b-row class="mt-3">
    <b-col cols="3" class="border-1 border-right">
      <omegaup-problem-creator-cases-sidebar
        data-cases-sidebar
        :show-window="shouldShowAddWindow"
        @open-add-window="openAddWindow"
        @open-case-edit-window="openCaseEditWindow"
        @download-zip-file="
          (zipObject) => $emit('download-zip-file', zipObject)
        "
      />
    </b-col>
    <b-col data-cases-add-panel>
      <omegaup-problem-creator-cases-add-panel
        v-if="shouldShowAddWindow"
        :show-window="shouldShowAddWindow"
        @close-add-window="closeAddWindow"
      />
      <omegaup-problem-creator-cases-case-edit
        v-if="shouldShowCaseEditWindow"
        @download-input-file="
          (fileObject) => $emit('download-input-file', fileObject)
        "
      />
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick, PropType } from 'vue';
import problemCreator_Cases_CaseEdit from './CaseEdit.vue';
import problemCreator_Cases_Sidebar from './Sidebar.vue';
import probleCreator_Cases_AddPanel from './AddPanel.vue';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { getCookie, setCookie } from '../../../../cookies';
import T from '../../../../lang';
import { TabIndex } from '../Tabs.vue';
import { BCol, BRow } from 'bootstrap-vue-next';

export default defineComponent({
  name: 'CasesTab',
  components: {
    'omegaup-problem-creator-cases-sidebar': problemCreator_Cases_Sidebar,
    'omegaup-problem-creator-cases-add-panel': probleCreator_Cases_AddPanel,
    'omegaup-problem-creator-cases-case-edit': problemCreator_Cases_CaseEdit,
  },
  props: {
    activeTabIndex: { type: Number as PropType<TabIndex>, required: true },
  },
  emits: ['download-zip-file', 'download-input-file'],
  setup(props) {
    const shouldShowAddWindow = ref(false);
    const shouldShowCaseEditWindow = ref(false);

    function openCaseEditWindow() {
      shouldShowAddWindow.value = false;
      shouldShowCaseEditWindow.value = true;
    }

    function closeCaseEditWindow() {
      shouldShowCaseEditWindow.value = false;
    }

    function closeAddWindow() {
      shouldShowAddWindow.value = false;
    }

    function openAddWindow() {
      shouldShowCaseEditWindow.value = false;
      shouldShowAddWindow.value = true;
    }

    function startIntroGuide() {
      if (!getCookie('has-visited-cases-tab')) {
        nextTick(() => {
          const intro = introJs();

          intro.setOptions({
            nextLabel: T.interactiveGuideNextButton,
            prevLabel: T.interactiveGuidePreviousButton,
            doneLabel: T.interactiveGuideDoneButton,
            steps: [
              {
                title: T.problemCreatorCasesTabIntroSidebarTitle,
                intro: T.problemCreatorCasesTabIntroSidebarIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-cases-sidebar]',
                ),
              },
              {
                title: T.problemCreatorCasesTabIntroAddPanelTitle,
                intro: T.problemCreatorCasesTabIntroAddPanelIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-cases-add-panel]',
                ),
              },
            ],
          });

          intro.onbeforechange(function (
            this: ReturnType<typeof introJs>,
            _targetElement: HTMLElement,
            currentStep: number,
          ) {
            if (currentStep === 1) {
              openAddWindow();
            }
            return true;
          });

          intro.start();
          setCookie('has-visited-cases-tab', true);
        });
      }
    }

    watch(() => props.activeTabIndex, (newIndex: TabIndex) => {
      if (newIndex === TabIndex.TestCases) {
        startIntroGuide();
      }
    });

    return {
      shouldShowAddWindow,
      shouldShowCaseEditWindow,
      openCaseEditWindow,
      closeCaseEditWindow,
      closeAddWindow,
      openAddWindow,
    };
  },
});
</script>

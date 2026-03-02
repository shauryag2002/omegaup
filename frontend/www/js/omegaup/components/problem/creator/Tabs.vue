<template>
  <b-tabs v-model="activeTabIndex" small>
    <b-tab>
      <template #title>
        <FontAwesomeIcon :icon="['fas', 'pencil']" class="mr-1" />
        <span name="writing" data-problem-creator-tab="statement">
          {{ T.problemCreatorStatement }}</span
        >
      </template>
      <omegaup-problem-creator-statement-tab
        :current-markdown-prop="currentMarkdownProp"
        :active-tab-index="activeTabIndex"
        @show-update-success-message="
          () => $emit('show-update-success-message')
        "
      />
    </b-tab>

    <b-tab>
      <template #title>
        <FontAwesomeIcon :icon="['fas', 'file-code']" class="mr-1" />
        <span name="code" data-problem-creator-tab="code">
          {{ T.problemCreatorCode }}</span
        >
      </template>
      <omegaup-problem-creator-code-tab
        :code-prop="codeProp"
        :extension-prop="extensionProp"
        :active-tab-index="activeTabIndex"
        @show-update-success-message="
          () => $emit('show-update-success-message')
        "
      />
    </b-tab>

    <b-tab>
      <template #title>
        <FontAwesomeIcon :icon="['fas', 'circle-check']" class="mr-1" />
        <span name="testcases" data-problem-creator-tab="cases">
          {{ T.problemCreatorTestCases }}</span
        >
      </template>
      <omegaup-problem-creator-cases-tab
        :active-tab-index="activeTabIndex"
        @download-zip-file="
          (zipObject) => $emit('download-zip-file', zipObject)
        "
        @download-input-file="
          (fileObject) => $emit('download-input-file', fileObject)
        "
      />
    </b-tab>

    <b-tab>
      <template #title>
        <FontAwesomeIcon :icon="['fas', 'file-circle-check']" class="mr-1" />
        <span name="solution" data-problem-creator-tab="solution">
          {{ T.problemCreatorSolution }}</span
        >
      </template>
      <omegaup-problem-creator-solution-tab
        :current-solution-markdown-prop="currentSolutionMarkdownProp"
        :active-tab-index="activeTabIndex"
        @show-update-success-message="
          () => $emit('show-update-success-message')
        "
      />
    </b-tab>
  </b-tabs>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import problemCreator_CasesTab from './cases/CasesTab.vue';
import problemCreator_StatementTab from './statement/StatementTab.vue';
import problemCreator_CodeTab from './code/CodeTab.vue';
import problemCreator_SolutionTab from './solution/SolutionTab.vue';
import T from '../../../lang';
import { BTab, BTabs } from 'bootstrap-vue-next';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCircleCheck, faFileCircleCheck, faFileCode, faPencil } from '@fortawesome/free-solid-svg-icons';
library.add(faCircleCheck, faFileCircleCheck, faFileCode, faPencil);

export enum TabIndex {
  Statement = 0,
  Code = 1,
  TestCases = 2,
  Solution = 3,
}

export default defineComponent({
  name: 'Tabs',
  components: {
    FontAwesomeIcon,
    'omegaup-problem-creator-statement-tab': problemCreator_StatementTab,
    'omegaup-problem-creator-code-tab': problemCreator_CodeTab,
    'omegaup-problem-creator-cases-tab': problemCreator_CasesTab,
    'omegaup-problem-creator-solution-tab': problemCreator_SolutionTab,
  },
  props: {
    currentSolutionMarkdownProp: { type: String, default: T.problemCreatorEmpty },
    currentMarkdownProp: { type: String, default: T.problemCreatorEmpty },
    codeProp: { type: String, default: T.problemCreatorEmpty },
    extensionProp: { type: String, default: T.problemCreatorEmpty },
  },
  emits: ['show-update-success-message', 'download-zip-file', 'download-input-file'],
  setup() {
    const activeTabIndex = ref(TabIndex.Statement);

    return {
      T,
      activeTabIndex,
    };
  },
});
</script>

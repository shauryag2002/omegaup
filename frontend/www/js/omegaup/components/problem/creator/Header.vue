<template>
  <b-row class="mb-3">
    <b-col class="d-flex align-items-center">
      <span class="mr-2">{{ T.problemCreatorName }}</span>
      <b-form-input
        v-model="name"
        size="sm"
        :placeholder="T.problemCreatorNewProblem"
      />
    </b-col>
    <b-col class="d-flex justify-content-end">
      <b-button
        data-load-problem-button
        class="mr-2"
        variant="success"
        size="sm"
        @click="uploadZipModal = !uploadZipModal"
      >
        <FontAwesomeIcon :icon="['fas', 'upload']" class="mr-1" />
        <span class="d-none d-md-inline">
          {{ T.problemCreatorLoadProblem }}</span
        >
      </b-button>
      <b-modal
        v-model="uploadZipModal"
        :title="T.problemCreatorZipFileUpload"
        :ok-title="T.problemCreatorUploadZip"
        ok-variant="success"
        :cancel-title="T.caseModalBack"
        cancel-variant="danger"
        static
        lazy
        @ok="retrieveStore"
      >
        <div class="mb-4">{{ T.problemCreatorUploadZipMessage }}</div>
        <input
          data-upload-zip-file
          class="w-100"
          type="file"
          accept=".zip"
          @change="handleZipFile"
        />
      </b-modal>
      <b-button
        data-download-zip
        class="mr-2"
        variant="primary"
        size="sm"
        @click="generateProblem()"
      >
        <FontAwesomeIcon :icon="['fas', 'download']" class="mr-1" />
        <span class="d-none d-md-inline">
          {{ T.problemCreatorGenerateProblem }}</span
        >
      </b-button>
      <b-button
        variant="warning"
        data-create-new-problem-button
        size="sm"
        @click="newProblemConfirmationModal = !newProblemConfirmationModal"
      >
        <FontAwesomeIcon :icon="['fas', 'plus']" class="mr-1" />
        <span class="d-none d-md-inline">
          {{ T.problemCreatorNewProblem }}</span
        >
      </b-button>
      <b-modal
        v-model="newProblemConfirmationModal"
        data-create-new-problem
        :title="T.problemCreatorCreateNewProblem"
        :ok-title="T.problemCreatorCreateNewProblemContinue"
        ok-variant="danger"
        :cancel-title="T.problemCreatorCreateNewProblemBack"
        cancel-variant="success"
        static
        lazy
        @ok="createNewProblem"
      >
        <div class="mb-4">{{ T.problemCreatorCreateNewProblemWarning }}</div>
      </b-modal>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import JSZip from 'jszip';
import { useStore } from 'vuex';
import T from '../../../lang';
import * as ui from '../../../ui';
import { Group, CaseGroupID } from '@/js/omegaup/problem/creator/types';
import { BButton, BCol, BFormInput, BModal, BRow } from 'bootstrap-vue-next';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faDownload,
  faPlus,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
library.add(faDownload, faPlus, faUpload);

export default defineComponent({
  name: 'Header',
  emits: ['upload-zip-file', 'download-zip-file'],
  setup(props, { emit }) {
    const store = useStore();

    const groups = computed<Group[]>(() => store.state.casesStore.groups);
    const getStringifiedLinesFromCaseGroupID = computed(
      () => store.getters['casesStore/getStringifiedLinesFromCaseGroupID'],
    );

    const zipFile = ref<File | null>(null);
    const uploadZipModal = ref(false);
    const newProblemConfirmationModal = ref(false);
    const nameInternal = ref<string>(T.problemCreatorEmpty);
    const zip = ref(new JSZip());

    const name = computed({
      get: () => nameInternal.value,
      set: (newName: string) => {
        nameInternal.value = newName;
      },
    });

    watch(name, (newProblemName: string) => {
      store.commit('updateName', newProblemName);
    });

    const readFile = (e: HTMLInputElement): File | null => {
      return (e.files && e.files[0]) || null;
    };

    const handleZipFile = (ev: Event): void => {
      zipFile.value = readFile(ev.target as HTMLInputElement);
    };

    const retrieveStore = (): void => {
      if (!zipFile.value) {
        return;
      }
      const zipUploaded = new JSZip();
      zipUploaded
        .loadAsync(zipFile.value)
        .then((zipContent) => {
          const cdpDataFile = zipContent.file('cdp.data');
          if (!cdpDataFile) {
            ui.error(T.problemCreatorZipFileIsNotComplete);
            return;
          }
          cdpDataFile.async('text').then((content) => {
            const storeData = JSON.parse(content);
            emit('upload-zip-file', storeData);
            name.value = storeData.problemName;
            store.replaceState({
              ...store.state,
              problemName: storeData.problemName,
              problemMarkdown: storeData.problemMarkdown,
              problemCodeContent: storeData.problemCodeContent,
              problemCodeExtension: storeData.problemCodeExtension,
              problemSolutionMarkdown: storeData.problemSolutionMarkdown,
            });
            if (storeData.casesStore) {
              store.commit('casesStore/replaceState', storeData.casesStore);
            }
          });
        })
        .catch(() => {
          ui.error(T.problemCreatorZipFileIsNotValid);
        });
    };

    const getStatement = (zipInstance: JSZip) => {
      const folder = zipInstance.folder('statements');
      const markdownData = store.state.problemMarkdown;
      folder?.file('es.markdown', markdownData);
    };

    const getSolution = (zipInstance: JSZip) => {
      const folder = zipInstance.folder('solutions');
      const solutionMarkdownData = store.state.problemSolutionMarkdown;
      folder?.file('es.markdown', solutionMarkdownData);
    };

    const getCasesAndTestPlan = (zipInstance: JSZip) => {
      const folder = zipInstance.folder('cases');
      let testPlanData: string = '';

      groups.value.forEach((_group) => {
        _group.cases.forEach((_case) => {
          let fileName = _case.name;
          if (_group.ungroupedCase === false) {
            fileName = _group.name + '.' + fileName;
          }
          const caseGroupID: CaseGroupID = {
            groupID: _group.groupID,
            caseID: _case.caseID,
          };
          const input = getStringifiedLinesFromCaseGroupID.value(caseGroupID);
          folder?.file(fileName + '.in', input);
          folder?.file(fileName + '.out', _case.output);
          testPlanData += fileName + ' ' + _case.points + '\n';
        });
      });

      zipInstance.file('testplan', testPlanData);
      zipInstance.file('cdp.data', JSON.stringify(store.state));
    };

    const generateProblem = () => {
      getStatement(zip.value);
      getSolution(zip.value);
      getCasesAndTestPlan(zip.value);

      const problemName: string = store.state.problemName;
      emit('download-zip-file', {
        fileName: problemName.replace(/ /g, '_'),
        zipContent: zip.value,
      });
    };

    const createNewProblem = () => {
      store.commit('resetStore');
      store.commit('casesStore/resetStore');
      window.location.reload();
    };

    return {
      T,
      name,
      nameInternal,
      zip,
      uploadZipModal,
      newProblemConfirmationModal,
      readFile,
      handleZipFile,
      retrieveStore,
      generateProblem,
      createNewProblem,
    };
  },
});
</script>

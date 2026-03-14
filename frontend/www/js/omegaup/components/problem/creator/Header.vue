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
    <b-col v-if="showHeaderActions" class="d-flex justify-content-end">
      <b-button
        data-load-problem-button
        class="mr-2"
        variant="success"
        size="sm"
        @click="uploadZipModal = !uploadZipModal"
      >
        <BIconUpload class="mr-1" />
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
        <BIconDownload class="mr-1" />
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
        <BIconPlus class="mr-1" />
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
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import JSZip from 'jszip';
import { namespace } from 'vuex-class';
import T from '../../../lang';
import * as ui from '../../../ui';
import { Group, CaseGroupID } from '@/js/omegaup/problem/creator/types';
import { v4 as uuid, NIL as UUID_NIL } from 'uuid';

const casesStore = namespace('casesStore');

@Component
export default class Header extends Vue {
  @Prop({ default: true }) showHeaderActions!: boolean;

  T = T;
  zipFile: File | null = null;
  uploadZipModal: boolean = false;
  newProblemConfirmationModal: boolean = false;

  nameInternal: string = T.problemCreatorEmpty;
  zip: JSZip = new JSZip();

  @casesStore.State('groups') groups!: Group[];
  @casesStore.Getter('getStringifiedLinesFromCaseGroupID')
  getStringifiedLinesFromCaseGroupID!: (caseGroupID: CaseGroupID) => string;

  get name(): string {
    return this.nameInternal;
  }
  set name(newName: string) {
    this.nameInternal = newName;
  }

  readFile(e: HTMLInputElement): File | null {
    return (e.files && e.files[0]) || null;
  }

  handleZipFile(ev: Event): void {
    this.zipFile = this.readFile(ev.target as HTMLInputElement);
  }

  async retrieveStore(): Promise<void> {
    if (!this.zipFile) {
      return;
    }
    await this.importZipFile(this.zipFile);
  }

  async importZipFile(zipFile: File): Promise<{ [key: string]: any } | null> {
    try {
      const zipContent = await new JSZip().loadAsync(zipFile);

      const cdpDataFile = zipContent.file('cdp.data');
      if (cdpDataFile) {
        const content = await cdpDataFile.async('text');
        const storeData = JSON.parse(content);
        this.applyStoreData(storeData);
        return storeData;
      }

      const parsedStoreData = await this.parseStandardOmegaUpZip(
        zipContent,
        zipFile.name,
      );
      if (!parsedStoreData) {
        ui.error(T.problemCreatorZipFileIsNotComplete);
        return null;
      }

      this.applyStoreData(parsedStoreData);
      return parsedStoreData;
    } catch (error) {
      ui.error(T.problemCreatorZipFileIsNotValid);
      return null;
    }
  }

  applyStoreData(storeData: { [key: string]: any }): void {
    this.$emit('upload-zip-file', storeData);
    this.name = storeData.problemName;
    this.$store.replaceState({
      ...this.$store.state,
      problemName: storeData.problemName,
      problemMarkdown: storeData.problemMarkdown,
      problemCodeContent: storeData.problemCodeContent,
      problemCodeExtension: storeData.problemCodeExtension,
      problemSolutionMarkdown: storeData.problemSolutionMarkdown,
    });
    if (storeData.casesStore) {
      this.$store.commit('casesStore/replaceState', storeData.casesStore);
    }
  }

  async parseStandardOmegaUpZip(
    zipContent: JSZip,
    filename: string,
  ): Promise<{ [key: string]: any } | null> {
    const casePaths = Object.keys(zipContent.files).filter(
      (filePath) =>
        filePath.startsWith('cases/') &&
        !zipContent.files[filePath].dir &&
        (filePath.endsWith('.in') || filePath.endsWith('.out')),
    );
    if (casePaths.length === 0) {
      return null;
    }

    const problemMarkdown = await this.readFirstZipText(zipContent, [
      'statements/es.markdown',
      'statements/en.markdown',
      'statements/pt.markdown',
    ]);
    const problemSolutionMarkdown = await this.readFirstZipText(zipContent, [
      'solutions/es.markdown',
      'solutions/en.markdown',
      'solutions/pt.markdown',
    ]);

    const codeFilePath = Object.keys(zipContent.files).find(
      (filePath) =>
        filePath.startsWith('solutions/') &&
        !zipContent.files[filePath].dir &&
        !filePath.endsWith('.markdown'),
    );
    let problemCodeContent = '';
    let problemCodeExtension = '';
    if (codeFilePath) {
      const codeFile = zipContent.file(codeFilePath);
      if (codeFile) {
        problemCodeContent = await codeFile.async('text');
        const codeFilename = codeFilePath.split('/').pop() || '';
        const extension = codeFilename.split('.').pop();
        problemCodeExtension = extension || '';
      }
    }

    const testplanData = await this.readFirstZipText(zipContent, ['testplan']);
    const pointsByCaseName = this.parseTestplan(testplanData);

    const caseNameToInput = new Map<string, string>();
    const caseNameToOutput = new Map<string, string>();
    for (const filePath of casePaths) {
      const file = zipContent.file(filePath);
      if (!file) {
        continue;
      }
      const text = await file.async('text');
      const relativeName = filePath.substring('cases/'.length);
      const caseName = relativeName.replace(/\.(in|out)$/i, '');
      if (filePath.endsWith('.in')) {
        caseNameToInput.set(caseName, text);
      } else {
        caseNameToOutput.set(caseName, text);
      }
    }

    const allCaseNames = new Set<string>([
      ...Array.from(caseNameToInput.keys()),
      ...Array.from(caseNameToOutput.keys()),
    ]);

    const groupsByKey = new Map<string, any>();
    for (const fullCaseName of allCaseNames) {
      const dotIndex = fullCaseName.indexOf('.');
      const hasGroup = dotIndex !== -1;
      const groupName = hasGroup
        ? fullCaseName.substring(0, dotIndex)
        : fullCaseName;
      const caseName = hasGroup
        ? fullCaseName.substring(dotIndex + 1)
        : fullCaseName;
      const groupKey = hasGroup ? `g:${groupName}` : `u:${caseName}`;

      if (!groupsByKey.has(groupKey)) {
        groupsByKey.set(groupKey, {
          groupID: uuid(),
          name: groupName,
          points: 0,
          autoPoints: false,
          ungroupedCase: !hasGroup,
          cases: [],
        });
      }

      const group = groupsByKey.get(groupKey);
      const points = pointsByCaseName.get(fullCaseName) ?? 0;
      const autoPoints = !pointsByCaseName.has(fullCaseName);
      const caseID = uuid();
      group.cases.push({
        caseID,
        groupID: group.groupID,
        name: caseName,
        lines: [
          {
            lineID: uuid(),
            caseID,
            label: '',
            data: {
              kind: 'multiline',
              value: caseNameToInput.get(fullCaseName) || '',
            },
          },
        ],
        output: caseNameToOutput.get(fullCaseName) || '',
        points,
        autoPoints,
      });
      group.points += points;
      group.autoPoints = group.autoPoints || autoPoints;
    }

    const groups = Array.from(groupsByKey.values());
    const firstCase = groups[0]?.cases?.[0];
    const selected = firstCase
      ? {
          groupID: firstCase.groupID,
          caseID: firstCase.caseID,
        }
      : {
          groupID: UUID_NIL,
          caseID: UUID_NIL,
        };

    return {
      problemName: filename.replace(/\.zip$/i, ''),
      problemMarkdown,
      problemCodeContent,
      problemCodeExtension,
      problemSolutionMarkdown,
      casesStore: {
        groups,
        selected,
        layouts: [],
        hide: false,
      },
    };
  }

  async readFirstZipText(
    zipContent: JSZip,
    candidates: string[],
  ): Promise<string> {
    for (const candidate of candidates) {
      const file = zipContent.file(candidate);
      if (file) {
        return file.async('text');
      }
    }
    return '';
  }

  parseTestplan(testplanData: string): Map<string, number> {
    const pointsByCaseName = new Map<string, number>();
    const lines = testplanData.split('\n').map((line) => line.trim());
    for (const line of lines) {
      if (!line || line.startsWith('#')) {
        continue;
      }
      const parsed = line.match(/^(.+?)\s+([+-]?\d+(?:\.\d+)?)$/);
      if (!parsed) {
        continue;
      }
      const caseName = parsed[1].trim();
      const points = Number(parsed[2]);
      if (caseName && !Number.isNaN(points)) {
        pointsByCaseName.set(caseName, points);
      }
    }
    return pointsByCaseName;
  }

  @Watch('name')
  onNameChanged(newProblemName: string) {
    this.$store.commit('updateName', newProblemName);
  }

  getStatement(zip: JSZip) {
    const folder = zip.folder('statements');
    const markdownData = this.$store.state.problemMarkdown;
    folder?.file('es.markdown', markdownData);
  }

  getSolution(zip: JSZip) {
    const folder = zip.folder('solutions');
    const solutionMarkdownData = this.$store.state.problemSolutionMarkdown;
    folder?.file('es.markdown', solutionMarkdownData);
  }

  getCasesAndTestPlan(zip: JSZip) {
    const folder = zip.folder('cases');
    let testPlanData: string = '';

    this.groups.forEach((_group) => {
      _group.cases.forEach((_case) => {
        let fileName = _case.name;
        if (_group.ungroupedCase === false) {
          fileName = _group.name + '.' + fileName;
        }
        const caseGroupID: CaseGroupID = {
          groupID: _group.groupID,
          caseID: _case.caseID,
        };
        const input = this.getStringifiedLinesFromCaseGroupID(caseGroupID);
        folder?.file(fileName + '.in', input);
        folder?.file(fileName + '.out', _case.output);
        testPlanData += fileName + ' ' + _case.points + '\n';
      });
    });

    zip.file('testplan', testPlanData);
    zip.file('cdp.data', JSON.stringify(this.$store.state));
  }

  generateProblem() {
    this.getStatement(this.zip);
    this.getSolution(this.zip);
    this.getCasesAndTestPlan(this.zip);

    const problemName: string = this.$store.state.problemName;
    this.$emit('download-zip-file', {
      fileName: problemName.replace(/ /g, '_'),
      zipContent: this.zip,
    });
  }

  createNewProblem() {
    this.$store.commit('resetStore');
    this.$store.commit('casesStore/resetStore');
    window.location.reload();
  }
}
</script>

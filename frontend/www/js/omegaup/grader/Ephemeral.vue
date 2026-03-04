<template>
  <div class="d-flex flex-column h-100">
    <div class="navbar py-0" :class="theme">
      <span class="navbar-brand">
        omegaUp ephemeral grader
        <sup>&alpha;</sup>
      </span>
      <form class="form-inline my-2 my-lg-0 ephemeral-form">
        <template v-if="!isEmbedded">
          <label>
            <a class="btn btn-secondary btn-sm mr-sm-2" role="button">
              <font-awesome-icon
                :icon="['fas', 'upload']"
                :title="T.wordsUpload"
                aria-hidden="true"
                data-zip-upload
              />
            </a>
            <input
              type="file"
              accept=".zip"
              class="d-none"
              @change="handleUpload"
            />
          </label>
          <label>
            <a
              class="btn btn-secondary btn-sm mr-sm-2"
              role="button"
              :href="zipHref"
              :download="zipDownload"
              data-zip-download
              @click="handleDownload"
            >
              <font-awesome-icon
                :icon="isDirty ? ['fas', 'file-archive'] : ['fas', 'download']"
                :title="isDirty ? T.zipPrepare : T.wordsDownload"
                aria-hidden="true"
              />
            </a>
          </label>
          <label>
            <button
              class="btn btn-secondary btn-sm mr-2"
              @click.prevent="toggleTheme"
            >
              <font-awesome-icon
                :icon="isDark ? ['fas', 'sun'] : ['fas', 'moon']"
                aria-hidden="true"
              />
            </button>
          </label>
        </template>
        <select
          v-model="selectedLanguage"
          class="form-control form-control-sm mr-sm-2"
          data-language-select
        >
          <option
            v-for="language in languages"
            :key="language"
            :value="language"
          >
            {{ getLanguageName(language) }}
          </option>
        </select>

        <button
          v-if="isRunButton"
          :disabled="!canExecute"
          :class="{ disabled: !canExecute }"
          class="btn btn-sm btn-secondary mr-2 my-sm-0"
          data-run-button
          @click.prevent="handleRun"
        >
          <omegaup-countdown
            v-if="!canExecute"
            :target-time="nextExecutionTimestamp"
            :countdown-format="omegaup.CountdownFormat.EventCountdown"
            @finish="now = Date.now()"
          ></omegaup-countdown>
          <template v-else>
            <span>{{ T.wordsRun }}</span>
            <span
              v-if="isRunLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          </template>
        </button>
        <button
          v-if="isSubmitButton"
          :disabled="!canSubmit"
          :class="{ disabled: !canSubmit }"
          class="btn btn-sm btn-primary my-2 my-sm-0"
          data-submit-button
          @click.prevent="handleSubmit"
        >
          <omegaup-countdown
            v-if="!canSubmit"
            :target-time="nextSubmissionTimestamp"
            :countdown-format="omegaup.CountdownFormat.EventCountdown"
            @finish="now = Date.now()"
          ></omegaup-countdown>
          <template v-else>
            <span>{{ T.wordsSubmit }}</span>
            <span
              v-if="isSubmitLoading"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          </template>
        </button>
      </form>
    </div>
    <section ref="layout-root" class="col px-0 flex-grow-1"></section>
  </div>
</template>

<script lang="ts">
import * as monaco from 'monaco-editor';
(window as any).monaco = monaco;
import {
  defineComponent,
  ref,
  computed,
  watch,
  onBeforeMount,
  onMounted,
  nextTick,
  PropType,
} from 'vue';
import { omegaup } from '../omegaup';
import { createApp, h } from 'vue';
import type { VNode, App } from 'vue';
import omegaup_Countdown from '../components/Countdown.vue';
import type { Component as VueComponent } from 'vue';
import GoldenLayout from 'golden-layout';
import JSZip from 'jszip';
import pako from 'pako';

import { types } from '../api_types';
import CaseSelector from './CaseSelector.vue';
import DiffEditor from './DiffEditor.vue';
import IDESettings from './IDESettings.vue';
import MonacoEditor from './MonacoEditor.vue';
import TextEditor from './TextEditor.vue';
import ZipViewer from './ZipViewer.vue';
import store, { GraderResults } from './GraderStore';
import * as Util from './util';
import { UNEMBEDDED_CONFIG, EMBEDDED_CONFIG } from './GoldenLayoutConfigs';
import {
  TEXT_EDITOR_COMPONENT_NAME,
  MONACO_DIFF_COMPONENT_NAME,
  MONACO_EDITOR_COMPONENT_NAME,
  CASE_SELECTOR_COMPONENT_NAME,
  ZIP_VIEWER_COMPONENT_NAME,
  SETTINGS_COMPONENT_NAME,
} from './GoldenLayoutConfigs';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faUpload,
  faFileArchive,
  faDownload,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons';
library.add(faUpload, faFileArchive, faDownload, faSun, faMoon);

import T from '../lang';

interface GraderComponent {
  title?: string;
  onResize?: () => void;
  $watch: (source: string, cb: (value: string) => void) => void;
}
interface ComponentProps {
  [key: string]: any;
}
interface ComponentState {
  [key: string]: any;
}

export default defineComponent({
  name: 'Ephemeral',
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    'omegaup-countdown': omegaup_Countdown,
  },
  props: {
    acceptedLanguages: {
      type: Array as PropType<string[]>,
      required: true,
    },
    isEmbedded: { type: Boolean, required: true },
    canRun: { type: Boolean, required: true },
    shouldShowSubmitButton: { type: Boolean, required: true },
    initialLanguage: { type: String, required: true },
    initialTheme: {
      type: String as PropType<Util.MonacoThemes>,
      required: true,
    },
    problem: {
      type: Object as PropType<types.ProblemInfo>,
      required: true,
    },
    nextSubmissionTimestamp: {
      type: Date as PropType<null | Date>,
      default: null,
    },
    nextExecutionTimestamp: {
      type: Date as PropType<null | Date>,
      default: null,
    },
  },
  emits: ['execute-run'],
  setup(props, { emit }) {
    const layoutRoot = ref<HTMLElement | null>(null);

    const themeToRef: { [key: string]: string } = {
      [Util.MonacoThemes
        .VSLight]: `https://golden-layout.com/assets/css/goldenlayout-light-theme.css`,
      [Util.MonacoThemes
        .VSDark]: `https://golden-layout.com/assets/css/goldenlayout-dark-theme.css`,
    };
    let goldenLayout: GoldenLayout | null = null;
    const componentMapping: { [key: string]: GraderComponent } = {};
    const isRunLoading = ref(false);
    const isSubmitLoading = ref(false);
    const zipHref = ref<string | null>(null);
    const zipDownload = ref<string | null>(null);
    const now = ref<number>(Date.now());

    const isSubmitButton = computed(() => store.getters['showSubmitButton']);
    const isRunButton = computed(() => store.getters['showRunButton']);
    const isDirty = computed(() => store.getters['isDirty']);
    const theme = computed(() => store.getters['theme']);

    const selectedLanguage = computed({
      get: () => store.getters['request.language'],
      set: (language: string) => {
        store.dispatch('request.language', language);
      },
    });

    function getLanguageName(language: string): string {
      return Util.supportedLanguages[language].name;
    }

    const languages = computed((): string[] => store.getters['languages']);
    const currentCase = computed((): string => store.getters['currentCase']);
    const isDark = computed(() => theme.value === Util.MonacoThemes.VSDark);

    const canSubmit = computed((): boolean => {
      if (!props.nextSubmissionTimestamp) {
        return true;
      }
      return props.nextSubmissionTimestamp.getTime() <= now.value;
    });

    const canExecute = computed((): boolean => {
      if (!props.nextExecutionTimestamp) {
        return true;
      }
      return props.nextExecutionTimestamp.getTime() <= now.value;
    });

    function toggleTheme() {
      store.dispatch(
        'theme',
        theme.value === Util.MonacoThemes.VSLight
          ? Util.MonacoThemes.VSDark
          : Util.MonacoThemes.VSLight,
      );
    }

    function initProblem() {
      store.commit('updatingSettings', true);
      store
        .dispatch('initProblem', {
          initialLanguage: props.initialLanguage,
          initialTheme: props.initialTheme,
          languages: props.acceptedLanguages,
          problem: props.problem,
          showRunButton: props.canRun,
          showSubmitButton: props.shouldShowSubmitButton,
        })
        .then(() => {
          store.commit('updatingSettings', false);
          nextTick(() => {
            if (!props.isEmbedded || !goldenLayout?.isInitialised) return;
            let mainColumn = goldenLayout.root.getItemsById('main-column')[0];
            mainColumn.parent.setActiveContentItem(mainColumn);
          });
        })
        .catch(Util.asyncError);
    }

    watch(
      () => props.problem,
      () => {
        initProblem();
      },
    );

    watch(
      () => props.initialLanguage,
      () => {
        initProblem();
      },
    );

    watch(
      currentCase,
      () => {
        if (!props.isEmbedded || store.getters['isUpdatingSettings']) return;
        const casesColumn = goldenLayout?.root.getItemsById('cases-column')[0];
        if (!casesColumn) return;
        casesColumn.parent.setActiveContentItem(casesColumn);
      },
      { immediate: true },
    );

    watch(isDirty, (value: boolean) => {
      if (!value || props.isEmbedded) return;
      zipHref.value = null;
      zipDownload.value = null;
    });

    watch(theme, () => {
      for (const t in themeToRef) {
        if (t === theme.value) continue;
        const link = document.getElementById(themeToRef[t]);
        if (link) link.remove();
      }
      downloadThemeStylesheet(theme.value);
    });

    function onDetailsJsonReady(results: GraderResults) {
      store.dispatch('results', results);
      store.dispatch('compilerOutput', results.compile_error || '');
    }

    function onFilesZipReady(blob: Blob | null) {
      if (blob == null || blob.size == 0) {
        if (componentMapping.zipviewer) {
          (componentMapping.zipviewer as InstanceType<typeof ZipViewer>).zip =
            null;
        }
        store.dispatch('clearOutputs');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('loadend', (e) => {
        if (e.target?.readyState != FileReader.DONE) return;
        if (!reader.result) return;

        JSZip.loadAsync(reader.result)
          .then((zip) => {
            if (componentMapping.zipviewer) {
              (
                componentMapping.zipviewer as InstanceType<typeof ZipViewer>
              ).zip = zip;
            }
            store.dispatch('clearOutputs');

            Promise.all([
              zip.file('Main/compile.err')?.async('string'),
              zip.file('Main/compile.out')?.async('string'),
            ])
              .then((values) => {
                for (const value of values) {
                  if (!value) continue;
                  store.dispatch('compilerOutput', value);
                  return;
                }
                store.dispatch('compilerOutput', '');
              })
              .catch(Util.asyncError);

            for (const filename in zip.files) {
              if (filename.indexOf('/') !== -1) continue;
              zip
                .file(filename)
                ?.async('string')
                .then((contents) => {
                  store.dispatch('output', {
                    name: filename,
                    contents: contents,
                  });
                })
                .catch(Util.asyncError);
            }
          })
          .catch(Util.asyncError);
      });
      reader.readAsArrayBuffer(blob);
    }

    function handleSubmit() {
      postMessage({
        method: 'submitRun',
        params: {
          problem_alias: store.getters['alias'],
          language: store.getters['request.language'],
          source: store.getters['request.source'],
        },
      });
    }

    function handleRun() {
      if (isRunLoading.value) return;

      postMessage({
        method: 'executeRun',
        params: {
          problem_alias: store.getters['alias'],
          language: store.getters['request.language'],
          source: store.getters['request.source'],
        },
      });
      emit('execute-run');

      isRunLoading.value = true;
      fetch(`/grader/ephemeral/run/new/`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(store.getters['request']),
      })
        .then((response) => {
          if (!response.ok) return null;
          return response.formData();
        })
        .then((formData) => {
          if (!formData) {
            onDetailsJsonReady({
              contest_score: 0,
              judged_by: 'runner',
              max_score: 0,
              score: 0,
              verdict: 'JE',
            });
            store.dispatch('logs', '');
            onFilesZipReady(null);
            return;
          }

          if (formData.has('details.json')) {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
              if (!reader.result) {
                onDetailsJsonReady({
                  contest_score: 0,
                  judged_by: 'runner',
                  max_score: 0,
                  score: 0,
                  verdict: 'JE',
                });
              } else onDetailsJsonReady(JSON.parse(reader.result as string));
            });
            reader.readAsText(formData.get('details.json') as File);
          }

          if (formData.has('logs.txt.gz')) {
            const reader = new FileReader();
            reader.addEventListener('loadend', function () {
              if (
                reader.result instanceof ArrayBuffer &&
                reader.result.byteLength == 0
              ) {
                store.dispatch('logs', '');
                return;
              }
              store.dispatch(
                'logs',
                new TextDecoder('utf-8').decode(
                  pako.inflate(reader.result as ArrayBuffer),
                ),
              );
            });
            reader.readAsArrayBuffer(formData.get('logs.txt.gz') as File);
          } else {
            store.dispatch('logs', '');
          }

          onFilesZipReady(formData.get('files.zip') as File);
        })
        .catch(Util.asyncError)
        .finally(() => {
          isRunLoading.value = false;
        });
    }

    function handleDownload(e: Event) {
      if (!isDirty.value) return true;

      e.preventDefault();
      const zip = new JSZip();
      const cases = zip.folder('cases');
      if (!cases) {
        console.error('could not create cases folder');
        return;
      }

      const inputCases = store.getters['inputCases'];
      let testplan = '';
      for (const caseName in inputCases) {
        if (!inputCases[caseName]) continue;
        cases.file(`${caseName}.in`, inputCases[caseName].in);
        cases.file(`${caseName}.out`, inputCases[caseName].out);
        testplan += `${caseName} ${inputCases[caseName].weight || 1}\n`;
      }
      zip.file('testplan', testplan);

      const customValidator = store.getters['customValidator'];
      const settingsJson: Partial<types.ProblemSettings> = {
        Cases: store.getters['settingsCases'],
        Limits: store.getters['limits'],
        Validator: {
          Name: store.getters['Validator'],
          Tolerance: store.getters['Tolerance'] || 0,
          ...(customValidator?.language
            ? { Lang: customValidator?.language }
            : {}),
        },
      };
      zip.file('settings.json', JSON.stringify(settingsJson, null, '  '));

      const interactive: undefined | types.InteractiveSettingsDistrib =
        store.getters['Interactive'];
      if (interactive) {
        const interactiveFolder = zip.folder('interactive');
        if (!interactiveFolder) {
          console.error('could not create interactive folder');
          return;
        }

        interactiveFolder.file(
          `${interactive.module_name}.idl`,
          interactive.idl,
        );
        interactiveFolder.file(
          `Main.${Util.supportedLanguages[interactive.language].extension}`,
          interactive.main_source,
        );
        interactiveFolder.file(
          'examples/sample.in',
          inputCases.sample?.in || '',
        );
      }

      if (customValidator) {
        zip.file(
          `validator.${
            Util.supportedLanguages[customValidator.language].extension
          }`,
          customValidator.source,
        );
      }

      zip
        .generateAsync({ type: 'blob' })
        .then((blob) => {
          zipDownload.value = `${store.getters['moduleName']}.zip`;
          zipHref.value = window.URL.createObjectURL(blob);

          store.dispatch('isDirty', false);
        })
        .catch(Util.asyncError);
    }

    function handleUpload(e: Event) {
      const files = (e.target as HTMLInputElement)?.files;
      if (!files || files.length !== 1) return;

      const reader = new FileReader();
      reader.addEventListener('loadend', async (e) => {
        if (e.target?.readyState != FileReader.DONE) return;

        JSZip.loadAsync(reader.result as ArrayBuffer).then(async (zip) => {
          await store.dispatch('reset');
          await store.dispatch('removeCase', 'long');

          const testplanValue = await zip.file('testplan')?.async('string');
          const casesWeights: { [key: string]: number } = {};
          if (testplanValue) {
            for (const line of testplanValue.split('\n')) {
              if (line.startsWith('#') || line.trim() === '') continue;
              const tokens = line.split(/\s+/);

              if (tokens.length !== 2) continue;
              const [caseName, weight] = tokens;
              casesWeights[caseName] = parseFloat(weight);
            }
          }

          for (const fileName in zip.files) {
            if (!zip.files[fileName]) continue;

            if (fileName.startsWith('cases/') && fileName.endsWith('.in')) {
              const caseName = fileName.substring(
                'cases/'.length,
                fileName.length - '.in'.length,
              );
              const caseInFileName = fileName;
              const caseOutFileName = `cases/${caseName}.out`;

              Promise.all([
                zip.file(caseInFileName)?.async('string'),
                zip.file(caseOutFileName)?.async('string'),
              ])
                .then(([caseIn, caseOut]) => {
                  store.dispatch('createCase', {
                    name: caseName,
                    in: caseIn,
                    out: caseOut,
                    weight: casesWeights[caseName] || 1,
                  });
                })
                .catch(Util.asyncError);
            } else if (fileName.startsWith('validator.')) {
              const extension = fileName.substring('validator.'.length);
              if (!Util.supportedExtensions.includes(extension)) continue;

              zip
                .file(fileName)
                ?.async('string')
                .then((value) => {
                  store.dispatch('Validator', 'custom').then(() => {
                    store.dispatch(
                      'request.input.validator.custom_validator.language',
                      extension,
                    );
                    store.dispatch(
                      'request.input.validator.custom_validator.source',
                      value,
                    );
                  });
                })
                .catch(Util.asyncError);
            } else if (
              fileName.startsWith('interactive/') &&
              fileName.endsWith('.idl')
            ) {
              const moduleName = fileName.substring(
                'interactive/'.length,
                fileName.length - '.idl'.length,
              );

              zip
                .file(fileName)
                ?.async('string')
                .then((value) => {
                  store.dispatch('Interactive', {
                    idl: value,
                    module_name: moduleName,
                  });
                })
                .catch(Util.asyncError);
            } else if (fileName.startsWith('interactive/Main.')) {
              const extension = fileName.substring('interactive/Main.'.length);
              if (!Util.supportedExtensions.includes(extension)) continue;

              zip
                .file(fileName)
                ?.async('string')
                .then((value) => {
                  store.dispatch('Interactive', {
                    language: extension,
                    main_source: value,
                  });
                })
                .catch(Util.asyncError);
            }
          }
          zip
            .file('settings.json')
            ?.async('string')
            .then((value) => {
              const settings: Partial<types.ProblemSettings> =
                JSON.parse(value);
              if (settings.Limits) {
                store.dispatch('limits', settings.Limits);
              }
              if (settings.Validator?.Name) {
                store.dispatch('Validator', settings.Validator.Name);
              }
              if (settings.Validator?.Tolerance) {
                store.dispatch('Tolerance', settings.Validator.Tolerance);
              }
            })
            .catch(Util.asyncError);
        });
      });
      reader.readAsArrayBuffer(files[0]);
    }

    function RegisterVueComponent(
      componentName: string,
      component: VueComponent,
    ) {
      goldenLayout?.registerComponent(
        componentName,
        function (
          container: GoldenLayout.Container,
          componentState: ComponentState,
        ) {
          container.on('open', () => {
            const compProps: ComponentProps = {
              storeMapping: componentState.storeMapping,
            };
            for (const k in componentState) {
              if (k === 'id' || !componentState[k]) continue;
              compProps[k] = componentState[k];
            }

            const mountEl = (
              container.getElement() as unknown as HTMLElement[]
            )[0];
            const app = createApp({
              render: (): VNode => {
                return h(componentName, {
                  ...compProps,
                });
              },
            });
            const vueInstance = app.mount(mountEl);

            const vueComponent =
              (vueInstance as unknown as GraderComponent) ||
              ({} as GraderComponent);
            if (vueComponent.title) {
              container.setTitle(vueComponent.title);
              vueComponent.$watch('title', function (title: string) {
                container.setTitle(title);
              });
            }
            if (vueComponent.onResize) {
              container.on('resize', () => vueComponent.onResize?.());
            }
            componentMapping[componentState.id] = vueComponent;
          });
        },
      );
    }

    function onResized() {
      if (!layoutRoot.value?.clientWidth) return;
      if (!goldenLayout?.isInitialised) {
        goldenLayout?.init();
      }
      goldenLayout?.updateSize();
    }

    function downloadThemeStylesheet(themeStr: string) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = themeToRef[themeStr];
      document.head.appendChild(link);
    }

    onBeforeMount(() => {
      initProblem();
      downloadThemeStylesheet(theme.value);
    });

    onMounted(() => {
      goldenLayout = new GoldenLayout(
        props.isEmbedded ? EMBEDDED_CONFIG : UNEMBEDDED_CONFIG,
        layoutRoot.value!,
      );

      RegisterVueComponent(CASE_SELECTOR_COMPONENT_NAME, CaseSelector);
      RegisterVueComponent(MONACO_EDITOR_COMPONENT_NAME, MonacoEditor);
      RegisterVueComponent(MONACO_DIFF_COMPONENT_NAME, DiffEditor);
      RegisterVueComponent(SETTINGS_COMPONENT_NAME, IDESettings);
      RegisterVueComponent(TEXT_EDITOR_COMPONENT_NAME, TextEditor);
      RegisterVueComponent(ZIP_VIEWER_COMPONENT_NAME, ZipViewer);

      goldenLayout.init();

      if (window.ResizeObserver) {
        new ResizeObserver(onResized).observe(layoutRoot.value!);
      } else {
        window.addEventListener('resize', onResized);
      }
    });

    return {
      T,
      omegaup,
      'layout-root': layoutRoot,
      isRunLoading,
      isSubmitLoading,
      zipHref,
      zipDownload,
      now,
      isSubmitButton,
      isRunButton,
      isDirty,
      theme,
      selectedLanguage,
      getLanguageName,
      languages,
      isDark,
      canSubmit,
      canExecute,
      toggleTheme,
      handleSubmit,
      handleRun,
      handleDownload,
      handleUpload,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../sass/main.scss';

div > section {
  min-height: 60em;
}
div {
  &.vs-dark {
    background: var(--vs-dark-background-color);
    color: var(--vs-dark-font-color);
    border-bottom: 1px solid var(--vs-dark-background-color);

    /* Target the language selector */
    .form-control.form-control-sm[data-language-select] {
      background-color: var(--vs-dark-background-color);
      color: var(--vs-dark-font-color);
    }
  }
  &.vs {
    background: var(--vs-background-color);
    border-bottom: 1px solid var(--vs-background-color);
  }
}
a:hover {
  color: var(--zip-button-color--hover);
}
@import url('https://golden-layout.com/assets/css/goldenlayout-base.css');
</style>

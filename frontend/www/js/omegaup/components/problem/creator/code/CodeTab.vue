<template>
  <div class="card code-edit">
    <div class="card-body">
      <div class="form-group row align-items-center">
        <label class="col-12 col-sm-auto col-form-label mb-2 mb-sm-0 pr-sm-2">
          {{ T.wordsLanguage }}
        </label>
        <div class="col-12 col-sm-auto pl-sm-0">
          <select
            v-model="selectedLanguage"
            data-problem-creator-code-language
            class="form-control"
            name="language"
          >
            <option value="" disabled>
              {{ T.problemCreatorSelectLanguage }}
            </option>
            <option
              v-for="(language, key) in allowedLanguages"
              :key="key"
              :value="key"
            >
              {{ language }}
            </option>
          </select>
        </div>
      </div>
      <br />
      <div class="row">
        <div class="col-md-12">
          <div class="h-100">
            <omegaup-creator-code-view
              v-model="code"
              data-problem-creator-code-editor
              :language="selectedLanguage"
              :readonly="false"
              @change-language="handleChangeLanguage($event)"
            ></omegaup-creator-code-view>
          </div>
        </div>
      </div>
      <div class="form-group row mt-3 align-items-center">
        <label class="col-12 col-sm-auto col-form-label mb-2 mb-sm-0 pr-sm-2">
          {{ T.problemCreatorCodeUpload }}
        </label>
        <div
          class="col-12 col-sm-auto pl-sm-0 d-flex align-items-center overflow-hidden"
        >
          <input
            data-problem-creator-code-input
            class="text-truncate mw-100"
            type="file"
            name="file"
            @change="handleInputFile"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <button
            data-problem-creator-code-save-btn
            class="btn btn-primary .intro-js-code"
            type="submit"
            @click="updateCode"
          >
            {{ T.problemCreatorCodeSave }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import { useStore } from 'vuex';
import type { StoreState } from '../../../../problem/creator/types';
import { omegaup } from '../../../../omegaup';
import * as ui from '../../../../ui';
import T from '../../../../lang';
import creator_CodeView from '../../../arena/CodeView.vue';
import { LanguageInfo, supportedLanguages } from '../../../../grader/util';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import { getCookie, setCookie } from '../../../../cookies';
import { TabIndex } from '../Tabs.vue';

export default defineComponent({
  name: 'CodeTab',
  components: {
    'omegaup-creator-code-view': creator_CodeView,
  },
  props: {
    codeProp: {
      type: String,
      default: T.problemCreatorEmpty,
    },
    extensionProp: {
      type: String,
      default: T.problemCreatorEmpty,
    },
    activeTabIndex: {
      type: Number as PropType<TabIndex>,
      required: true,
    },
  },
  emits: ['show-update-success-message'],
  setup(props, { emit }) {
    const store = useStore<StoreState>();
    const inputLimit = 512 * 1024; // Hardcoded as 512kiB _must_ be enough for anybody.
    const selectedLanguage = ref('');
    const codeInternal = ref(T.problemCreatorEmpty);
    const extensionInternal = ref(T.problemCreatorEmpty);

    const code = computed({
      get: (): string => codeInternal.value,
      set: (newCode: string) => {
        codeInternal.value = newCode;
      },
    });

    const extension = computed({
      get: (): string => extensionInternal.value,
      set: (newExtension: string) => {
        extensionInternal.value = newExtension;
      },
    });

    const allowedLanguages = computed((): omegaup.Languages => {
      let languages: omegaup.Languages = {};
      Object.values(supportedLanguages).forEach((languageInfo: LanguageInfo) => {
        languages[languageInfo.language] = languageInfo.name;
      });
      return languages;
    });

    const allowedExtensions = computed((): string[] => {
      let extensions: string[] = [];
      Object.values(supportedLanguages).forEach((languageInfo: LanguageInfo) => {
        extensions.push(languageInfo.extension);
      });
      return extensions;
    });

    watch(() => props.codeProp, () => {
      code.value = props.codeProp;
    });

    watch(() => props.extensionProp, () => {
      if (
        props.extensionProp &&
        allowedExtensions.value.includes(props.extensionProp)
      ) {
        const languageInfo = Object.values(supportedLanguages).find(
          (language) => language.extension === props.extensionProp,
        );
        if (languageInfo) {
          selectedLanguage.value = languageInfo.language;
        }
      }
    });

    watch(() => props.activeTabIndex, (newIndex: TabIndex) => {
      if (newIndex === TabIndex.Code) {
        startIntroGuide();
      }
    });

    watch(selectedLanguage, () => {
      const languageInfo = Object.values(supportedLanguages).find(
        (language) => language.language === selectedLanguage.value,
      );
      if (languageInfo) {
        extension.value = languageInfo.extension;
      }
    });

    function readFile(e: HTMLInputElement): File | null {
      return (e.files && e.files[0]) || null;
    }

    function handleInputFile(ev: Event): void {
      const file = readFile(ev.target as HTMLInputElement);

      if (file) {
        if (inputLimit && file.size >= inputLimit) {
          alert(
            ui.formatString(T.problemCreatorCodeUploadFilesize, {
              limit: `${inputLimit / 1024} KiB`,
            }),
          );
          return;
        }
        let fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension && allowedExtensions.value.includes(fileExtension)) {
          const languageInfo = Object.values(supportedLanguages).find(
            (language) => language.extension === fileExtension,
          );
          if (languageInfo) {
            selectedLanguage.value = languageInfo.language;
          }
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result ?? null;
          if (result) {
            code.value = result.toString();
          }
        };
        reader.readAsText(file);
      }
    }

    function handleChangeLanguage(language: string): void {
      selectedLanguage.value = language;
    }

    function updateCode() {
      store.commit('updateCodeContent', code.value);
      store.commit('updateCodeExtension', extension.value);
      emit('show-update-success-message');
    }

    function startIntroGuide() {
      if (!getCookie('has-visited-code-tab')) {
        introJs()
          .setOptions({
            nextLabel: T.interactiveGuideNextButton,
            prevLabel: T.interactiveGuidePreviousButton,
            doneLabel: T.interactiveGuideDoneButton,
            steps: [
              {
                title: T.problemCreatorCodeTabIntroSelectLanguageTitle,
                intro: T.problemCreatorCodeTabIntroSelectLanguageIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-problem-creator-code-language]',
),
              },
              {
                title: T.problemCreatorCodeTabIntroWriteCodeTitle,
                intro: T.problemCreatorCodeTabIntroWriteCodeIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-problem-creator-code-editor]',
),
              },
              {
                title: T.problemCreatorCodeTabIntroUploadFileTitle,
                intro: T.problemCreatorCodeTabIntroUploadFileIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-problem-creator-code-input]',
),
              },
              {
                title: T.problemCreatorCodeTabIntroSaveCodeTitle,
                intro: T.problemCreatorCodeTabIntroSaveCodeIntro,
                element: document.querySelector<HTMLElement>(
                  '[data-problem-creator-code-save-btn]',
),
              },
            ],
          })
          .start();

        setCookie('has-visited-code-tab', true);
      }
    }

    return {
      T,
      ui,
      omegaup,
      selectedLanguage,
      code,
      allowedLanguages,
      handleInputFile,
      handleChangeLanguage,
      updateCode,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../../../../sass/main.scss';

.code-edit {
  background: var(--creator-code-background-color);
}
</style>

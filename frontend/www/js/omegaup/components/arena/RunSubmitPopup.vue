<template>
  <OmegaupOverlayPopup @dismiss="emit('dismiss')">
    <form
      data-run-submit
      class="d-flex flex-column h-100"
      @submit.prevent="onSubmit"
    >
      <div class="form-group row">
        <label class="col-sm-2 col-form-label">
          {{ T.wordsLanguage }}
        </label>
        <div class="col-sm-4">
          <select
            v-model="selectedLanguage"
            class="form-control"
            name="language"
          >
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
      <div class="form-group row">
        <label class="col-sm-7 col-form-label">
          {{ T.arenaRunSubmitFilename }}
          <tt>{{ filename }}</tt>
        </label>
      </div>
      <div class="form-group row">
        <label class="col-sm-7 col-form-label">{{
          T.arenaRunSubmitPaste
        }}</label>
      </div>
      <div class="h-100">
        <OmegaupArenaCodeView
          v-model="code"
          :language="selectedLanguage"
          :readonly="false"
          @change-language="handleChangeLanguage($event)"
        ></OmegaupArenaCodeView>
      </div>
      <div class="form-group row mt-3 align-items-center">
        <label class="col-sm-3 col-form-label">
          {{ T.arenaRunSubmitUpload }}
        </label>
        <div class="col-sm-7">
          <input ref="inputFile" class="w-100" type="file" name="file" />
        </div>
      </div>
      <div class="form-group row">
        <div class="col-sm-10">
          <button
            type="submit"
            class="btn btn-primary"
            data-submit-run
            :disabled="!canSubmit"
          >
            <OmegaupCountdown
              v-if="!canSubmit"
              :target-time="nextSubmissionTimestamp"
              :countdown-format="
                omegaup.CountdownFormat.WaitBetweenUploadsSeconds
              "
              @finish="now = Date.now()"
            ></OmegaupCountdown>
            <span v-else>{{ T.wordsSend }}</span>
          </button>
        </div>
      </div>
    </form>
  </OmegaupOverlayPopup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { omegaup } from '../../omegaup';
import * as ui from '../../ui';
import T from '../../lang';
import OmegaupArenaCodeView from './CodeView.vue';
import OmegaupCountdown from '../Countdown.vue';
import OmegaupOverlayPopup from '../OverlayPopup.vue';
import {
  LanguageInfo,
  supportedExtensions,
  supportedLanguages,
} from '../../grader/util';
import { sourceTemplates } from '../../grader/GraderTemplates';

const props = withDefaults(
  defineProps<{
    languages: string[];
    nextSubmissionTimestamp: Date;
    inputLimit: number;
    preferredLanguage?: null | string;
  }>(),
  {
    preferredLanguage: null,
  },
);

const emit = defineEmits<{
  (e: 'dismiss'): void;
  (e: 'submit-run', code: string, language: string | null): void;
}>();

const inputFile = ref<HTMLInputElement | null>(null);
const selectedLanguage = ref<null | string>(props.preferredLanguage);
const code = ref('');
const now = ref<number>(Date.now());

function getLanguageExtension(language: string): string {
  if (!language || language === 'cat') {
    return '';
  }
  const languageInfo = supportedLanguages[language];
  if (languageInfo) {
    return languageInfo.extension;
  }
  // Fallback logic
  if (language.startsWith('cpp')) {
    return 'cpp';
  }
  if (language.startsWith('c11-')) {
    return 'c';
  }
  if (language.startsWith('py')) {
    return 'py';
  }
  return language;
}

function loadBoilerplateForLanguage(language: string): void {
  if (!language || language === 'cat') {
    code.value = '';
    return;
  }
  const ext = getLanguageExtension(language);
  if (ext && sourceTemplates[ext]) {
    code.value = sourceTemplates[ext];
  } else {
    // If no template found, keep current code or set empty
    code.value = '';
  }
}

function handleChangeLanguage(language: string): void {
  selectedLanguage.value = language;
}

const canSubmit = computed((): boolean => {
  return props.nextSubmissionTimestamp.getTime() <= now.value;
});

const filename = computed((): string => {
  return `Main${extension.value}`;
});

const allowedLanguages = computed(
  (): omegaup.Languages => {
    const result: omegaup.Languages = {};
    const allLanguages: { language: string; name: string }[] = Object.values(
      supportedLanguages,
    ).map((languageInfo: LanguageInfo) => ({
      language: languageInfo.language,
      name: languageInfo.name,
    }));
    // dont forget about cat ext
    allLanguages.push({ language: 'cat', name: T.outputOnly });

    allLanguages
      .filter(
        (item) =>
          props.languages.includes(item.language) || item.language === '',
      )
      .forEach((optionItem) => {
        result[optionItem.language] = optionItem.name;
      });
    return result;
  },
);

const extension = computed((): string => {
  if (!selectedLanguage.value || selectedLanguage.value === 'cat') {
    return '';
  }
  if (selectedLanguage.value.startsWith('cpp')) {
    return '.cpp';
  }
  if (selectedLanguage.value.startsWith('c11-')) {
    return '.c';
  }
  if (selectedLanguage.value.startsWith('py')) {
    return '.py';
  }
  return `.${selectedLanguage.value}`;
});

watch(
  selectedLanguage,
  (newLanguage, oldLanguage) => {
    if (!newLanguage || newLanguage === oldLanguage) return;
    loadBoilerplateForLanguage(newLanguage);
  },
  { immediate: true },
);

watch(
  () => props.preferredLanguage,
  (newValue) => {
    if (newValue) {
      selectedLanguage.value = newValue;
    }
  },
);

function onSubmit(): void {
  if (!canSubmit.value) {
    alert(
      ui.formatString(T.arenaRunSubmitWaitBetweenUploads, {
        submissionGap: Math.ceil(
          (props.nextSubmissionTimestamp.getTime() - Date.now()) / 1000,
        ),
      }),
    );
    return;
  }

  if (!selectedLanguage.value) {
    alert(T.arenaRunSubmitMissingLanguage);
    return;
  }
  const file = inputFile.value?.files?.[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result ?? null;
      if (result === null) return;
      emit('submit-run', result as string, selectedLanguage.value);
    };

    // add txt, p extensions
    const validExtensions = [...supportedExtensions, 'p', 'txt'];
    if (
      selectedLanguage.value !== 'cat' ||
      file.type.indexOf('text/') === 0 ||
      validExtensions.includes(extension.value)
    ) {
      if (props.inputLimit && file.size >= props.inputLimit) {
        alert(
          ui.formatString(T.arenaRunSubmitFilesize, {
            limit: `${props.inputLimit / 1024} KiB`,
          }),
        );
        return;
      }
      reader.readAsText(file, 'UTF-8');
      return;
    }
    // 512kiB _must_ be enough for anybody.
    if (file.size >= 512 * 1024) {
      alert(ui.formatString(T.arenaRunSubmitFilesize, { limit: '512kiB' }));
      return;
    }
    reader.readAsDataURL(file);

    return;
  }

  if (!code.value) {
    alert(T.arenaRunSubmitEmptyCode);
    return;
  }

  emit('submit-run', code.value, selectedLanguage.value);
}

function clearForm(): void {
  code.value = '';
  if (inputFile.value) {
    inputFile.value.type = 'text';
    inputFile.value.type = 'file';
  }
}

defineExpose({ clearForm });
</script>

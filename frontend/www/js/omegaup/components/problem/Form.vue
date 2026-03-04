<template>
  <div class="card problem-form">
    <div v-if="!isUpdate" class="card-header">
      <h3 class="card-title mb-0">
        {{ T.problemNew }}
      </h3>
    </div>
    <div class="text-center">
      <p class="mt-3 mb-0">
        {{ T.problemEditFormFirstTimeCreatingAProblem }}
        <strong>
          <a :href="howToWriteProblemLink" target="_blank">
            {{ T.problemEditFormHereIsHowToWriteProblems }}
          </a>
        </strong>
      </p>
    </div>
    <div class="card-body px-2 px-sm-4">
      <form ref="form" method="POST" class="form" enctype="multipart/form-data">
        <div class="accordion mb-3">
          <div class="card">
            <div class="card-header">
              <h2 class="mb-0">
                <button
                  ref="basic-info"
                  class="btn btn-link btn-block text-left"
                  type="button"
                  data-toggle="collapse"
                  data-target=".basic-info"
                  aria-expanded="true"
                  aria-controls="problem-form-problem"
                >
                  {{ T.problemEditBasicInfo }}
                </button>
              </h2>
            </div>
            <div class="collapse show card-body px-2 px-sm-4 basic-info">
              <div class="row">
                <div class="form-group col-md-6 introjs-title">
                  <label class="control-label">{{ T.wordsTitle }}</label>
                  <input
                    v-model="title"
                    required
                    name="title"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.includes('title') }"
                    @blur="onGenerateAlias"
                  />
                </div>
                <div class="form-group col-md-6 introjs-short-title">
                  <label class="control-label">{{ T.wordsAlias }}</label>
                  <input
                    ref="alias"
                    v-model="alias"
                    required
                    name="problem_alias"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid': errors.includes('problem_alias'),
                    }"
                    :disabled="isUpdate"
                  />
                </div>
              </div>
              <div class="row">
                <div class="form-group col-md-6 introjs-origin">
                  <label class="control-label">{{ T.problemEditSource }}</label>
                  <input
                    v-model="source"
                    required
                    name="source"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.includes('source') }"
                  />
                </div>
                <div class="form-group col-md-6 introjs-file">
                  <label class="control-label">{{
                    T.problemEditFormFile
                  }}</label>
                  <input
                    :required="!isUpdate"
                    name="problem_contents"
                    type="file"
                    accept=".zip"
                    class="form-control"
                    :class="{
                      'is-invalid': errors.includes('problem_contents'),
                    }"
                    @change="onUploadFile"
                  />
                </div>
              </div>
            </div>
          </div>

          <template v-if="!isUpdate">
            <div class="card">
              <div class="card-header">
                <h2 class="mb-0">
                  <button
                    ref="tags"
                    class="btn btn-link btn-block text-left"
                    type="button"
                    data-toggle="collapse"
                    data-target=".tags"
                    aria-expanded="true"
                    aria-controls="problem-form-problem"
                  >
                    {{ T.problemEditTags }}
                  </button>
                </h2>
              </div>
              <div class="collapse show card-body px-2 px-sm-4 tags">
                <div
                  v-show="
                    (selectedPublicTags.length === 0 || !problemLevel) &&
                    currentLanguages !== ''
                  "
                  class="alert alert-info"
                >
                  {{ T.problemEditTagPublicRequired }}
                </div>
                <div class="introjs-tags-and-level">
                  <omegaup-problem-tags
                    :public-tags="data.publicTags"
                    :level-tags="data.levelTags"
                    :alias="data.alias"
                    :is-create="true"
                    :problem-level="problemLevel"
                    :selected-private-tags="selectedPrivateTags"
                    :selected-public-tags="selectedPublicTags"
                    :can-add-new-tags="true"
                    :errors="errors"
                    :is-lecture="currentLanguages === ''"
                    @emit-add-tag="addTag"
                    @emit-remove-tag="removeTag"
                    @select-problem-level="selectProblemLevel"
                  ></omegaup-problem-tags>
                  <input
                    name="selected_tags"
                    :value="selectedTagsList"
                    type="hidden"
                  />
                  <input
                    name="problem_level"
                    :value="problemLevel"
                    type="hidden"
                  />
                </div>
              </div>
            </div>
          </template>
          <div class="card">
            <div class="card-header">
              <h2 class="mb-0">
                <button
                  class="btn btn-link btn-block text-left collapsed"
                  type="button"
                  data-toggle="collapse"
                  data-target=".validation"
                  aria-expanded="true"
                  aria-controls="problem-form-problem"
                >
                  {{ T.problemEditValidation }}
                </button>
              </h2>
            </div>
            <div class="card-body px-2 px-sm-4 validation">
              <div class="row">
                <div class="form-group col-md-6 introjs-type">
                  <label>{{ T.problemEditFormLanguages }}</label>
                  <select
                    v-model="currentLanguages"
                    name="languages"
                    class="form-control"
                    :class="{ 'is-invalid': errors.includes('languages') }"
                    required
                  >
                    <option
                      v-for="(languageText, languageName) in validLanguages"
                      :key="languageName"
                      :value="languageName"
                    >
                      {{ languageText }}
                    </option>
                  </select>
                </div>
                <div class="form-group col-md-6 introjs-validator">
                  <label>{{ T.problemEditFormValidatorType }}</label>
                  <select
                    v-model="validator"
                    name="validator"
                    class="form-control"
                    :class="{ 'is-invalid': errors.includes('validator') }"
                    :disabled="currentLanguages === ''"
                    required
                  >
                    <option
                      v-for="(validatorText, validatorIndex) in validatorTypes"
                      :key="validatorIndex"
                      :value="validatorIndex"
                    >
                      {{ validatorText }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h2 class="mb-0">
                <button
                  ref="limits"
                  class="btn btn-link btn-block text-left collapsed"
                  type="button"
                  data-toggle="collapse"
                  data-target=".limits"
                  aria-expanded="true"
                  aria-controls="problem-form-problem"
                >
                  {{ T.problemEditLimits }}
                </button>
              </h2>
            </div>
            <div class="collapse card-body px-2 px-sm-4 limits">
              <omegaup-problem-settings
                :errors="errors"
                :current-languages="currentLanguages"
                :time-limit="timeLimit"
                :extra-wall-time="extraWallTime"
                :memory-limit="memoryLimit"
                :output-limit="outputLimit"
                :input-limit="inputLimit"
                :overall-wall-time-limit="overallWallTimeLimit"
                :validator="validator"
                :validator-time-limit="validatorTimeLimit"
                :has-visited-section="hasVisitedSection"
              ></omegaup-problem-settings>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h2 class="mb-0">
                <button
                  class="btn btn-link btn-block text-left collapsed"
                  type="button"
                  data-toggle="collapse"
                  data-target=".access"
                  aria-expanded="true"
                  aria-controls="problem-form-problem"
                >
                  {{ T.problemEditAccess }}
                </button>
              </h2>
            </div>
            <div class="collapse card-body px-2 px-sm-4 access">
              <div class="row">
                <div class="form-group col-md-6">
                  <label>{{ T.problemEditEmailClarifications }}</label>
                  <div class="form-control">
                    <div class="form-check form-check-inline">
                      <input
                        v-model="emailClarifications"
                        type="radio"
                        name="email_clarifications"
                        class="form-check-input"
                        :value="true"
                      />
                      <label class="form-check-label">
                        {{ T.wordsYes }}
                      </label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input
                        v-model="emailClarifications"
                        type="radio"
                        name="email_clarifications"
                        class="form-check-input"
                        :value="false"
                      />
                      <label class="form-check-label">
                        {{ T.wordsNo }}
                      </label>
                    </div>
                  </div>
                </div>
                <div class="form-group col-md-6">
                  <label>{{ T.problemEditFormAppearsAsPublic }}</label>
                  <div class="form-control">
                    <label class="form-check form-check-inline">
                      <input
                        v-model="isPublic"
                        data-problem-access-radio-yes
                        type="radio"
                        name="visibility"
                        class="form-check-input"
                        :disabled="!isEditable"
                        :value="true"
                      />
                      <span class="form-check-label">{{ T.wordsYes }}</span>
                    </label>
                    <label class="form-check form-check-inline">
                      <input
                        v-model="isPublic"
                        type="radio"
                        name="visibility"
                        class="form-check-input"
                        :disabled="!isEditable"
                        :value="false"
                      />
                      <span class="form-check-label">{{ T.wordsNo }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <template v-if="!isUpdate">
            <div class="card">
              <div class="card-header">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link btn-block text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target=".evaluation"
                    aria-expanded="true"
                    aria-controls="problem-form-problem"
                  >
                    {{ T.problemEditEvaluation }}
                  </button>
                </h2>
              </div>
              <div class="collapse card-body px-2 px-sm-4 evaluation">
                <div class="row">
                  <div class="form-group col-md-6">
                    <label>{{ T.wordsShowCasesDiff }}</label>
                    <select
                      v-model="showDiff"
                      name="show_diff"
                      class="form-control"
                      :class="{ 'is-invalid': errors.includes('show_diff') }"
                      :disabled="languages === ''"
                    >
                      <option value="none">
                        {{ T.problemVersionDiffModeNone }}
                      </option>
                      <option value="examples">
                        {{ T.wordsOnlyExamples }}
                      </option>
                      <option value="all">{{ T.wordsAll }}</option>
                    </select>
                  </div>
                  <div class="form-group col-md-6">
                    <label>{{ T.problemEditGroupScorePolicy }}</label>
                    <select
                      v-model="groupScorePolicy"
                      name="group_score_policy"
                      class="form-control"
                      :class="{
                        'is-invalid': errors.includes('group_score_policy'),
                      }"
                      :disabled="languages === ''"
                    >
                      <option value="sum-if-not-zero">
                        {{ T.problemEditGroupScorePolicySumIfNotZero }}
                      </option>
                      <option value="min">
                        {{ T.problemEditGroupScorePolicyMin }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <template v-if="isUpdate">
          <div class="mt-8 row">
            <div class="form-group col-md-4">
              <label>{{ T.wordsShowCasesDiff }}</label>
              <select
                v-model="showDiff"
                name="show_diff"
                class="form-control"
                :class="{ 'is-invalid': errors.includes('show_diff') }"
              >
                <option value="none">{{ T.problemVersionDiffModeNone }}</option>
                <option value="examples">{{ T.wordsOnlyExamples }}</option>
                <option value="all">{{ T.wordsAll }}</option>
              </select>
            </div>
            <div class="form-group col-md-4">
              <label>{{ T.problemEditGroupScorePolicy }}</label>
              <select
                v-model="groupScorePolicy"
                name="group_score_policy"
                class="form-control"
                :class="{ 'is-invalid': errors.includes('group_score_policy') }"
                :disabled="languages === ''"
              >
                <option value="sum-if-not-zero">
                  {{ T.problemEditGroupScorePolicySumIfNotZero }}
                </option>
                <option value="min">
                  {{ T.problemEditGroupScorePolicyMin }}
                </option>
              </select>
            </div>
            <div class="form-group col-md-4">
              <label class="control-label">{{
                T.problemEditCommitMessage
              }}</label>
              <input
                v-model="message"
                required
                class="form-control"
                :class="{ 'is-invalid': errors.includes('message') }"
                name="message"
                type="text"
              />
            </div>
          </div>
        </template>
        <input
          v-if="isEditable"
          type="hidden"
          name="visibility"
          :value="visibility"
        />
        <input name="request" value="submit" type="hidden" />
        <input name="update_published" value="non-problemset" type="hidden" />
        <div class="row">
          <div class="form-group col-md-6 no-bottom-margin">
            <button
              type="submit"
              class="btn btn-primary"
              :title="
                !problemLevel && !isUpdate ? T.selectProblemLevelDesc : ''
              "
              @click="openCollapsedIfRequired()"
            >
              {{ buttonText }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  PropType,
} from 'vue';
import problem_Settings from './Settings.vue';
import problem_Tags from './Tags.vue';
import T from '../../lang';
import latinize from 'latinize';
import { types } from '../../api_types';
import 'intro.js/introjs.css';
import introJs from 'intro.js';
import { getCookie, setCookie } from '../../cookies';

export default defineComponent({
  name: 'ProblemForm',
  components: {
    'omegaup-problem-settings': problem_Settings,
    'omegaup-problem-tags': problem_Tags,
  },
  props: {
    data: {
      type: Object as PropType<types.ProblemFormPayload>,
      required: true,
    },
    errors: { type: Array as PropType<string[]>, default: () => [] },
    isUpdate: { type: Boolean, default: false },
    originalVisibility: { type: Number, default: 0 },
    hasVisitedSection: { type: Boolean, default: true },
  },
  emits: ['alias-changed'],
  setup(props, { emit }) {
    const basicInfoRef = ref<HTMLDivElement | null>(null);
    const tagsRef = ref<HTMLDivElement | null>(null);
    const limitsRef = ref<HTMLDivElement | null>(null);
    const formRef = ref<HTMLFormElement | null>(null);

    const title = ref(props.data.title);
    const alias = ref(props.data.alias);
    const timeLimit = ref(props.data.timeLimit);
    const extraWallTime = ref(props.data.extraWallTime);
    const memoryLimit = ref(props.data.memoryLimit);
    const outputLimit = ref(props.data.outputLimit);
    const inputLimit = ref(props.data.inputLimit);
    const overallWallTimeLimit = ref(props.data.overallWallTimeLimit);
    const validatorTimeLimit = ref(props.data.validatorTimeLimit);
    const emailClarifications = ref(props.data.emailClarifications);
    const visibility = ref(props.data.visibility);
    const allowUserAddTags = ref(props.data.allowUserAddTags);
    const source = ref(props.data.source);
    const validator = ref(props.data.validator);
    const languages = ref(props.data.languages);
    const tags = ref(props.data.tags);
    const problemLevel = ref(props.data.problem_level || '');
    const showDiff = ref(props.data.showDiff);
    const groupScorePolicy = ref(
      props.data.groupScorePolicy || 'sum-if-not-zero',
    );
    const selectedTags = ref(props.data.selectedTags || []);
    const message = ref('');
    const hasFile = ref(false);
    const validLanguages = ref(props.data.validLanguages);
    const validatorTypes = ref(props.data.validatorTypes);
    const currentLanguages = ref(props.data.languages);

    const howToWriteProblemLink = computed(
      (): string =>
        'https://github.com/omegaup/omegaup/blob/main/frontend/www/docs/How-to-write-problems-for-omegaUp.md',
    );

    const buttonText = computed((): string => {
      if (props.isUpdate) {
        return T.problemEditFormUpdateProblem;
      }
      return T.problemEditFormCreateProblem;
    });

    const selectedTagsList = computed((): string => {
      return JSON.stringify(selectedTags.value);
    });

    const isPublic = computed({
      get: (): boolean => {
        return visibility.value > props.data.visibilityStatuses.private;
      },
      set: (val: boolean) => {
        if (
          props.originalVisibility ===
            props.data.visibilityStatuses.publicWarning ||
          props.originalVisibility ===
            props.data.visibilityStatuses.privateWarning
        ) {
          visibility.value = val
            ? props.data.visibilityStatuses.publicWarning
            : props.data.visibilityStatuses.privateWarning;
          return;
        }
        if (
          props.originalVisibility ===
            props.data.visibilityStatuses.publicBanned ||
          props.originalVisibility ===
            props.data.visibilityStatuses.privateBanned
        ) {
          visibility.value = val
            ? props.data.visibilityStatuses.publicBanned
            : props.data.visibilityStatuses.privateBanned;
          return;
        }
        visibility.value = val
          ? props.data.visibilityStatuses.public
          : props.data.visibilityStatuses.private;
      },
    });

    const isEditable = computed(
      (): boolean =>
        props.data.visibilityStatuses.publicBanned < visibility.value &&
        visibility.value < props.data.visibilityStatuses.promoted,
    );

    const selectedPublicTags = computed((): string[] => {
      return selectedTags.value
        .filter((tag) => tag.public === true)
        .map((tag) => tag.tagname);
    });

    const selectedPrivateTags = computed((): string[] => {
      return selectedTags.value
        .filter((tag) => tag.public === false)
        .map((tag) => tag.tagname);
    });

    function addTag(
      tagAlias: string,
      tagname: string,
      tagIsPublic: boolean,
    ): void {
      selectedTags.value.push({
        tagname: tagname,
        public: tagIsPublic,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function removeTag(
      tagAlias: string,
      tagname: string,
      tagIsPublic: boolean,
    ): void {
      selectedTags.value = selectedTags.value.filter(
        (tag) => tag.tagname !== tagname,
      );
    }

    function selectProblemLevel(levelTag: string): void {
      problemLevel.value = levelTag;
    }

    function onUploadFile(ev: InputEvent): void {
      const uploadedFile = ev.target as HTMLInputElement;
      hasFile.value = uploadedFile.files !== null;
    }

    function onGenerateAlias(): void {
      if (props.isUpdate) {
        return;
      }
      let generatedAlias = latinize(title.value);
      generatedAlias = generatedAlias.replace(/\s+/g, '-');
      generatedAlias = generatedAlias.replace(/[^a-zA-Z0-9_-]/g, '');
      generatedAlias = generatedAlias.substring(0, 32);
      alias.value = generatedAlias;
    }

    function openCollapsedIfRequired(): void {
      if (!formRef.value) return;
      const formData = new FormData(formRef.value);

      let basicInfoCollapsed = basicInfoRef.value
        ? basicInfoRef.value.classList.contains('collapsed')
        : false;
      let limitsCollapsed = limitsRef.value
        ? limitsRef.value.classList.contains('collapsed')
        : false;
      let tagsCollapsed = !props.isUpdate
        ? tagsRef.value
          ? tagsRef.value.classList.contains('collapsed')
          : false
        : false;

      for (const [key, value] of formData.entries()) {
        const isEmpty = value === '';
        if (isEmpty) {
          if (
            basicInfoCollapsed &&
            (key === 'title' || key === 'alias' || key === 'source')
          ) {
            basicInfoRef.value?.click();
            basicInfoCollapsed = false;
            continue;
          }
          if (basicInfoCollapsed && !props.isUpdate && !hasFile.value) {
            basicInfoRef.value?.click();
            basicInfoCollapsed = false;
            continue;
          }

          if (tagsCollapsed && key === 'problem_level') {
            tagsRef.value?.click();
            tagsCollapsed = false;
            continue;
          }
          if (
            limitsCollapsed &&
            (key === 'time_limit' ||
              key === 'overall_wall_time_limit' ||
              key === 'extra_wall_time' ||
              key === 'memory_limit' ||
              key === 'output_limit' ||
              key === 'input_limit')
          ) {
            limitsRef.value?.click();
            limitsCollapsed = false;
            continue;
          }
        }
      }
    }

    watch(alias, (newValue: string) => {
      if (props.isUpdate) {
        return;
      }
      emit('alias-changed', newValue);
    });

    onMounted(() => {
      const guideTitle = T.createProblemInteractiveGuideTitle;
      if (!props.hasVisitedSection) {
        introJs()
          .setOptions({
            nextLabel: T.interactiveGuideNextButton,
            prevLabel: T.interactiveGuidePreviousButton,
            doneLabel: T.interactiveGuideDoneButton,
            steps: [
              {
                title: guideTitle,
                intro: T.createProblemInteractiveGuideWelcome,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-title'),
                title: guideTitle,
                intro: T.createProblemInteractiveGuideProblemTitle,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-short-title',
                ),
                title: guideTitle,
                intro: T.createProblemInteractiveGuideShortTitle,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-origin'),
                title: guideTitle,
                intro: T.createProblemInteractiveGuideOrigin,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-file'),
                title: guideTitle,
                intro: T.createProblemInteractiveGuideFile,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-tags-and-level',
                ),
                title: guideTitle,
                intro: T.createProblemInteractiveGuideTagsAndLevel,
              },
              {
                element: document.querySelector<HTMLElement>('.introjs-type'),
                title: guideTitle,
                intro: T.createProblemInteractiveGuideType,
              },
              {
                element:
                  document.querySelector<HTMLElement>('.introjs-validator'),
                title: guideTitle,
                intro: T.createProblemInteractiveGuideValidator,
              },
            ],
          })
          .start();
        setCookie('has-visited-create-problem', true);
      }
    });

    return {
      T,
      'basic-info': basicInfoRef,
      tags: tagsRef,
      limits: limitsRef,
      form: formRef,
      title,
      alias,
      timeLimit,
      extraWallTime,
      memoryLimit,
      outputLimit,
      inputLimit,
      overallWallTimeLimit,
      validatorTimeLimit,
      emailClarifications,
      visibility,
      allowUserAddTags,
      source,
      validator,
      languages,
      problemLevel,
      showDiff,
      groupScorePolicy,
      selectedTags,
      message,
      hasFile,
      validLanguages,
      validatorTypes,
      currentLanguages,
      howToWriteProblemLink,
      buttonText,
      selectedTagsList,
      isPublic,
      isEditable,
      selectedPublicTags,
      selectedPrivateTags,
      addTag,
      removeTag,
      selectProblemLevel,
      onUploadFile,
      onGenerateAlias,
      openCollapsedIfRequired,
    };
  },
});
</script>

<style>
.problem-form .languages {
  padding: 0;
  width: 100%;
}
</style>

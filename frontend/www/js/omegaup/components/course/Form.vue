<template>
  <div class="omegaup-course-details card">
    <div v-if="!update" class="card-header px-2 px-sm-4">
      <h3 class="card-title mb-0">{{ T.courseNew }}</h3>
    </div>
    <div class="card-body px-2 px-sm-4">
      <div class="required-fields-legend">{{ T.wordsRequiredField }}</div>
      <form class="form" data-course-form @submit.prevent="onSubmit">
        <div class="row">
          <div class="form-group col-md-4">
            <label class="font-weight-bold w-100 introjs-course-name">
              <span
                class="field-required"
                :class="{ 'is-complete': isNameComplete }"
                >{{ T.wordsName }}</span
              >
              <input
                v-model="name"
                :disabled="readOnly"
                class="form-control"
                :class="{ 'is-invalid': invalidParameterName === 'name' }"
                data-course-new-name
                type="text"
                required="required"
                :maxlength="MAX_LENGTH.name"
            /></label>
            <small
              class="character-counter"
              :class="{ 'text-danger': isExceedingName }"
              >{{ name.length }}/{{ MAX_LENGTH.name }}</small
            >
          </div>
          <div class="form-group col-md-4">
            <label class="font-weight-bold w-100 introjs-short-title">
              <span
                class="field-required"
                :class="{ 'is-complete': isAliasComplete }"
                >{{ T.courseNewFormShortTitleAlias }}</span
              >
              <font-awesome-icon
                :title="T.courseNewFormShortTitleAliasDesc"
                icon="info-circle" />
              <input
                v-model="alias"
                class="form-control"
                :class="{
                  'is-invalid': invalidParameterName === 'alias',
                }"
                type="text"
                data-course-new-alias
                :disabled="update || readOnly"
                required="required"
                :maxlength="MAX_LENGTH.alias"
            /></label>
            <small
              class="character-counter"
              :class="{ 'text-danger': isExceedingAlias }"
              >{{ alias.length }}/{{ MAX_LENGTH.alias }}</small
            >
          </div>
          <div class="form-group col-md-4 introjs-scoreboard">
            <span class="font-weight-bold"
              >{{ T.courseNewFormShowScoreboard }}
              <font-awesome-icon
                :title="T.courseNewFormShowScoreboardDesc"
                icon="info-circle"
              />
            </span>
            <omegaup-radio-switch
              v-model:value="showScoreboard"
              :selected-value="showScoreboard"
              name="show-scoreboard"
              :readonly="readOnly"
            ></omegaup-radio-switch>
          </div>
        </div>
        <div class="row">
          <div class="form-group col-md-4">
            <label class="font-weight-bold w-100 introjs-start-date"
              >{{ T.courseNewFormStartDate }}
              <font-awesome-icon
                :title="T.courseNewFormStartDateDesc"
                icon="info-circle" />
              <omegaup-datepicker
                v-model="startTime"
                name="start-date"
                :disabled="readOnly"
                :min="update ? null : new Date()"
              ></omegaup-datepicker
            ></label>
          </div>
          <div class="form-group col-md-4 introjs-duration">
            <span class="font-weight-bold"
              >{{ T.courseNewFormUnlimitedDuration }}
              <font-awesome-icon
                :title="T.courseNewFormUnlimitedDurationDesc"
                icon="info-circle"
              />
            </span>
            <omegaup-radio-switch
              v-model:value="unlimitedDuration"
              :readonly="readOnly"
              :selected-value="unlimitedDuration"
              name="unlimited-duration"
            ></omegaup-radio-switch>
          </div>
          <div class="form-group col-md-4">
            <label class="font-weight-bold w-100 introjs-end-date"
              >{{ T.courseNewFormEndDate }}
              <font-awesome-icon
                :title="T.courseNewFormEndDateDesc"
                icon="info-circle" />
              <omegaup-datepicker
                v-model="finishTime"
                :disabled="readOnly"
                name="end-date"
                :enabled="!unlimitedDuration"
                :is-invalid="invalidParameterName === 'finish_time'"
              ></omegaup-datepicker
            ></label>
          </div>
        </div>
        <div class="row">
          <div class="form-group col-md-4">
            <label class="font-weight-bold w-100 introjs-school">
              <span
                class="field-required"
                :class="{ 'is-complete': isSchoolComplete }"
                >{{ T.profileSchool }}</span
              >
              <div
                :class="{
                  'is-invalid-school': invalidParameterName === 'school',
                }"
              >
                <omegaup-common-typeahead
                  :existing-options="searchResultSchools"
                  :options="searchResultSchools"
                  :readonly="readOnly"
                  v-model:value="school"
                  @update-existing-options="
                    (query) => $emit('update-search-result-schools', query)
                  "
                ></omegaup-common-typeahead>
              </div>
            </label>
          </div>
          <div class="form-group col-md-4 introjs-basic-information">
            <span class="font-weight-bold"
              >{{ T.courseNewFormBasicInformationRequired }}
              <font-awesome-icon
                :title="T.courseNewFormBasicInformationRequiredDesc"
                icon="info-circle"
              />
            </span>
            <omegaup-radio-switch
              name="basic-information"
              :readonly="readOnly"
              v-model:value="needsBasicInformation"
              :selected-value="needsBasicInformation"
            ></omegaup-radio-switch>
          </div>
          <div class="form-group col-md-4 introjs-ask-information">
            <span class="font-weight-bold"
              >{{ T.courseNewFormUserInformationRequired }}
              <font-awesome-icon
                :title="T.courseNewFormUserInformationRequiredDesc"
                icon="info-circle"
              />
            </span>
            <select
              v-model="requestsUserInformation"
              data-course-participant-information
              :disabled="readOnly"
              class="form-control"
            >
              <option value="no">
                {{ T.wordsNo }}
              </option>
              <option value="optional">
                {{ T.wordsOptional }}
              </option>
              <option value="required">
                {{ T.wordsRequired }}
              </option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="form-group col-md-6">
            <label class="font-weight-bold w-100"
              >{{ T.courseNewFormLevel }}
              <font-awesome-icon
                :title="T.courseNewFormLevelDesc"
                icon="info-circle"
              />
            </label>
            <select
              v-model="level"
              :disabled="readOnly"
              data-course-problem-level
              class="form-control introjs-level"
            >
              <option value="" disabled>
                {{ T.courseNewFormLevelPlaceholder }}
              </option>
              <option
                v-for="levelOption in levelOptions"
                :key="levelOption.value"
                :value="levelOption.value"
              >
                {{ levelOption.label }}
              </option>
            </select>
          </div>
          <div class="form-group col-md-6 introjs-language">
            <label class="font-weight-bold w-100">
              <span
                class="field-required"
                :class="{ 'is-complete': isLanguagesComplete }"
                >{{ T.wordsLanguages }}</span
              >
            </label>
            <div
              :class="{
                'is-invalid-wrapper': invalidParameterName === 'languages',
              }"
            >
              <vue-multiselect
                v-model="selectedLanguages"
                :disabled="readOnly"
                :options="Object.keys(allLanguages)"
                :multiple="true"
                :placeholder="T.courseNewFormLanguages"
                :close-on-select="false"
                @select="onSelect"
              >
              </vue-multiselect>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="form-group container-fluid col-md-6">
            <label class="font-weight-bold w-100 introjs-objective"
              >{{ T.courseNewFormObjective }}
              <font-awesome-icon
                :title="T.courseNewFormObjectiveDesc"
                icon="info-circle"
              />
              <textarea
                v-model="objective"
                :disabled="readOnly"
                data-course-objective
                class="form-control"
                :class="{
                  'is-invalid': invalidParameterName === 'objective',
                }"
                cols="30"
                rows="5"
                :maxlength="MAX_LENGTH.objective"
              ></textarea>
            </label>
            <small
              class="character-counter"
              :class="{ 'text-danger': isExceedingObjective }"
              >{{ (objective || '').length }}/{{ MAX_LENGTH.objective }}</small
            >
          </div>
          <div class="form-group container-fluid col-md-6">
            <label class="font-weight-bold w-100 introjs-description">
              <span
                class="field-required"
                :class="{ 'is-complete': isDescriptionComplete }"
                >{{ T.courseNewFormDescription }}</span
              >
              <textarea
                v-model="description"
                :disabled="readOnly"
                data-course-new-description
                class="form-control"
                :class="{
                  'is-invalid': invalidParameterName === 'description',
                }"
                cols="30"
                rows="5"
                required="required"
                :maxlength="MAX_LENGTH.description"
              ></textarea>
            </label>
            <small
              class="character-counter"
              :class="{ 'text-danger': isExceedingDescription }"
              >{{ description.length }}/{{ MAX_LENGTH.description }}</small
            >
          </div>
        </div>
        <div v-if="!readOnly" class="row">
          <div class="form-group col-md-12 text-right">
            <button
              class="btn btn-primary mr-2 submit introjs-submit"
              type="submit"
            >
              <template v-if="update">
                {{ T.courseNewFormUpdateCourse }}
              </template>
              <template v-else>
                {{ T.courseNewFormScheduleCourse }}
              </template>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, PropType } from 'vue';
import { types, messages } from '../../api_types';
import T from '../../lang';
import common_Typeahead from '../common/Typeahead.vue';
import DatePicker from '../DatePicker.vue';
import omegaup_RadioSwitch from '../RadioSwitch.vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import 'intro.js/introjs.css';
import introJs from 'intro.js';
import { getCookie, setCookie } from '../../cookies';

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const levelOptions = [
  {
    value: 'introductory',
    label: T.courseLevelIntroductory,
  },
  {
    value: 'intermediate',
    label: T.courseLevelIntermediate,
  },
  {
    value: 'advanced',
    label: T.courseLevelAdvanced,
  },
];

const MAX_LENGTH = {
  name: 100,
  alias: 32,
  description: 255,
  objective: 500,
};

const DANGER_THRESHOLD_PERCENTAGE = 0.9;

export default defineComponent({
  name: 'CourseDetails',
  components: {
    'omegaup-common-typeahead': common_Typeahead,
    'omegaup-datepicker': DatePicker,
    'omegaup-radio-switch': omegaup_RadioSwitch,
    'font-awesome-icon': FontAwesomeIcon,
    'font-awesome-layers': FontAwesomeLayers,
    'font-awesome-layers-text': FontAwesomeLayersText,
    'vue-multiselect': Multiselect,
  },
  props: {
    update: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    course: { type: Object as PropType<types.CourseDetails>, required: true },
    invalidParameterName: { type: String, default: '' },
    allLanguages: { type: Array as PropType<string[]>, required: true },
    searchResultSchools: {
      type: Array as PropType<types.SchoolListItem[]>,
      required: true,
    },
    hasVisitedSection: { type: Boolean, default: true },
  },
  emits: [
    'submit',
    'emit-cancel',
    'update-search-result-schools',
    'invalid-languages',
    'clear-language-error',
  ],
  setup(props, { emit }) {
    const alias = ref(props.course.alias);
    const description = ref(props.course.description);
    const finishTime = ref(props.course.finish_time || new Date());
    const showScoreboard = ref(props.course.show_scoreboard);
    const startTime = ref(props.course.start_time);
    const name = ref(props.course.name);
    const level = ref(props.course.level ?? '');
    const objective = ref(props.course.objective);
    const school = ref<null | types.SchoolListItem>(
      props.searchResultSchools[0] ?? null,
    );
    const needsBasicInformation = ref(props.course.needs_basic_information);
    const requestsUserInformation = ref(
      props.course.requests_user_information,
    );
    const unlimitedDuration = ref(props.course.finish_time === null);
    const selectedLanguages = ref(props.course.languages);

    const isNameComplete = computed(
      (): boolean => name.value !== null && name.value.trim().length > 0,
    );

    const isAliasComplete = computed(
      (): boolean => alias.value !== null && alias.value.trim().length > 0,
    );

    const isSchoolComplete = computed(
      (): boolean => school.value !== null && school.value.key !== undefined,
    );

    const isLanguagesComplete = computed(
      (): boolean => (selectedLanguages.value?.length ?? 0) > 0,
    );

    const isDescriptionComplete = computed(
      (): boolean =>
        description.value !== null && description.value.trim().length > 0,
    );

    const isExceedingName = computed(
      (): boolean =>
        name.value.length > MAX_LENGTH.name * DANGER_THRESHOLD_PERCENTAGE,
    );

    const isExceedingAlias = computed(
      (): boolean =>
        alias.value.length > MAX_LENGTH.alias * DANGER_THRESHOLD_PERCENTAGE,
    );

    const isExceedingDescription = computed(
      (): boolean =>
        description.value.length >
        MAX_LENGTH.description * DANGER_THRESHOLD_PERCENTAGE,
    );

    const isExceedingObjective = computed(
      (): boolean =>
        (objective.value || '').length >
        MAX_LENGTH.objective * DANGER_THRESHOLD_PERCENTAGE,
    );

    function reset(): void {
      alias.value = props.course.alias;
      description.value = props.course.description;
      finishTime.value = props.course.finish_time || new Date();
      showScoreboard.value = props.course.show_scoreboard;
      startTime.value = props.course.start_time;
      name.value = props.course.name;
      school.value = props.searchResultSchools[0];
      needsBasicInformation.value = props.course.needs_basic_information;
      requestsUserInformation.value = props.course.requests_user_information;
      unlimitedDuration.value = props.course.finish_time === null;
    }

    function onSubmit(): void {
      if (!selectedLanguages.value || selectedLanguages.value.length === 0) {
        emit('invalid-languages');
        return;
      }
      const request: messages.CourseUpdateRequest = {
        name: name.value,
        description: description.value,
        objective: objective.value,
        start_time: startTime.value,
        alias: alias.value,
        languages: selectedLanguages.value,
        show_scoreboard: showScoreboard.value,
        needs_basic_information: needsBasicInformation.value,
        requests_user_information: requestsUserInformation.value,
        school: school.value,
        unlimited_duration: unlimitedDuration.value,
        finish_time: !unlimitedDuration.value
          ? new Date(finishTime.value).setHours(23, 59, 59, 999) / 1000
          : null,
      };
      if (level.value) {
        request.level = level.value;
      }
      emit('submit', request);
    }

    function onSelect(): void {
      emit('clear-language-error');
    }

    function onCancel(): void {
      reset();
      emit('emit-cancel');
    }

    onMounted(() => {
      const title = T.createCourseInteractiveGuideTitle;
      if (!props.hasVisitedSection) {
        introJs()
          .setOptions({
            nextLabel: T.interactiveGuideNextButton,
            prevLabel: T.interactiveGuidePreviousButton,
            doneLabel: T.interactiveGuideDoneButton,
            steps: [
              {
                title,
                intro: T.createCourseInteractiveGuideWelcome,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-course-name',
                ),
                title,
                intro: T.createCourseInteractiveGuideName,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-short-title',
                ),
                title,
                intro: T.createCourseInteractiveGuideShortTitle,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-scoreboard',
                ),
                title,
                intro: T.createCourseInteractiveGuideScoreboard,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-start-date',
                ),
                title,
                intro: T.createCourseInteractiveGuideStartDate,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-duration',
                ),
                title,
                intro: T.createCourseInteractiveGuideDuration,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-end-date',
                ),
                title,
                intro: T.createCourseInteractiveGuideEndDate,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-school',
                ),
                title,
                intro: T.createCourseInteractiveGuideSchool,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-basic-information',
                ),
                title,
                intro: T.createCourseInteractiveGuideBasicInformation,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-ask-information',
                ),
                title,
                intro: T.createCourseInteractiveGuideAskInformation,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-level',
                ),
                title,
                intro: T.createCourseInteractiveGuideLevel,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-language',
                ),
                title,
                intro: T.createCourseInteractiveGuideLanguage,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-objective',
                ),
                title,
                intro: T.createCourseInteractiveGuideObjective,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-description',
                ),
                title,
                intro: T.createCourseInteractiveGuideDescription,
              },
              {
                element: document.querySelector<HTMLElement>(
                  '.introjs-submit',
                ),
                title,
                intro: T.createCourseInteractiveGuideSubmit,
              },
            ],
          })
          .start();
        setCookie('has-visited-create-course', true);
      }
    });

    return {
      T,
      alias,
      description,
      finishTime,
      showScoreboard,
      startTime,
      name,
      level,
      objective,
      school,
      needsBasicInformation,
      requestsUserInformation,
      unlimitedDuration,
      selectedLanguages,
      levelOptions,
      MAX_LENGTH,
      isNameComplete,
      isAliasComplete,
      isSchoolComplete,
      isLanguagesComplete,
      isDescriptionComplete,
      isExceedingName,
      isExceedingAlias,
      isExceedingDescription,
      isExceedingObjective,
      onSubmit,
      onSelect,
      onCancel,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
@import '../../../../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css';

.multiselect__tag {
  background: var(--multiselect-tag-background-color);
}

/* stylelint-disable-next-line selector-pseudo-element-no-unknown */
.is-invalid-wrapper :deep(.multiselect__tags) {
  border-color: var(--form-input-error-color);
}

/* stylelint-disable-next-line selector-pseudo-element-no-unknown */
.is-invalid-school :deep(.tags-input-wrapper-default) {
  border-color: var(--form-input-error-color);
}

.character-counter {
  display: block;
  text-align: right;
  color: var(--form-character-counter-color, #6c757d);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
</style>

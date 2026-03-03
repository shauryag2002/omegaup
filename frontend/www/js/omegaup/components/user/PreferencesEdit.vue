<template>
  <form role="form" class="card-body" @submit.prevent="onUpdateUserPreferences">
    <div class="form-group">
      <label>{{ T.userEditProfileImage }}</label>
      <a :href="GravatarURL" target="_blank" data-email class="btn btn-link">
        {{ T.userEditGravatar }} {{ email }}
      </a>
    </div>
    <div class="form-group">
      <label>{{ T.userEditLanguage }}</label>
      <select
        v-model="locale"
        data-locale
        data-preference-language
        class="custom-select"
      >
        <option value="es">{{ T.wordsSpanish }}</option>
        <option value="en">{{ T.wordsEnglish }}</option>
        <option value="pt">{{ T.wordsPortuguese }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>{{ T.userEditPreferredProgrammingLanguage }}</label>
      <select
        v-model="preferredLanguage"
        data-preferred-language
        class="custom-select"
      >
        <option value=""></option>
        <option
          v-for="[extension, name] in Object.entries(programmingLanguages)"
          :key="extension"
          :value="extension"
        >
          {{ name }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label>{{ T.userObjectivesModalDescriptionUsage }}</label>
      <select
        v-model="learningTeachingObjective"
        data-learning-teaching-objective
        class="custom-select"
      >
        <option :value="ObjectivesAnswers.Learning">
          {{ T.userObjectivesModalAnswerLearning }}
        </option>
        <option :value="ObjectivesAnswers.Teaching">
          {{ T.userObjectivesModalAnswerTeaching }}
        </option>
        <option :value="ObjectivesAnswers.LearningAndTeaching">
          {{ T.userObjectivesModalAnswerLearningAndTeaching }}
        </option>
        <option :value="ObjectivesAnswers.None">
          {{ T.userObjectivesModalAnswerNone }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label>{{ scholarCompetitiveObjectiveQuestion }}</label>
      <select
        v-model="scholarCompetitiveObjective"
        :disabled="learningTeachingObjective === ObjectivesAnswers.None"
        data-scholar-competitive-objective
        class="custom-select"
      >
        <option :value="ObjectivesAnswers.Scholar">
          {{ T.userObjectivesModalAnswerScholar }}
        </option>
        <option :value="ObjectivesAnswers.Competitive">
          {{ T.userObjectivesModalAnswerCompetitive }}
        </option>
        <option :value="ObjectivesAnswers.ScholarAndCompetitive">
          {{ T.userObjectivesModalAnswerScholarAndCompetitive }}
        </option>
        <option :value="ObjectivesAnswers.Other">
          {{ T.userObjectivesModalAnswerOther }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label>
        <input
          v-model="isPrivate"
          type="checkbox"
          :checked="isPrivate"
          data-is-private
          class="mr-2"
          @change="handlePrivateProfileCheckboxChange"
        />{{ T.userEditPrivateProfile }}
      </label>
      <!-- id-lint off -->
      <b-button
        id="popover-private-profile"
        class="ml-1"
        size="sm"
        variant="none"
        @click="show = !show"
      >
        <font-awesome-icon :icon="['fas', 'question-circle']" />
      </b-button>
      <!-- id-lint on -->
      <b-popover
        v-model:show="show"
        target="popover-private-profile"
        variant="danger"
        placement="right"
      >
        <template #title>{{ T.profilePrivateRankMessageTitle }}</template>
        {{ T.profilePrivateRankMessage }}
      </b-popover>
    </div>
    <div class="form-group">
      <label>
        <input
          v-model="hideProblemTags"
          type="checkbox"
          :checked="hideProblemTags"
          data-hide-problem-tags
          class="mr-2"
        />{{ T.userEditHideProblemTags }}
      </label>
    </div>
    <div class="mt-3">
      <button
        type="submit"
        class="btn btn-primary mr-2"
        data-preference-save-button
      >
        {{ T.wordsSaveChanges }}
      </button>
      <a href="/profile/" class="btn btn-cancel">{{ T.wordsCancel }}</a>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { ObjectivesAnswers } from './ObjectivesQuestions.vue';
import { types } from '../../api_types';
import T from '../../lang';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getExternalUrl } from '../../urlHelper';

// Import Bootstrap and BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import { BButton, BPopover } from 'bootstrap-vue-next';

// Import Only Required Plugins

export default defineComponent({
  name: 'UserPreferencesEdit',
  components: {
    FontAwesomeIcon,
  },
  props: {
    profile: {
      type: Object as PropType<types.UserProfileInfo>,
      required: true,
    },
  },
  emits: ['update-user-preferences'],
  setup(props, { emit }) {
    const show = ref(false);
    const email = ref(props.profile.email);
    const locale = ref(props.profile.locale);
    const preferredLanguage = ref(props.profile.preferred_language);
    const programmingLanguages = ref(props.profile.programming_languages);
    const isPrivate = ref(props.profile.is_private);
    const hideProblemTags = ref(props.profile.hide_problem_tags);
    const hasCompetitiveObjective = ref(
      props.profile.has_competitive_objective ?? false,
    );
    const hasLearningObjective = ref(
      props.profile.has_learning_objective ?? true,
    );
    const hasScholarObjective = ref(
      props.profile.has_scholar_objective ?? true,
    );
    const hasTeachingObjective = ref(
      props.profile.has_teaching_objective ?? false,
    );

    const scholarCompetitiveObjectiveQuestion = computed((): string => {
      if (hasLearningObjective.value && hasTeachingObjective.value) {
        return T.userObjectivesModalDescriptionLearningAndTeaching;
      }
      if (hasLearningObjective.value) {
        return T.userObjectivesModalDescriptionLearning;
      }
      if (hasTeachingObjective.value) {
        return T.userObjectivesModalDescriptionTeaching;
      }
      return T.userObjectivesModalDescriptionUsage;
    });

    const GravatarURL = computed((): string => {
      return getExternalUrl('GravatarURL');
    });

    const learningTeachingObjective = computed({
      get: (): string => {
        if (hasLearningObjective.value && hasTeachingObjective.value) {
          return ObjectivesAnswers.LearningAndTeaching;
        }
        if (hasLearningObjective.value) {
          return ObjectivesAnswers.Learning;
        }
        if (hasTeachingObjective.value) {
          return ObjectivesAnswers.Teaching;
        }
        return ObjectivesAnswers.None;
      },
      set: (newValue: string) => {
        switch (newValue) {
          case ObjectivesAnswers.Learning:
            hasLearningObjective.value = true;
            hasTeachingObjective.value = false;
            break;
          case ObjectivesAnswers.Teaching:
            hasLearningObjective.value = false;
            hasTeachingObjective.value = true;
            break;
          case ObjectivesAnswers.LearningAndTeaching:
            hasLearningObjective.value = true;
            hasTeachingObjective.value = true;
            break;
          case ObjectivesAnswers.None:
            hasLearningObjective.value = false;
            hasTeachingObjective.value = false;
            hasScholarObjective.value = false;
            hasCompetitiveObjective.value = false;
            break;
        }
      },
    });

    const scholarCompetitiveObjective = computed({
      get: (): string => {
        if (hasCompetitiveObjective.value && hasScholarObjective.value) {
          return ObjectivesAnswers.ScholarAndCompetitive;
        }
        if (hasCompetitiveObjective.value) {
          return ObjectivesAnswers.Competitive;
        }
        if (hasScholarObjective.value) {
          return ObjectivesAnswers.Scholar;
        }
        return ObjectivesAnswers.Other;
      },
      set: (newValue: string) => {
        switch (newValue) {
          case ObjectivesAnswers.Scholar:
            hasScholarObjective.value = true;
            hasCompetitiveObjective.value = false;
            break;
          case ObjectivesAnswers.Competitive:
            hasScholarObjective.value = false;
            hasCompetitiveObjective.value = true;
            break;
          case ObjectivesAnswers.ScholarAndCompetitive:
            hasScholarObjective.value = true;
            hasCompetitiveObjective.value = true;
            break;
          case ObjectivesAnswers.Other:
            hasScholarObjective.value = false;
            hasCompetitiveObjective.value = false;
            break;
        }
      },
    });

    function onUpdateUserPreferences(): void {
      emit('update-user-preferences', {
        userPreferences: {
          locale: locale.value,
          preferred_language: preferredLanguage.value ?? null,
          is_private: isPrivate.value,
          hide_problem_tags: hideProblemTags.value,
          has_competitive_objective: hasCompetitiveObjective.value,
          has_learning_objective: hasLearningObjective.value,
          has_scholar_objective: hasScholarObjective.value,
          has_teaching_objective: hasTeachingObjective.value,
        },
        localeChanged: locale.value != props.profile.locale,
      });
    }

    function handlePrivateProfileCheckboxChange(): void {
      show.value = isPrivate.value;
    }

    return {
      T,
      ObjectivesAnswers,
      show,
      email,
      locale,
      preferredLanguage,
      programmingLanguages,
      isPrivate,
      hideProblemTags,
      scholarCompetitiveObjectiveQuestion,
      GravatarURL,
      learningTeachingObjective,
      scholarCompetitiveObjective,
      onUpdateUserPreferences,
      handlePrivateProfileCheckboxChange,
    };
  },
});
</script>

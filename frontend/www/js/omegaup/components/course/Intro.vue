<template>
  <div>
    <div class="card-header pb-4 px-5 pt-5">
      <h2 class="text-center mb-4">{{ course.name }}</h2>
      <OmegaupMarkdown
        :full-width="true"
        :markdown="course.description"
      ></OmegaupMarkdown>
      <!-- TODO: Here goes the estimated time for course -->
      <p v-if="course.level" class="text-center course-level">
        {{
          ui.formatString(T.courseIntroLevel, { level: levels[course.level] })
        }}
      </p>
      <template v-if="displayCoursePrivacyBullets">
        <OmegaupMarkdown
          :markdown="T.coursePrivacyConsent"
          :full-width="true"
          class="font-weight-bold h5"
        ></OmegaupMarkdown>
        <OmegaupMarkdown
          v-if="needsBasicInformation"
          :markdown="T.courseBasicInformationNeeded"
          :full-width="true"
        ></OmegaupMarkdown>
        <template v-if="course.requests_user_information != 'no'">
          <OmegaupMarkdown
            :markdown="statements.privacy.markdown || ''"
            :full-width="true"
          ></OmegaupMarkdown>
          <OmegaupRadioSwitch
            v-model:value="shareUserInformation"
            :selected-value="shareUserInformation"
            class="align-to-markdown ml-5 mb-3"
          ></OmegaupRadioSwitch>
        </template>

        <template v-if="shouldShowAcceptTeacher">
          <OmegaupMarkdown
            :markdown="statements.acceptTeacher.markdown || ''"
            :full-width="true"
          ></OmegaupMarkdown>
          <OmegaupRadioSwitch
            v-model:value="acceptTeacher"
            :selected-value="acceptTeacher"
            name="accept-teacher"
            class="align-to-markdown ml-5"
          ></OmegaupRadioSwitch>
        </template>
      </template>
      <div class="text-center mt-3">
        <template v-if="loggedIn">
          <form
            v-if="
              userRegistrationRequested === null || userRegistrationAccepted
            "
            @submit.prevent="onSubmit"
          >
            <button
              class="btn btn-primary btn-lg"
              name="start-course-submit"
              type="submit"
              :disabled="isButtonDisabled"
            >
              {{ T.startCourse }}
            </button>
          </form>
          <form
            v-else-if="!userRegistrationRequested"
            class="text-center"
            @submit.prevent="onRequestAccess"
          >
            <OmegaupMarkdown
              :markdown="T.mustRegisterToJoinCourse"
              :full-width="true"
            ></OmegaupMarkdown>
            <button type="submit" class="btn btn-primary btn-lg">
              {{ T.registerForCourse }}
            </button>
          </form>
          <OmegaupMarkdown
            v-else-if="!userRegistrationAnswered"
            :markdown="T.registrationPendingCourse"
            :full-width="true"
          ></OmegaupMarkdown>
          <OmegaupMarkdown
            v-else
            :markdown="T.registrationDenied"
            :full-width="true"
          ></OmegaupMarkdown>
        </template>
        <a
          v-else
          class="btn btn-primary"
          role="button"
          :href="`/login/?redirect=${encodeURIComponent(
            windowRef.location.pathname,
          )}`"
          >{{ T.loginLogIn }}</a
        >
      </div>
    </div>
    <div class="mt-4">
      <div v-if="course.objective" class="mb-4">
        <h5 class="intro-subtitle pb-1">{{ T.courseIntroWhatYouWillLearn }}</h5>
        <OmegaupMarkdown
          :markdown="course.objective"
          :full-width="true"
        ></OmegaupMarkdown>
      </div>
      <div v-if="course.school_id && course.school_name">
        <h5 class="intro-subtitle pb-1 mb-2">{{ T.courseIntroImpartedBy }}</h5>
        {{ course.school_name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import T from '../../lang';
import * as ui from '../../ui';
import { types } from '../../api_types';

import OmegaupMarkdown from '../Markdown.vue';
import OmegaupRadioSwitch from '../RadioSwitch.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faChalkboardTeacher,
  faFileAlt,
  faListAlt,
} from '@fortawesome/free-solid-svg-icons';
library.add(faChalkboardTeacher, faFileAlt, faListAlt);

const levels: Record<string, string> = {
  introductory: T.courseLevelIntroductory,
  intermediate: T.courseLevelIntermediate,
  advanced: T.courseLevelAdvanced,
};

interface Statement {
  [name: string]: {
    gitObjectId?: string;
    markdown?: string;
    statementType?: string;
  };
}

const props = withDefaults(
  defineProps<{
    course: types.CourseDetails;
    needsBasicInformation: boolean;
    shouldShowAcceptTeacher: boolean;
    statements: Statement;
    userRegistrationRequested: boolean | null;
    userRegistrationAnswered: boolean | null;
    userRegistrationAccepted: boolean | null;
    loggedIn: boolean;
  }>(),
  {
    userRegistrationRequested: null,
    userRegistrationAnswered: null,
    userRegistrationAccepted: null,
  },
);

const emit = defineEmits<{
  (
    e: 'submit',
    payload: {
      shareUserInformation: boolean;
      acceptTeacher: boolean;
    },
  ): void;
  (
    e: 'request-access-course',
    payload: {
      shareUserInformation: boolean;
      acceptTeacher: boolean;
    },
  ): void;
}>();

const shareUserInformation = ref(false);
const acceptTeacher = ref(false);
const windowRef = window;

const isButtonDisabled = computed((): boolean => {
  return (
    props.needsBasicInformation ||
    (props.course.requests_user_information === 'required' &&
      !shareUserInformation.value)
  );
});

const displayCoursePrivacyBullets = computed((): boolean => {
  return (
    (props.userRegistrationAccepted ||
      props.userRegistrationRequested === false) &&
    (props.needsBasicInformation ||
      props.course.requests_user_information != 'no' ||
      props.shouldShowAcceptTeacher)
  );
});

function onSubmit(): void {
  emit('submit', {
    shareUserInformation: shareUserInformation.value,
    acceptTeacher: acceptTeacher.value,
  });
}

function onRequestAccess(): void {
  emit('request-access-course', {
    shareUserInformation: shareUserInformation.value,
    acceptTeacher: acceptTeacher.value,
  });
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
.course-level {
  color: $omegaup-pink;
}

h5.intro-subtitle {
  color: $omegaup-grey;
  width: 20rem;
  border-bottom: 4px solid $omegaup-primary--accent;
}
</style>

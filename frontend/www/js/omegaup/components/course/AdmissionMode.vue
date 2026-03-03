<template>
  <div class="card">
    <div class="card-body">
      <form
        class="publish-form"
        data-course-admission-mode-form
        @submit.prevent="onSubmit"
      >
        <div class="form-group">
          <label>{{ T.courseEditAdmissionModeSelect }}</label>
          <a
            data-toggle="tooltip"
            rel="tooltip"
            :title="T.courseEditAdmissionModeDescription"
          >
            <img
              src="/media/question.png"
              :alt="T.courseEditAdmissionModeDescription"
            />
          </a>
          <div class="form-group">
            <select
              v-model="currentAdmissionMode"
              class="form-control"
              name="admission-mode"
            >
              <option :value="AdmissionMode.Private">
                {{ T.admissionModeManualOnly }}
              </option>
              <option :value="AdmissionMode.Registration">
                {{ T.admissionModeShareURL }}
              </option>
              <option :value="AdmissionMode.Public">
                {{ T.admissionModePublic }}
              </option>
            </select>
          </div>
          <div
            v-if="
              currentAdmissionMode === AdmissionMode.Registration ||
              currentAdmissionMode === AdmissionMode.Public
            "
            class="form-group"
          >
            <input
              class="form-control mb-2 mt-2"
              type="text"
              readonly
              :value="courseURL"
            />
            <div class="form-inline">
              <button
                class="btn btn-primary"
                type="button"
                @click="copyAndNotify(courseURL)"
              >
                {{ T.wordsCopyToClipboard }}
              </button>
              <span v-if="copiedToClipboard === true" class="ml-3">
                <font-awesome-icon
                  icon="check-circle"
                  size="2x"
                  :style="{ color: 'green' }"
                />
                {{ T.passwordResetLinkCopiedToClipboard }}
              </span>
            </div>
          </div>
          <div
            v-if="currentAdmissionMode === AdmissionMode.Public"
            class="form-group"
            data-toggle-public-course-list
          >
            <omegaup-toggle-switch
              v-if="shouldShowPublicOption"
              v-model:value="currentShowInPublicCoursesList"
              :checked-value="currentShowInPublicCoursesList"
              :text-description="T.courseEditShowInPublicCoursesList"
            ></omegaup-toggle-switch>
            <omegaup-markdown
              v-else
              :markdown="T.courseEditRequestSetRecommendedCourse"
            ></omegaup-markdown>
          </div>
        </div>
        <div class="text-right">
          <button class="btn btn-primary change-admission-mode" type="submit">
            {{ T.wordsSaveChanges }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import T from '../../lang';
import omegaup_Markdown from '../Markdown.vue';
import omegaup_ToggleSwitch from '../ToggleSwitch.vue';
import { AdmissionMode } from '../common/Publish.vue';

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

export default defineComponent({
  name: 'CourseAdmissionMode',
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    'font-awesome-layers': FontAwesomeLayers,
    'font-awesome-layers-text': FontAwesomeLayersText,
    'omegaup-markdown': omegaup_Markdown,
    'omegaup-toggle-switch': omegaup_ToggleSwitch,
  },
  props: {
    admissionMode: { type: String as PropType<AdmissionMode>, required: true },
    courseAlias: { type: String, required: true },
    shouldShowPublicOption: { type: Boolean, required: true },
    showInPublicCoursesList: { type: Boolean, default: false },
  },
  emits: ['update-admission-mode'],
  setup(props, { emit }) {
    const currentAdmissionMode = ref(props.admissionMode);
    const currentShowInPublicCoursesList = ref(props.showInPublicCoursesList);
    const copiedToClipboard = ref(false);

    const courseURL = computed(
      (): string => `${window.location.origin}/course/${props.courseAlias}/`,
    );

    function onSubmit(): void {
      emit('update-admission-mode', {
        admissionMode: currentAdmissionMode.value,
        showInPublicCoursesList: currentShowInPublicCoursesList.value,
      });
    }

    function copyAndNotify(text: string): void {
      navigator.clipboard.writeText(text);
      copiedToClipboard.value = true;
    }

    watch(copiedToClipboard, () => {
      setTimeout(() => (copiedToClipboard.value = false), 5000);
    });

    watch(
      () => props.admissionMode,
      () => {
        currentAdmissionMode.value = props.admissionMode;
      },
    );

    return {
      T,
      AdmissionMode,
      currentAdmissionMode,
      currentShowInPublicCoursesList,
      copiedToClipboard,
      courseURL,
      onSubmit,
      copyAndNotify,
    };
  },
});
</script>

<template>
  <div class="card">
    <div class="card-body">
      <form class="form" @submit.prevent="onSubmit">
        <div class="form-group">
          <div class="input-group m-2">
            <input
              class="form-control"
              type="text"
              readonly
              :value="contestURL"
            />
            <div class="input-group-append">
              <button
                copy-to-clipboard
                class="btn btn-primary"
                type="button"
                :title="T.contestEditCopyContestLink"
                @click="copyAndNotify(contestURL)"
              >
                <font-awesome-icon icon="clipboard" />
              </button>
            </div>
          </div>

          <label>{{ T.contestNewFormAdmissionMode }}</label>
          <select
            v-model="currentAdmissionMode"
            class="form-control"
            name="admission-mode"
          >
            <option :value="AdmissionMode.Private">
              {{ T.wordsPrivate }}
            </option>
            <option :value="AdmissionMode.Registration">
              {{ T.wordsRegistration }}
            </option>
            <option v-if="shouldShowPublicOption" :value="AdmissionMode.Public">
              {{ T.wordsPublic }}
            </option>
          </select>
          <p class="form-text text-muted">
            <omegaup-markdown
              :markdown="admissionModeDescription"
            ></omegaup-markdown>
          </p>
        </div>
        <div class="form-group">
          <omegaup-toggle-switch
            v-if="currentAdmissionMode !== AdmissionMode.Private"
            v-model:value="currentDefaultShowAllContestantsInScoreboard"
            :checked-value="currentDefaultShowAllContestantsInScoreboard"
            :text-description="T.showDefaultAllContestantsInScoreboard"
          ></omegaup-toggle-switch>
        </div>
        <button class="btn btn-primary change-admission-mode" type="submit">
          {{ T.wordsSaveChanges }}
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import T from '../../lang';
import omegaup_Markdown from '../Markdown.vue';
import omegaup_ToggleSwitch from '../ToggleSwitch.vue';
import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

export enum AdmissionMode {
  Private = 'private',
  Registration = 'registration',
  Public = 'public',
}

export default defineComponent({
  name: 'ContestEditPublish',
  components: {
    'omegaup-markdown': omegaup_Markdown,
    'omegaup-toggle-switch': omegaup_ToggleSwitch,
    'font-awesome-icon': FontAwesomeIcon,
    'font-awesome-layers': FontAwesomeLayers,
    'font-awesome-layers-text': FontAwesomeLayersText,
  },
  props: {
    admissionMode: { type: String as PropType<AdmissionMode>, required: true },
    admissionModeDescription: { type: String, required: true },
    alias: { type: String, required: true },
    shouldShowPublicOption: { type: Boolean, required: true },
    defaultShowAllContestantsInScoreboard: { type: Boolean, default: false },
  },
  emits: ['update-admission-mode', 'show-copy-message'],
  setup(props, { emit }) {
    const currentAdmissionMode = ref(props.admissionMode);
    const currentDefaultShowAllContestantsInScoreboard = ref(
      props.defaultShowAllContestantsInScoreboard,
    );

    const contestURL = computed(
      (): string =>
        `${window.location.origin}/arena/${props.alias}/startfresh/`,
    );

    function onSubmit(): void {
      emit('update-admission-mode', {
        admissionMode: currentAdmissionMode.value,
        defaultShowAllContestantsInScoreboard:
          currentDefaultShowAllContestantsInScoreboard.value,
      });
    }

    function copyAndNotify(text: string): void {
      navigator.clipboard.writeText(text);
      emit('show-copy-message');
    }

    function onCopyContestLink(): void {
      emit('show-copy-message');
    }

    watch(
      () => props.admissionMode,
      (newValue: AdmissionMode) => {
        currentAdmissionMode.value = newValue;
      },
    );

    return {
      T,
      AdmissionMode,
      currentAdmissionMode,
      currentDefaultShowAllContestantsInScoreboard,
      contestURL,
      onSubmit,
      copyAndNotify,
      onCopyContestLink,
    };
  },
});
</script>

<template>
  <div>
    <div v-if="generalFeedback" data-submission-feedback>
      <h3>{{ T.feedbackTitle }}</h3>
      <pre data-run-feedback><code>{{ generalFeedback.feedback }}</code></pre>
      {{
        ui.formatString(T.feedbackLeftBy, {
          date: time.formatDate(generalFeedback.date),
        })
      }}
      <OmegaupUserUsername
        :username="generalFeedback.author"
        :classname="generalFeedback.author_classname"
        :linkify="true"
      />
    </div>
    <div v-if="isAdmin" class="feedback-section">
      <a
        data-run-leave-feedback-button
        role="button"
        class="btn btn-sm btn-primary"
        @click="showFeedbackForm = !showFeedbackForm"
        >{{ T.submissionFeedbackSendButton }}</a
      >
      <div v-show="showFeedbackForm" class="form-group">
        <p>{{ T.submissionFeedbackAnimationButton }}</p>
        <img
          v-show="showFeedbackForm"
          src="/media/submission_feedback_demo.gif"
          :alt="T.submissionFeedbackDemoAlt"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import * as ui from '../../ui';
import * as time from '../../time';

import OmegaupUserUsername from '../user/Username.vue';

const props = withDefaults(
  defineProps<{
    guid: string;
    isAdmin?: boolean;
    feedbackOptions?: types.SubmissionFeedback[];
  }>(),
  {
    isAdmin: false,
    feedbackOptions: () => [],
  },
);

const showFeedbackForm = ref(false);

const generalFeedback = computed((): null | types.SubmissionFeedback => {
  if (!props.feedbackOptions.length) return null;
  const [feedback] = props.feedbackOptions.filter(
    (feedback) => feedback.range_bytes_start == null,
  );
  return feedback;
});

const feedback = ref(generalFeedback.value?.feedback ?? null);
</script>

<style lang="scss">
@import '../../../../sass/main.scss';
.feedback-section {
  margin-top: 1.5em;
  .form-group {
    margin-top: 0.5em;
    button {
      margin-top: 1em;
    }
  }
}
</style>

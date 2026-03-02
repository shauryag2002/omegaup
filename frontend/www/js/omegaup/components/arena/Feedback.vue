<template>
  <div class="card">
    <div class="card-header">
      <template v-if="!saved">
        {{ T.runDetailsNewFeedback }}
      </template>
      <template v-else>
        <OmegaupUserUsername
          :classname="feedback.authorClassname"
          :username="feedback.author"
          :linkify="true"
        />
        {{ currentFeedbackTimestamp }}
      </template>
      <button
        v-if="currentFeedback.status === FeedbackStatus.InProgress"
        class="close btn-sm"
        type="button"
        @click.prevent="onDeleteFeedback"
      >
        ❌
      </button>
    </div>
    <div class="card-body">
      <textarea
        v-if="!saved"
        ref="feedbackFormRef"
        v-model="currentFeedback.text"
        :placeholder="T.runDetailsFeedbackPlaceholder"
        class="w-100"
      ></textarea>
      <OmegaupMarkdown
        v-else
        :markdown="currentFeedback.text"
        :full-width="true"
      />
    </div>
    <div v-if="!saved" class="card-footer text-muted">
      <div class="form-group my-2">
        <button
          data-button-submit
          :disabled="!currentFeedback.text"
          class="btn btn-primary mx-2"
          @click.prevent="onSubmitFeedback"
        >
          {{ T.runDetailsFeedbackAddReview }}
        </button>
        <button
          data-button-cancel
          class="btn btn-danger mx-2"
          @click.prevent="onCancelFeedback"
        >
          {{ T.runDetailsFeedbackCancel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export enum FeedbackStatus {
  New = 'New',
  InProgress = 'InProgress',
  Saved = 'Saved',
  Updated = 'Updated',
  Deleted = 'Deleted',
}

export interface ArenaCourseFeedback {
  author?: string;
  authorClassname?: string;
  lineNumber: number;
  text: null | string;
  status: FeedbackStatus;
  timestamp?: Date;
  submissionFeedbackId?: number;
}
export default {};
</script>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import T from '../../lang';
import * as time from '../../time';
import OmegaupUserUsername from '../user/Username.vue';
import OmegaupMarkdown from '../Markdown.vue';

const props = defineProps<{
  feedback: ArenaCourseFeedback;
}>();

const emit = defineEmits<{
  (e: 'submit', feedback: ArenaCourseFeedback): void;
  (e: 'cancel'): void;
  (e: 'delete', feedback: ArenaCourseFeedback): void;
}>();

const feedbackFormRef = ref<HTMLTextAreaElement | null>(null);
const saved = ref(props.feedback.status === FeedbackStatus.Saved);
const currentFeedback = ref(props.feedback);

const currentFeedbackTimestamp = computed((): string => {
  return time.formatDateTimeLocal(props.feedback.timestamp ?? new Date());
});

onMounted(() => {
  if (props.feedback.status === FeedbackStatus.Saved) return;
  nextTick(() => feedbackFormRef.value?.focus());
});

function onSubmitFeedback(): void {
  saved.value = true;
  currentFeedback.value.status = FeedbackStatus.InProgress;
  emit('submit', currentFeedback.value);
}

function onCancelFeedback(): void {
  currentFeedback.value.text = null;
  emit('cancel');
}

function onDeleteFeedback(): void {
  currentFeedback.value.text = null;
  emit('delete', currentFeedback.value);
}
</script>

<template>
  <div v-if="!currentSaved" class="form-group" @keydown="onHandleKeyDown">
    <input
      v-if="!isSelectedNewFeedback"
      class="form-control"
      type="text"
      :placeholder="T.runDetailsFeedbackThreadPlaceholder"
      @click="isSelectedNewFeedback = true"
    />
    <div v-else class="card">
      <div class="card-header">
        <OmegaupUserUsername
          :classname="currentFeedbackThread.authorClassname"
          :username="currentFeedbackThread.author"
          :linkify="true"
        />
        <button
          class="close btn-sm"
          type="button"
          @click.prevent="onDeleteFeedbackThread"
        >
          ❌
        </button>
      </div>
      <div class="card-body">
        <textarea
          ref="feedbackThreadFormRef"
          v-model="currentFeedbackThread.text"
          :placeholder="T.runDetailsFeedbackThreadPlaceholder"
          class="w-100"
        ></textarea>
      </div>
      <div class="card-footer text-muted">
        <div class="form-group my-2">
          <button
            data-button-submit
            :disabled="!currentFeedbackThread.text"
            class="btn btn-primary mx-2"
            @click.prevent="onSubmitFeedback"
          >
            {{ T.runDetailsFeedbackAddReview }}
          </button>
          <button
            data-button-cancel
            class="btn btn-danger mx-2"
            @click.prevent="onDeleteFeedbackThread"
          >
            {{ T.runDetailsFeedbackCancel }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="card">
    <div class="card-header">
      <OmegaupUserUsername
        :classname="currentFeedbackThread.authorClassname"
        :username="currentFeedbackThread.author"
        :linkify="true"
      />
      {{ currentFeedbackThreadTimestamp }}
    </div>
    <div class="card-body">
      <OmegaupMarkdown
        :markdown="currentFeedbackThread.text"
        :full-width="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import T from '../../lang';
import OmegaupMarkdown from '../Markdown.vue';
import OmegaupUserUsername from '../user/Username.vue';
import * as time from '../../time';
import { ArenaCourseFeedback, FeedbackStatus } from './Feedback.vue';

const props = defineProps<{
  feedbackThread: ArenaCourseFeedback;
  saved?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', feedbackThread: ArenaCourseFeedback): void;
  (e: 'cancel'): void;
  (e: 'delete'): void;
}>();

const feedbackThreadFormRef = ref<HTMLElement | null>(null);

const currentSaved = ref(props.saved ?? false);
const currentFeedbackThread = ref(props.feedbackThread);
const isSelectedNewFeedback = ref(false);

const currentFeedbackThreadTimestamp = computed((): string => {
  return time.formatDateTimeLocal(
    currentFeedbackThread.value.timestamp ?? new Date(),
  );
});

function onHandleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    onDeleteFeedbackThread();
  }
}

function onSubmitFeedback(): void {
  currentSaved.value = true;
  emit('submit', currentFeedbackThread.value);
}

function onDeleteFeedbackThread(): void {
  currentFeedbackThread.value.text = '';
  isSelectedNewFeedback.value = false;
}

watch(isSelectedNewFeedback, (newValue: boolean) => {
  if (newValue) {
    nextTick(() =>
      (feedbackThreadFormRef.value as HTMLTextAreaElement)?.focus(),
    );
  }
});
</script>

<style>
.card {
  margin-bottom: 0.5rem;
}

.card-header {
  padding: 0.5rem 1.25rem;
}

.card-body {
  padding: 0.5rem 1.25rem;
}

[data-markdown-statement] p {
  margin-bottom: 0;
}
</style>

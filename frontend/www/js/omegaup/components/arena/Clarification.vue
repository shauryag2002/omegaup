<template>
  <tr
    :class="{
      resolved: clarification.answer,
      'direct-message': isDirectMessage,
      'border border-primary': selected,
    }"
  >
    <td class="column-info text-center align-middle">
      <span
        v-if="
          'assignment_alias' in clarification && clarification.assignment_alias
        "
      >
        <span class="font-weight-bold">{{ T.clarificationHomework }}</span>
        {{ clarification.assignment_alias }}
      </span>
      <span class="font-weight-bold">{{
        'contest_alias' in clarification && clarification.contest_alias
          ? T.clarificationContest
          : T.clarificationProblem
      }}</span>
      {{
        'contest_alias' in clarification && clarification.contest_alias
          ? clarification.contest_alias
          : clarification.problem_alias
      }}
      <span data-author>
        <span class="font-weight-bold">{{ T.clarificationsAskedBy }}</span>
        {{ clarificationAuthorReceiver }}
      </span>
      <span class="font-weight-bold">{{ T.clarificationTime }}</span>
      {{ time.formatDateTime(clarification.time) }}
    </td>

    <td class="column-message align-middle" data-form-clarification-message>
      <span class="text-monospace text-dark">{{ clarification.message }}</span>
    </td>
    <td
      v-if="isAdmin"
      class="column-answer align-middle"
      data-form-clarification-resolved-answer
    >
      <template v-if="clarification.answer">
        <span class="text-monospace text-dark">{{ clarification.answer }}</span>
        <div v-if="!showUpdateAnswer" class="form-check mt-2 mt-xl-0">
          <label class="form-check-label">
            <input
              v-model="showUpdateAnswer"
              class="form-check-input"
              type="checkbox"
            />
            {{ T.clarificationUpdateAnswer }}
          </label>
        </div>
      </template>
      <form
        v-if="!clarification.answer || showUpdateAnswer"
        class="form-inline justify-content-between"
        data-form-clarification-answer
        @submit.prevent="sendClarificationResponse"
      >
        <div class="form-group mb-0">
          <select
            v-model="selectedResponse"
            class="form-control"
            data-select-answer
          >
            <option
              v-for="response in responses"
              :key="response.value"
              :value="response.value"
            >
              {{ response.text }}
            </option>
          </select>
        </div>
        <div v-if="selectedResponse === 'other'" class="form-group mt-1 mb-0">
          <textarea v-model="message" :placeholder="T.wordsAnswer"> </textarea>
        </div>
        <div class="d-flex justify-content-between w-100">
          <div class="form-check mt-2 mt-xl-0">
            <label class="form-check-label">
              <input
                v-model="isPublic"
                class="form-check-input"
                type="checkbox"
              />
              {{ T.wordsPublic }}
            </label>
          </div>
          <button class="btn btn-primary btn-sm mt-2" type="submit">
            {{ T.wordsSend }}
          </button>
        </div>
      </form>
    </td>
    <td
      v-else
      class="column-answer align-middle"
      data-clarification-answer-text
    >
      <span v-if="clarification.answer" class="text-monospace text-dark">{{
        clarification.answer
      }}</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import * as time from '../../time';
import * as ui from '../../ui';

const props = withDefaults(
  defineProps<{
    clarification: types.Clarification;
    isAdmin?: boolean;
    selected?: boolean;
  }>(),
  { isAdmin: false, selected: false },
);

const emit = defineEmits<{
  (e: 'clarification-response', response: types.Clarification): void;
}>();

const isPublic = ref(props.clarification.public);
const message = ref('');
const selectedResponse = ref('yes');
const showUpdateAnswer = ref(false);

const responses = [
  {
    value: 'yes',
    text: T.wordsYes,
  },
  {
    value: 'no',
    text: T.wordsNo,
  },
  {
    value: 'nocomment',
    text: T.wordsNoComment,
  },
  {
    value: 'readAgain',
    text: T.wordsReadAgain,
  },
  {
    value: 'other',
    text: T.wordsOther,
  },
];

const clarificationAuthorReceiver = computed((): string => {
  if (props.clarification.receiver) {
    return ui.formatString(T.clarificationsOnBehalf, {
      author: props.clarification.author,
      receiver: props.clarification.receiver,
    });
  }
  return props.clarification.author;
});

const isDirectMessage = computed(
  (): boolean =>
    props.clarification.answer == null && props.clarification.receiver != null,
);

const responseText = computed((): string => {
  const found = responses.find(
    (response) => response.value === selectedResponse.value,
  );
  if (!found) {
    return selectedResponse.value;
  }
  return selectedResponse.value === 'other' ? message.value : found.text;
});

function sendClarificationResponse(): void {
  const response: types.Clarification = {
    clarification_id: props.clarification.clarification_id,
    author: props.clarification.author,
    answer: responseText.value,
    public: isPublic.value,
    message: message.value,
    problem_alias: props.clarification.problem_alias,
    time: new Date(),
  };
  showUpdateAnswer.value = false;
  emit('clarification-response', response);
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';

.resolved {
  color: var(--clarification-resolved-font-color);
  background-image: linear-gradient(
    var(--clarification-resolved-gradient-from-background-color),
    var(--clarification-resolved-gradient-to-background-color)
  );
  background-color: var(--clarification-resolved-background-color);
}

.direct-message {
  color: var(--clarification-direct-message-font-color);
  background-image: linear-gradient(
    var(--clarification-direct-message-gradient-from-background-color),
    rgba(var(--clarification-direct-message-gradient-to-background-color), 0.5)
  );
  background-color: var(--clarification-direct-message-background-color);
}

.border {
  border-width: 3px !important;
}

span {
  font-size: 14px;
}
.column-info {
  min-width: 13rem;
  max-width: 14rem;
}
.column-message {
  min-width: 25rem;
  font-size: 14px;
}
.column-answer {
  min-width: 15rem;
}
</style>

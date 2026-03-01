<template>
  <OmegaupOverlayPopup @dismiss="emit('dismiss')">
    <form
      data-new-clarification
      class="d-flex flex-column h-100"
      @submit.prevent="onSubmit"
    >
      <div class="form-group row mt-5">
        <label class="col-md-6 col-form-label font-weight-bold">
          {{ T.wordsProblem }}
          <select
            v-model="currentProblemAlias"
            class="form-control"
            required="required"
            data-new-clarification-problem
          >
            <option
              v-for="problem in problems"
              :key="problem.alias"
              :value="problem.alias"
            >
              {{ problem.text }}
            </option>
          </select>
        </label>
        <label
          v-if="users.length != 0"
          class="col-md-6 col-form-label font-weight-bold"
        >
          {{ T.wordsMessageTo }}
          <select
            v-model="currentUsername"
            class="form-control"
            :required="users"
            data-new-clarification-user
          >
            <option
              v-for="user in filteredUsers"
              :key="user.username"
              :value="user.username"
            >
              {{ user.name }}
            </option>
          </select>
        </label>
      </div>
      <div class="form-group row">
        <label class="col-md-12 col-form-label font-weight-bold">
          {{ T.arenaClarificationCreate }}
          <textarea
            v-model="message"
            class="w-100"
            maxlength="200"
            required="required"
            :placeholder="T.arenaClarificationMaxLength"
            data-new-clarification-message
          ></textarea>
        </label>
      </div>
      <div class="form-group row">
        <div class="col-sm-10">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!canSubmitClarification"
          >
            {{ T.wordsSend }}
          </button>
        </div>
      </div>
    </form>
  </OmegaupOverlayPopup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupOverlayPopup from '../OverlayPopup.vue';

const props = withDefaults(
  defineProps<{
    problems?: types.NavbarProblemsetProblem[];
    users?: types.ContestUser[];
    problemAlias?: null | string;
    username?: null | string;
  }>(),
  {
    problems: () => [],
    users: () => [],
    problemAlias: null,
    username: null,
  },
);

const emit = defineEmits<{
  (
    e: 'new-clarification',
    payload: { clarification: types.Clarification; clearForm: () => void },
  ): void;
  (e: 'dismiss'): void;
}>();

const message = ref<null | string>(null);
const currentProblemAlias = ref(props.problemAlias);
const currentUsername = ref(props.username);

const filteredUsers = computed<{ username: string; name: string }[]>(() => {
  return props.users.map((user) => {
    return {
      username: user.username,
      name: !user.is_owner ? user.username : T.wordsPublic,
    };
  });
});

const ownerUsername = computed<null | string>(() => {
  return props.users.find((user) => user.is_owner)?.username ?? null;
});

const canSubmitClarification = computed<boolean>(() => {
  return (
    message.value != null &&
    (currentUsername.value != null || props.users.length == 0) &&
    currentProblemAlias.value != null
  );
});

function onSubmit(): void {
  if (currentProblemAlias.value == null || message.value == null) return;
  const clarificationRequest: types.Clarification = {
    clarification_id: 0,
    author: currentUsername.value ?? '',
    problem_alias: currentProblemAlias.value,
    message: message.value,
    public:
      ownerUsername.value != null &&
      currentUsername.value != null &&
      ownerUsername.value == currentUsername.value,
    time: new Date(),
  };
  emit('new-clarification', {
    clarification: clarificationRequest,
    clearForm: () => clearForm(),
  });
}

function clearForm(): void {
  emit('dismiss');
}
</script>

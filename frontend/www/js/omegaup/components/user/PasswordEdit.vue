<template>
  <form @submit.prevent="onUpdatePassword">
    <div class="form-group">
      <label>{{ T.userEditChangePasswordOldPassword }}</label>
      <div>
        <OmegaupPasswordInput
          v-model="oldPassword"
          data-old-password
          :size="30"
          :required="true"
          autocomplete="current-password"
        />
      </div>
    </div>
    <div class="form-group">
      <label>{{ T.userEditChangePasswordNewPassword }}</label>
      <div>
        <OmegaupPasswordInput
          v-model="newPassword"
          data-new-password
          :size="30"
          :required="true"
          autocomplete="new-password"
        />
      </div>
    </div>
    <div class="form-group">
      <label>{{ T.userEditChangePasswordRepeatNewPassword }}</label>
      <div>
        <OmegaupPasswordInput
          v-model="newPassword2"
          data-new-password2
          :size="30"
          :required="true"
          :input-class="invalidPasswordClass"
          autocomplete="new-password"
        />
        <div v-if="passwordMismatch" class="invalid-message">
          {{ T.passwordMismatch }}
        </div>
      </div>
    </div>
    <div>
      <button
        data-save-changed-password
        type="submit"
        class="btn btn-primary mr-2"
        :disabled="submitDisabled"
      >
        {{ T.wordsSaveChanges }}
      </button>
      <a href="/profile/" class="btn btn-cancel">{{ T.wordsCancel }}</a>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import T from '../../lang';
import OmegaupPasswordInput from '../common/PasswordInput.vue';

const emit = defineEmits<{
  (
    e: 'update-password',
    payload: { oldPassword: string; newPassword: string },
  ): void;
}>();

const oldPassword = ref('');
const newPassword = ref('');
const newPassword2 = ref('');

const passwordMismatch = computed((): boolean => {
  return newPassword.value != newPassword2.value;
});

const invalidPasswordClass = computed((): string => {
  return passwordMismatch.value ? 'invalid-input' : '';
});

const submitDisabled = computed((): boolean => {
  return (
    passwordMismatch.value ||
    newPassword.value.length === 0 ||
    newPassword2.value.length === 0 ||
    oldPassword.value.length === 0
  );
});

function onUpdatePassword(): void {
  if (passwordMismatch.value) {
    return;
  }
  emit('update-password', {
    oldPassword: oldPassword.value,
    newPassword: newPassword.value,
  });
}
</script>

<style lang="scss" scoped>
@import '../../../../sass/main.scss';
.invalid-input {
  border-color: var(--form-input-error-color);
}

.invalid-input:focus {
  box-shadow: 0 0 0 0.2rem var(--form-input-box-shadow-error-color);
}

.invalid-message {
  margin-top: 0.25rem;
  font-size: 80%;
  color: var(--form-input-error-color);
}
</style>

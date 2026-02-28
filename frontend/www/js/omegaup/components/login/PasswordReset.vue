<template>
  <div class="card">
    <h2 class="card-header">{{ T.passwordResetResetTitle }}</h2>
    <div class="card-body">
      <form>
        <div class="form-group">
          <h5>{{ T.passwordResetPassword }}</h5>
          <OmegaupPasswordInput
            v-model="password"
            name="password"
            autocomplete="new-password"
          />
        </div>
        <div class="form-group">
          <h5>{{ T.passwordResetPasswordConfirmation }}</h5>
          <OmegaupPasswordInput
            v-model="passwordConfirmation"
            name="password_confirmation"
            autocomplete="new-password"
          />
        </div>
        <div class="form-group">
          <button
            type="button"
            class="btn btn-primary form-control"
            @click.prevent="
              $emit(
                'reset-password',
                email,
                resetToken,
                password,
                passwordConfirmation,
              )
            "
          >
            {{ T.wordsSaveChanges }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../lang';
import OmegaupPasswordInput from '../common/PasswordInput.vue';

defineProps<{
  email?: string;
  resetToken?: string;
}>();

defineEmits<{
  (
    e: 'reset-password',
    email: string | undefined,
    resetToken: string | undefined,
    password: string,
    passwordConfirmation: string,
  ): void;
}>();

const password = ref('');
const passwordConfirmation = ref('');
</script>

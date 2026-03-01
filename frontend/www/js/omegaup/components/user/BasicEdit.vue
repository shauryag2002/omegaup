<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h2 class="panel-title">{{ T.userEditAddPassword }}</h2>
    </div>
    <div class="panel-body">
      <form class="form-horizontal" role="form" @submit.prevent="formSubmit">
        <div class="form-group">
          <label class="col-md-3 control-label" for="username">{{
            T.profileUsername
          }}</label>
          <div class="col-md-7">
            <input
              v-model="username"
              class="form-control"
              name="username"
              size="30"
              type="text"
            />
          </div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label" for="new-password-1">{{
            T.userEditChangePasswordNewPassword
          }}</label>
          <div class="col-md-7">
            <OmegaupPasswordInput
              v-model="newPassword1"
              name="new-password-1"
              :size="30"
              autocomplete="new-password"
            />
          </div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label" for="new-password-2">{{
            T.userEditChangePasswordRepeatNewPassword
          }}</label>
          <div class="col-md-7">
            <OmegaupPasswordInput
              v-model="newPassword2"
              name="new-password-2"
              :size="30"
              autocomplete="new-password"
            />
          </div>
        </div>
        <div class="form-group">
          <div class="col-md-offset-3 col-md-7">
            <button class="btn btn-primary" type="submit">
              {{ T.wordsSaveChanges }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../lang';
import * as ui from '../../ui';
import OmegaupPasswordInput from '../common/PasswordInput.vue';

const props = defineProps<{
  username: string;
}>();

const emit = defineEmits<{
  (e: 'update', username: string, newPassword: string): void;
}>();

const newPassword1 = ref('');
const newPassword2 = ref('');

function formSubmit(): void {
  if (newPassword1.value != newPassword2.value) {
    ui.error(T.userPasswordMustBeSame);
    return;
  }
  emit('update', props.username, newPassword1.value);
}
</script>

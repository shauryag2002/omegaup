<template>
  <div class="password-input-wrapper">
    <input
      v-bind="$attrs"
      :value="value"
      :type="showPassword ? 'text' : 'password'"
      :name="name"
      :class="['form-control', inputClass]"
      :tabindex="tabindex"
      :autocomplete="autocomplete"
      :size="size"
      :required="required"
      @input="$emit('input', $event.target.value)"
    />
    <button
      type="button"
      class="password-toggle-btn"
      :aria-label="
        showPassword ? T.passwordHidePassword : T.passwordShowPassword
      "
      :title="showPassword ? T.passwordHidePassword : T.passwordShowPassword"
      @click="togglePasswordVisibility"
    >
      <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../lang';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faEye, faEyeSlash);

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    value: string;
    name?: string;
    inputClass?: string;
    tabindex?: number | null;
    autocomplete?: string;
    size?: number | null;
    required?: boolean;
  }>(),
  {
    name: '',
    inputClass: '',
    tabindex: null,
    autocomplete: 'current-password',
    size: null,
    required: false,
  },
);

defineEmits<{
  (e: 'input', value: string): void;
}>();

const showPassword = ref(false);

function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value;
}
</script>

<style lang="scss" scoped>
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding-right: 40px;
  }

  .password-toggle-btn {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    color: var(--password-toggle-btn-color);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--password-toggle-btn-color--hover);
    }

    &:focus {
      outline: none;
      color: var(--password-toggle-btn-color--hover);
    }
  }
}
</style>

<template>
  <b-modal
    v-model="showModal"
    :title="T.logoutConfirmationTitle"
    :ok-title="T.wordsYes"
    :cancel-title="T.wordsNo"
    ok-variant="primary"
    cancel-variant="secondary"
    footer-class="logout-confirmation-modal"
    body-class="p-0"
    static
    lazy
    @ok="confirmLogout"
  >
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import T from '../../lang';

export default defineComponent({
  name: 'LogoutConfirmation',
  props: {
    value: { type: Boolean, default: false },
  },
  emits: ['input'],
  setup(props, { emit }) {
    const showModal = computed({
      get: () => props.value,
      set: (value: boolean) => emit('input', value),
    });

    function confirmLogout(): void {
      window.location.href = '/logout/';
    }

    return {
      T,
      showModal,
      confirmLogout,
    };
  },
});
</script>

<template>
  <div class="card">
    <h3 class="card-header">{{ T.wordsPrivacyPolicy }}</h3>
    <div class="card-body">
      <OmegaupMarkdown :markdown="policyMarkdown" />
      <form @submit.prevent="$emit('submit')">
        <div class="top-margin text-center">
          <label class="mr-5"
            ><input
              v-model="currentAgreed"
              name="agreed"
              type="checkbox"
              :disabled="saved"
            />
            {{ T.wordsAgree }}</label
          >
          <button class="btn btn-primary" :disabled="!currentAgreed || saved">
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

import OmegaupMarkdown from '../Markdown.vue';

const props = withDefaults(
  defineProps<{
    policyMarkdown: string;
    agreed?: boolean;
    saved: boolean;
  }>(),
  {
    agreed: false,
  },
);

defineEmits<{
  (e: 'submit'): void;
}>();

const currentAgreed = ref(props.agreed);
</script>

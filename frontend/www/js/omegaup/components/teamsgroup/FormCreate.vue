<template>
  <OmegaupTeamsGroupForm
    v-model:alias="alias"
    v-model:description="description"
    v-model:name="name"
    v-model:number-of-contestants="numberOfContestants"
    :max-number-of-contestants="maxNumberOfContestants"
    @submit="(request) => emit('create-teams-group', { ...request, alias })"
  >
    <template #teams-group-title>
      <div class="card-header">
        <h3 class="card-title">
          {{ T.omegaupTitleTeamsGroupNew }}
        </h3>
      </div>
    </template>
  </OmegaupTeamsGroupForm>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import OmegaupTeamsGroupForm from './FormBase.vue';
import T from '../../lang';
import latinize from 'latinize';

const props = withDefaults(
  defineProps<{
    maxNumberOfContestants?: number;
  }>(),
  {
    maxNumberOfContestants: 10,
  },
);

const emit = defineEmits<{
  (e: 'create-teams-group', request: unknown): void;
  (e: 'validate-unused-alias', alias: string): void;
}>();

const alias = ref<null | string>(null);
const description = ref<null | string>(null);
const name = ref<null | string>(null);
const numberOfContestants = ref(3);

function generateAlias(nameVal: string): string {
  // Remove accents
  return (
    latinize(nameVal)
      // Replace whitespace
      .replace(/\s+/g, '-')
      // Remove invalid characters
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 32)
  );
}

watch(alias, (newValue) => {
  if (newValue) {
    emit('validate-unused-alias', newValue);
  }
});

watch(name, (newValue) => {
  if (newValue) {
    alias.value = generateAlias(newValue);
  }
});
</script>

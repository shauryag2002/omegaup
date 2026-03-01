<template>
  <OmegaupTeamsGroupForm
    :alias="alias"
    v-model:description="currentDescription"
    v-model:name="currentName"
    v-model:number-of-contestants="currentNumberOfContestants"
    :max-number-of-contestants="maxNumberOfContestants"
    @submit="(request) => emit('update-teams-group', request)"
  >
    <template #teams-group-submit-button>
      {{ T.teamsGroupFormUpdate }}
    </template>
  </OmegaupTeamsGroupForm>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OmegaupTeamsGroupForm from './FormBase.vue';
import T from '../../lang';

const props = withDefaults(
  defineProps<{
    alias?: null | string;
    description?: null | string;
    name?: null | string;
    numberOfContestants?: number;
    maxNumberOfContestants?: number;
  }>(),
  {
    alias: null,
    description: null,
    name: null,
    numberOfContestants: 3,
    maxNumberOfContestants: 10,
  },
);

const emit = defineEmits<{
  (e: 'update-teams-group', request: unknown): void;
}>();

const currentDescription = ref<null | string>(props.description);
const currentName = ref<null | string>(props.name);
const currentNumberOfContestants = ref<number>(props.numberOfContestants);
</script>

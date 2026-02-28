<template>
  <TagsInput
    v-model="selectedOptions"
    :existing-tags="existingOptions"
    :typeahead="true"
    :typeahead-style="'dropdown'"
    :typeahead-max-results="maxResults"
    :typeahead-activation-threshold="activationThreshold"
    :placeholder="T.typeaheadSearchPlaceholder"
    :limit="0"
    :hide-input-on-limit="true"
    :only-existing-tags="true"
    :typeahead-hide-discard="true"
    @change="updateExistingOptions"
    @tag-added="emit('update:value', selectedOptions)"
    @tag-removed="emit('update:value', selectedOptions)"
  >
  </TagsInput>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TagsInput from '@voerro/vue-tagsinput';
import '@voerro/vue-tagsinput/dist/style.css';
import T from '../../lang';
import { types } from '../../api_types';

const props = withDefaults(
  defineProps<{
    existingOptions: types.ListItem[];
    activationThreshold?: number;
    maxResults?: number;
    value?: types.ListItem[];
  }>(),
  {
    activationThreshold: 3,
    maxResults: 10,
    value: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update:value', value: types.ListItem[]): void;
  (e: 'update-existing-options', query: string): void;
}>();

const selectedOptions = ref<types.ListItem[]>([]);

function updateExistingOptions(query: string): void {
  if (query.length < props.activationThreshold) return;
  emit('update-existing-options', query);
}

watch(
  () => props.value,
  (newValue: types.ListItem[]) => {
    selectedOptions.value = props.existingOptions.filter((option) =>
      newValue?.some((opt) => option.key === opt['key']),
    );
  },
);
</script>

<style lang="scss">
@import '../../../../sass/main.scss';

.tags-input-remove::before,
.tags-input-remove::after,
.tags-input-typeahead-item-highlighted-default {
  background-color: $omegaup-primary--darker;
}
</style>

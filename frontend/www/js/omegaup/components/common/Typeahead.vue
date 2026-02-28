<template>
  <TagsInput
    v-model="selectedOptions"
    :existing-tags="existingOptions"
    :typeahead="true"
    :typeahead-style="'dropdown'"
    :typeahead-max-results="maxResults"
    :typeahead-activation-threshold="activationThreshold"
    :placeholder="placeholder"
    :limit="1"
    :disabled="readonly"
    :hide-input-on-limit="true"
    :only-existing-tags="onlyExistingTags"
    :typeahead-hide-discard="typeaheadHideDiscard"
    :class="{ 'is-invalid': isInvalid }"
    @change="updateExistingOptions"
    @tag-added="onTagAdded"
    @tag-removed="onTagRemoved"
  >
  </TagsInput>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import TagsInput from '@voerro/vue-tagsinput';
import '@voerro/vue-tagsinput/dist/style.css';
import T from '../../lang';
import { types } from '../../api_types';

const props = withDefaults(
  defineProps<{
    existingOptions?: types.ListItem[];
    options?: types.ListItem[];
    activationThreshold?: number;
    maxResults?: number;
    value?: null | types.ListItem;
    onlyExistingTags?: boolean;
    readonly?: boolean;
    typeaheadHideDiscard?: boolean;
    placeholder?: string;
    debounceDelay?: number;
    isInvalid?: boolean;
  }>(),
  {
    existingOptions: () => [],
    options: () => [],
    activationThreshold: 3,
    maxResults: 5,
    value: null,
    onlyExistingTags: true,
    readonly: false,
    typeaheadHideDiscard: true,
    placeholder: () => T.typeaheadSearchPlaceholder,
    debounceDelay: 300,
    isInvalid: false,
  },
);

const emit = defineEmits<{
  (e: 'update-existing-options', query: string): void;
  (e: 'update:value', value: null | types.ListItem): void;
}>();

const selectedOptions = ref(props.options);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function updateExistingOptions(query: string): void {
  if (query.length < props.activationThreshold) return;

  // Clear any existing debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new debounce timer
  debounceTimer = setTimeout(() => {
    emit('update-existing-options', query);
  }, props.debounceDelay);
}

onBeforeUnmount(() => {
  // Clean up timer on component destruction
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});

function onTagAdded(): void {
  if (selectedOptions.value.length < 1) return;
  emit('update:value', selectedOptions.value[0]);
}

function onTagRemoved(): void {
  emit('update:value', null);
}

watch(
  () => props.value,
  (newValue: null | types.ListItem) => {
    if (!newValue) {
      selectedOptions.value = [];
      return;
    }
    props.existingOptions.push(newValue);
    selectedOptions.value = props.existingOptions.filter(
      (option) => option.key === newValue.key,
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

.tags-input-wrapper-default {
  height: 38px;
  padding: 0.375rem 0.75rem !important;
}

.tags-input.disabled {
  background-color: var(--typeahead-disabled);
  opacity: 1;
}

.tags-input.is-invalid .tags-input-wrapper-default {
  border-color: var(--form-input-error-color);
}
</style>

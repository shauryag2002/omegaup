<template>
  <div class="tags-input" :class="{ disabled: disabled, 'is-invalid': false }">
    <div class="tags-input-wrapper-default">
      <span
        v-for="(tag, index) in modelValue"
        :key="tag.key"
        class="tags-input-badge tags-input-badge-pill tags-input-badge-selected-default"
      >
        {{ tag.value }}
        <a
          v-if="!disabled"
          href="#"
          class="tags-input-remove"
          @click.prevent="removeTag(index)"
        ></a>
      </span>
      <input
        v-if="!hideInput"
        ref="inputRef"
        :value="query"
        type="text"
        :placeholder="currentPlaceholder"
        :disabled="disabled"
        autocomplete="off"
        class="tags-input-text"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.escape="showDropdown = false"
        @keydown.delete="onBackspace"
        @focus="showDropdown = true"
        @blur="onBlur"
      />
    </div>
    <div
      v-if="typeahead && showDropdown && filteredOptions.length > 0"
      class="typeahead-badges"
      :class="{
        'typeahead-dropdown': typeaheadStyle === 'dropdown',
        'typeahead-badges-list': typeaheadStyle === 'badges',
      }"
    >
      <span
        v-for="(option, index) in filteredOptions"
        :key="option.key"
        class="tags-input-typeahead-item-default"
        :class="{
          'tags-input-typeahead-item-highlighted-default':
            index === highlightedIndex,
        }"
        @mousedown.prevent="selectOption(option)"
      >
        {{ option.value }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface TagItem {
  key: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: TagItem[];
    existingTags?: TagItem[];
    typeahead?: boolean;
    typeaheadStyle?: string;
    typeaheadMaxResults?: number;
    typeaheadActivationThreshold?: number;
    typeaheadHideDiscard?: boolean;
    placeholder?: string;
    limit?: number;
    disabled?: boolean;
    hideInputOnLimit?: boolean;
    onlyExistingTags?: boolean;
    elementId?: string;
  }>(),
  {
    existingTags: () => [],
    typeahead: false,
    typeaheadStyle: 'badges',
    typeaheadMaxResults: 5,
    typeaheadActivationThreshold: 1,
    typeaheadHideDiscard: false,
    placeholder: '',
    limit: 0,
    disabled: false,
    hideInputOnLimit: false,
    onlyExistingTags: false,
    elementId: '',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: TagItem[]): void;
  (e: 'change', query: string): void;
  (e: 'tag-added', tag: TagItem): void;
  (e: 'tag-removed', tag: TagItem): void;
}>();

const query = ref('');
const showDropdown = ref(false);
const highlightedIndex = ref(-1);
const inputRef = ref<HTMLInputElement | null>(null);

const hideInput = computed((): boolean => {
  if (!props.hideInputOnLimit) return false;
  if (props.limit <= 0) return false;
  return props.modelValue.length >= props.limit;
});

const currentPlaceholder = computed((): string => {
  return props.modelValue.length === 0 ? props.placeholder : '';
});

const filteredOptions = computed((): TagItem[] => {
  if (!props.typeahead) return [];
  if (query.value.length < props.typeaheadActivationThreshold) return [];

  const q = query.value.toLowerCase();
  const selectedKeys = new Set(props.modelValue.map((t) => t.key));

  return props.existingTags
    .filter((tag) => {
      if (selectedKeys.has(tag.key)) return false;
      return (
        tag.value.toLowerCase().includes(q) ||
        tag.key.toLowerCase().includes(q)
      );
    })
    .slice(0, props.typeaheadMaxResults);
});

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  query.value = target.value;
  highlightedIndex.value = -1;
  showDropdown.value = true;
  emit('change', query.value);
}

function selectOption(option: TagItem): void {
  const newValue = [...props.modelValue, option];
  emit('update:modelValue', newValue);
  emit('tag-added', option);
  query.value = '';
  showDropdown.value = false;
  highlightedIndex.value = -1;
}

function removeTag(index: number): void {
  const removed = props.modelValue[index];
  const newValue = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', newValue);
  emit('tag-removed', removed);
}

function onEnter(): void {
  if (
    highlightedIndex.value >= 0 &&
    highlightedIndex.value < filteredOptions.value.length
  ) {
    selectOption(filteredOptions.value[highlightedIndex.value]);
  } else if (!props.onlyExistingTags && query.value.trim()) {
    const newTag: TagItem = {
      key: query.value.trim(),
      value: query.value.trim(),
    };
    selectOption(newTag);
  }
}

function onArrowDown(): void {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++;
  }
}

function onArrowUp(): void {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  }
}

function onBackspace(): void {
  if (query.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1);
  }
}

function onBlur(): void {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

watch(
  () => props.modelValue,
  () => {
    // If limit is reached, clear query
    if (props.limit > 0 && props.modelValue.length >= props.limit) {
      query.value = '';
    }
  },
);
</script>

<style lang="scss">
.tags-input {
  display: flex;
  flex-direction: column;
  position: relative;
}

.tags-input-wrapper-default {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  background-color: #fff;
  min-height: 38px;
  gap: 0.25rem;
}

.tags-input.disabled .tags-input-wrapper-default {
  background-color: #e9ecef;
  opacity: 1;
}

.tags-input-text {
  border: none;
  outline: none;
  flex: 1;
  min-width: 60px;
  background: transparent;
  padding: 0.125rem 0;
}

.tags-input-badge {
  display: inline-flex;
  align-items: center;
  background-color: #007bff;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

.tags-input-remove {
  display: inline-block;
  position: relative;
  width: 0.75rem;
  height: 0.75rem;
  margin-left: 0.35rem;
  cursor: pointer;
}

.tags-input-remove::before,
.tags-input-remove::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  top: 50%;
  left: 0;
  background-color: #fff;
}

.tags-input-remove::before {
  transform: rotate(45deg);
}

.tags-input-remove::after {
  transform: rotate(-45deg);
}

.typeahead-badges,
.typeahead-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  border: 1px solid #ced4da;
  border-top: none;
  max-height: 300px;
  overflow-y: auto;
}

.tags-input-typeahead-item-default {
  display: block;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.tags-input-typeahead-item-default:hover,
.tags-input-typeahead-item-highlighted-default {
  background-color: #007bff;
  color: #fff;
}
</style>

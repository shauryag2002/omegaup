<template>
  <div class="typeahead-bootstrap" :class="{ 'position-relative': true }">
    <input
      ref="inputRef"
      :value="modelValue"
      type="text"
      class="form-control"
      :class="inputClass"
      :placeholder="placeholder"
      :required="required"
      autocomplete="off"
      @input="onInput"
      @keydown.down.prevent="onArrowDown"
      @keydown.up.prevent="onArrowUp"
      @keydown.enter.prevent="onEnter"
      @keydown.escape="onEscape"
      @focus="showDropdown = true"
      @blur="onBlur"
    />
    <div
      v-if="showDropdown && filteredItems.length > 0"
      class="list-group typeahead-dropdown"
    >
      <button
        v-for="(item, index) in filteredItems"
        :key="index"
        type="button"
        class="list-group-item list-group-item-action"
        :class="{ active: index === highlightedIndex }"
        @mousedown.prevent="selectItem(item)"
      >
        {{ serializer(item) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    data: string[];
    modelValue?: string;
    serializer?: (item: string) => string;
    placeholder?: string;
    autoClose?: boolean;
    required?: boolean;
    inputClass?: string;
  }>(),
  {
    modelValue: '',
    serializer: (item: string) => item,
    placeholder: '',
    autoClose: true,
    required: false,
    inputClass: '',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'hit', item: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const showDropdown = ref(false);
const highlightedIndex = ref(-1);
const query = ref(props.modelValue);

const filteredItems = computed((): string[] => {
  if (!query.value) return [];
  const q = query.value.toLowerCase();
  return props.data.filter((item) => {
    const serialized = props.serializer(item).toLowerCase();
    return serialized.includes(q);
  });
});

watch(
  () => props.modelValue,
  (val) => {
    query.value = val;
  },
);

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  query.value = target.value;
  emit('update:modelValue', target.value);
  showDropdown.value = true;
  highlightedIndex.value = -1;
}

function selectItem(item: string): void {
  emit('hit', item);
  if (props.autoClose) {
    showDropdown.value = false;
  }
  query.value = '';
  emit('update:modelValue', '');
}

function onArrowDown(): void {
  if (highlightedIndex.value < filteredItems.value.length - 1) {
    highlightedIndex.value++;
  }
}

function onArrowUp(): void {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  }
}

function onEnter(): void {
  if (
    highlightedIndex.value >= 0 &&
    highlightedIndex.value < filteredItems.value.length
  ) {
    selectItem(filteredItems.value[highlightedIndex.value]);
  }
}

function onEscape(): void {
  showDropdown.value = false;
}

function onBlur(): void {
  // Delay to allow mousedown on dropdown items to fire first
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}
</script>

<style scoped>
.typeahead-dropdown {
  position: absolute;
  z-index: 1000;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}

.typeahead-dropdown .list-group-item.active {
  background-color: var(--bs-primary, #007bff);
  border-color: var(--bs-primary, #007bff);
  color: #fff;
}
</style>

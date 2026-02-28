<template>
  <div class="card">
    <div class="card-body">
      <h3 class="section-font-size text-center">{{ T.problemEditAddTags }}</h3>
      <div v-for="(tag, index) in tags" :key="index" class="form-check">
        <label class="form-check-label">
          <input
            v-model="currentSelectedTags"
            :value="tag.name"
            class="form-check-input"
            type="checkbox"
          />{{ `${T[tag.name]}  (${tag.problemCount})` }}
        </label>
      </div>
      <div class="form-group mt-2">
        <VueTypeaheadBootstrap
          :data="publicQualityTagNames"
          :serializer="publicQualityTagsSerializer"
          :placeholder="T.collecionOtherTags"
          @hit="addOtherTag"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap';

const props = withDefaults(
  defineProps<{
    publicQualityTags: types.TagWithProblemCount[];
    tags?: types.TagWithProblemCount[];
    selectedTags?: string[];
  }>(),
  {
    tags: () => [],
    selectedTags: () => [],
  },
);

const emit = defineEmits<{
  (e: 'new-selected-tag', tags: string[]): void;
}>();

const currentSelectedTags = ref(props.selectedTags);

const publicQualityTagNames = computed((): string[] =>
  props.publicQualityTags.map((x) => x.name),
);

function addOtherTag(tag: string): void {
  if (!currentSelectedTags.value.includes(tag)) {
    currentSelectedTags.value.push(tag);
  }
}

function publicQualityTagsSerializer(name: string): string {
  if (Object.prototype.hasOwnProperty.call(T, name)) {
    return T[name];
  }
  return name;
}

watch(currentSelectedTags, () => {
  emit('new-selected-tag', currentSelectedTags.value);
});
</script>

<style scoped>
.section-font-size {
  font-size: 1.44rem;
}
</style>

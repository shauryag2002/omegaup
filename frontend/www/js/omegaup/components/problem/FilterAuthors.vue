<template>
  <div class="mx-auto card col-12 col-sm-5 col-lg-12">
    <div class="card-body p-0 py-3 p-lg-3">
      <h3>{{ T.problemCollectionAuthors }}</h3>
      <div
        v-for="author in authors.ranking"
        :key="author.username"
        class="form-check"
      >
        <label class="form-check-label">
          <input
            v-model="currentSelectedAuthors"
            :value="author.username"
            class="form-check-input"
            type="checkbox"
          />
          <OmegaupUserUsername
            :linkify="true"
            :username="author.username"
            :name="author.name"
            :classname="author.classname"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import T from '../../lang';
import { types } from '../../api_types';
import OmegaupUserUsername from '../user/Username.vue';

const props = withDefaults(
  defineProps<{
    authors: types.AuthorsRank;
    selectedAuthors?: string[];
  }>(),
  {
    selectedAuthors: () => [],
  },
);

const emit = defineEmits<{
  (e: 'new-selected-author', authors: string[]): void;
}>();

const currentSelectedAuthors = ref(props.selectedAuthors);

watch(currentSelectedAuthors, () => {
  emit('new-selected-author', currentSelectedAuthors.value);
});
</script>

<style scoped>
.section-font-size {
  font-size: 1.44rem;
}
</style>

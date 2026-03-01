<template>
  <div class="card">
    <div class="card-body">
      <div class="form-group">
        <label class="font-weight-bold">{{ T.wordsPublicTags }}</label>
        <VueTypeaheadBootstrap
          v-if="canAddNewTags"
          v-model="newPublicTag"
          data-tags-input
          :data="publicTags"
          :serializer="publicTagsSerializer"
          :auto-close="true"
          :placeholder="T.publicTagsPlaceholder"
          :required="true"
          :input-class="errors.includes('public_tags') ? 'is-invalid' : ''"
          @hit="addPublicTag"
        >
        </VueTypeaheadBootstrap>
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th class="text-center w-50" scope="col">
              {{ T.contestEditTagName }}
            </th>
            <th class="pl-5" scope="col">
              {{ T.contestEditTagDelete }}
              <a
                v-if="!isLecture"
                data-toggle="tooltip"
                rel="tooltip"
                :title="T.problemEditTagPublicRequired"
              >
                <span class="question"></span>
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tag in selectedPublicTags" :key="tag">
            <td class="align-middle">
              <a :href="`/problem/?tag[]=${tag}`">
                {{
                  Object.prototype.hasOwnProperty.call(T, tag) ? T[tag] : tag
                }}
              </a>
            </td>
            <td class="text-center">
              <button
                type="button"
                class="btn btn-danger"
                :disabled="selectedPublicTags.length < 2 && !isLecture"
                @click="removeTag(tag, /*public=*/ true)"
              >
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="form-group">
        <label class="font-weight-bold">{{ T.wordsPrivateTags }}</label>
        <div class="input-group">
          <input
            v-model="newPrivateTag"
            type="text"
            class="form-control"
            :placeholder="T.privateTagsPlaceholder"
          />
          <div class="input-group-append">
            <button
              class="btn btn-outline-primary"
              type="button"
              :disabled="newPrivateTag === ''"
              @click.prevent="addPrivateTag"
            >
              {{ T.wordsAddTag }}
            </button>
          </div>
        </div>
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th class="text-center w-50" scope="col">
              {{ T.contestEditTagName }}
            </th>
            <th class="pl-5" scope="col">
              {{ T.contestEditTagDelete }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tag in selectedPrivateTags" :key="tag">
            <td class="align-middle">
              <a :href="`/problem/?tag[]=${tag}`">
                {{ tag }}
              </a>
            </td>
            <td class="text-center">
              <button
                type="button"
                class="btn btn-danger"
                @click="removeTag(tag, false /* public */)"
              >
                <FontAwesomeIcon :icon="['fas', 'trash']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="row mx-1">
        <div class="form-group w-100">
          <label class="font-weight-bold">{{ T.wordsLevel }}</label>
          <select
            v-model="problemLevelTag"
            required
            class="form-control"
            name="problem-level"
            @change="onSelectProblemLevel"
          >
            <option
              v-for="levelTag in levelTags"
              :key="levelTag"
              :value="levelTag"
            >
              {{ T[levelTag] }}
            </option>
          </select>
          <small class="form-text text-muted mb-2">{{ T.levelTagHelp }}</small>
          <template v-if="!isCreate">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!problemLevelTag || problemLevel === problemLevelTag"
              @click.prevent="onUpdateProblemLevel"
            >
              {{ T.updateProblemLevel }}
            </button>
            <button
              type="button"
              class="btn btn-danger ml-1"
              :disabled="!problemLevel"
              @click.prevent="onDeleteProblemLevel"
            >
              {{ T.deleteProblemLevel }}
            </button>
          </template>
        </div>
      </div>
      <div class="form-group">
        <OmegaupToggleSwitch
          v-model:value="allowTags"
          :checked-value="allowTags"
          :text-description="T.problemEditFormAllowUserAddTags"
        ></OmegaupToggleSwitch>
      </div>
    </div>
    <input
      v-if="!canAddNewTags"
      type="hidden"
      name="allow_user_add_tags"
      :value="allowTags"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import T from '../../lang';
import VueTypeaheadBootstrap from '../common/TypeaheadBootstrap.vue';
import OmegaupToggleSwitch from '../ToggleSwitch.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
library.add(faTrash);

const props = withDefaults(
  defineProps<{
    problemLevel?: string | null;
    publicTags: string[];
    selectedPublicTags: string[];
    selectedPrivateTags: string[];
    levelTags: string[];
    alias: string;
    title?: string;
    initialAllowTags?: boolean;
    canAddNewTags?: boolean;
    isCreate?: boolean;
    errors?: string[];
    isLecture: boolean;
  }>(),
  {
    problemLevel: null,
    title: '',
    initialAllowTags: true,
    canAddNewTags: false,
    isCreate: false,
    errors: () => [],
  },
);

const emit = defineEmits<{
  (e: 'emit-add-tag', alias: string, tag: string, isPublic: boolean): void;
  (e: 'emit-remove-tag', alias: string, tag: string, isPublic: boolean): void;
  (e: 'select-problem-level', level: string): void;
  (e: 'emit-update-problem-level', level?: string): void;
  (
    e: 'emit-change-allow-user-add-tag',
    alias: string,
    title: string,
    value: boolean,
  ): void;
}>();

const allowTags = ref(props.initialAllowTags);
const problemLevelTag = ref<string | null>(props.problemLevel);
const newPrivateTag = ref('');
const newPublicTag = ref('');

function addPublicTag(tag: string): void {
  if (props.canAddNewTags && !props.selectedPublicTags.includes(tag)) {
    emit('emit-add-tag', props.alias, tag, true);
  }
  newPublicTag.value = '';
}

function addPrivateTag(): void {
  if (
    props.canAddNewTags &&
    newPrivateTag.value !== '' &&
    !props.selectedPrivateTags.includes(newPrivateTag.value)
  ) {
    emit('emit-add-tag', props.alias, newPrivateTag.value, false);
    newPrivateTag.value = '';
  }
}

function removeTag(tag: string, isPublic: boolean): void {
  if (props.canAddNewTags) {
    emit('emit-remove-tag', props.alias, tag, isPublic);
  }
}

function onSelectProblemLevel(): void {
  if (problemLevelTag.value) {
    emit('select-problem-level', problemLevelTag.value);
  }
}

function onUpdateProblemLevel(): void {
  if (problemLevelTag.value) {
    emit('emit-update-problem-level', problemLevelTag.value);
  }
}

function onDeleteProblemLevel(): void {
  emit('emit-update-problem-level');
  problemLevelTag.value = null;
}

function publicTagsSerializer(tagname: string): string {
  if (Object.prototype.hasOwnProperty.call(T, tagname)) {
    return T[tagname];
  }
  return tagname;
}

watch(allowTags, (newValue: boolean) => {
  if (!props.canAddNewTags) {
    return;
  }
  emit('emit-change-allow-user-add-tag', props.alias, props.title, newValue);
});
</script>

<style>
.question {
  width: 20px;
  height: 20px;
  background: url('/media/question.png');
  display: inline-block;
  vertical-align: middle;
}

.question:hover {
  width: 25px;
  height: 25px;
  background: url('/media/question.png');
  background-size: 25px 25px;
  display: inline-block;
  vertical-align: middle;
}
</style>

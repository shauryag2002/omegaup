<template>
  <div class="card">
    <div class="card-body">
      <form class="form" @submit.prevent="onSubmit">
        <div class="form-group">
          <div class="row">
            <div class="form-group col-md-6">
              <label class="d-block">
                {{ T.wordsName }}
                <input
                  v-model="title"
                  class="form-control"
                  autocomplete="off"
                />
              </label>
            </div>

            <div class="form-group col-md-6">
              <label class="d-block">
                {{ T.contestNewFormShortTitleAlias }}
                <input :value="alias" class="form-control" disabled="true" />
              </label>
              <p class="help-block">
                {{ T.contestNewFormShortTitleAliasDesc }}
              </p>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-12">
              <label class="d-block">
                {{ T.groupNewFormDescription }}
                <textarea
                  v-model="description"
                  rows="5"
                  class="form-control"
                ></textarea>
              </label>
            </div>
          </div>

          <button class="btn btn-primary" type="submit">
            {{ T.groupEditScoreboardsAdd }}
          </button>
        </div>
      </form>
    </div>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>{{ T.groupEditScoreboards }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="scoreboard in scoreboards" :key="scoreboard.alias">
          <td>
            <a :href="`/group/${groupAlias}/scoreboard/${scoreboard.alias}/`">{{
              scoreboard.name
            }}</a>
          </td>
          <td>
            <a
              :href="`/group/${groupAlias}/scoreboard/${scoreboard.alias}/edit/`"
              :title="T.wordsEdit"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineExpose } from 'vue';
import T from '../../lang';
import latinize from 'latinize';
import { types } from '../../api_types';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
library.add(faEdit);

const props = defineProps<{
  scoreboards: types.GroupScoreboard[];
  groupAlias: string;
}>();

const emit = defineEmits<{
  (
    e: 'create-scoreboard',
    component: any,
    title: string | null,
    alias: string | null,
    description: string | null,
  ): void;
}>();

const title = ref<string | null>(null);
const alias = ref<string | null>(null);
const description = ref<string | null>(null);

watch(title, (newValue, oldValue) => {
  if (newValue === null || newValue === oldValue) {
    return;
  }
  alias.value = latinize(newValue)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .substring(0, 32);
});

function onSubmit(): void {
  emit(
    'create-scoreboard',
    { reset },
    title.value,
    alias.value,
    description.value,
  );
}

function reset(): void {
  title.value = null;
  alias.value = null;
  description.value = null;
}

defineExpose({ reset });
</script>

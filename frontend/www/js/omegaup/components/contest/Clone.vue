<template>
  <div class="card">
    <div class="card-body">
      <form
        class="form"
        @submit.prevent="
          emit('clone', { title, alias, description, startTime })
        "
      >
        <div class="row">
          <div class="form-group col-md-6">
            <label class="font-weight-bold">{{ T.wordsTitle }}</label>
            <input v-model="title" class="form-control" size="30" type="text" />
          </div>
          <div class="form-group col-md-6">
            <label class="font-weight-bold">
              {{ T.contestNewFormShortTitleAlias }}
              <font-awesome-icon
                :title="T.contestNewFormShortTitleAliasDesc"
                icon="info-circle"
              />
            </label>
            <input v-model="alias" class="form-control" type="text" />
          </div>
        </div>
        <div class="row">
          <div class="form-group col-md-6">
            <label class="font-weight-bold">{{
              T.contestNewFormDescription
            }}</label>
            <textarea
              v-model="description"
              class="form-control"
              cols="30"
              rows="10"
            ></textarea>
          </div>
          <div class="form-group col-md-4">
            <label class="font-weight-bold">
              {{ T.contestNewFormStartDate }}
              <font-awesome-icon
                :title="T.contestNewFormStartDateDesc"
                icon="info-circle"
              />
            </label>
            <OmegaupDatetime v-model="startTime"></OmegaupDatetime>
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-primary" type="submit">
            {{ T.wordsCloneContest }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../lang';
import OmegaupDatetime from '../DateTimePicker.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const emit = defineEmits<{
  (
    e: 'clone',
    payload: {
      title: string;
      alias: string;
      description: string;
      startTime: Date;
    },
  ): void;
}>();

const title = ref('');
const alias = ref('');
const description = ref('');
const startTime = ref(new Date());
</script>

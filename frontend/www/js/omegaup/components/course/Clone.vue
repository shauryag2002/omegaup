<template>
  <div data-course-clone>
    <form class="form" @submit.prevent="emit('clone', alias, name, startTime)">
      <div class="row">
        <div class="form-group col-md-6">
          <label
            >{{ T.wordsName }}
            <input v-model="name" class="form-control" type="text"
          /></label>
        </div>
        <div class="form-group col-md-3">
          <label
            >{{ T.courseNewFormShortTitleAlias }}
            <font-awesome-icon
              :title="T.courseNewFormShortTitleAliasDesc"
              icon="info-circle" />
            <input v-model="alias" class="form-control" type="text"
          /></label>
        </div>
        <div class="form-group col-md-3">
          <label
            >{{ T.courseNewFormStartDate }}
            <font-awesome-icon
              :title="T.courseNewFormStartDateDesc"
              icon="info-circle" />
            <OmegaupDatepicker v-model="startTime"></OmegaupDatepicker
          ></label>
        </div>
      </div>
      <div class="form-group text-right">
        <button class="btn btn-primary" type="submit">
          {{ T.wordsCloneCourse }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import T from '../../lang';
import OmegaupDatepicker from '../DatePicker.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const props = defineProps<{
  initialAlias: string;
  initialName: string;
}>();

const emit = defineEmits<{
  (e: 'clone', alias: string, name: string, startTime: Date): void;
}>();

const alias = ref(props.initialAlias);
const startTime = ref(new Date());
const name = ref(props.initialName);
</script>

<style scoped>
.form-group > label {
  width: 100%;
}

.faux-label {
  font-weight: bold;
}
</style>

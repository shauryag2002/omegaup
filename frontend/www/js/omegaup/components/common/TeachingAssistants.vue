<template>
  <div class="card mb-3 panel panel-primary">
    <div class="card-body panel-body">
      <form class="form" @submit.prevent="onSubmit">
        <div class="form-group mb-0">
          <label class="font-weight-bold w-100"
            >{{ T.courseEditTeachingAssistants }}
            <FontAwesomeIcon
              :title="T.courseEditAddTeachingAssistantsTooltip"
              icon="info-circle"
            />
            <OmegaupCommonTypeahead
              :existing-options="searchResultUsers"
              v-model:value="username"
              :max-results="10"
              @update-existing-options="
                (query) => emit('update-search-result-users', query)
              "
            />
          </label>
        </div>
        <button class="btn btn-primary" type="submit">
          {{ T.courseEditAddTeachingAssistants }}
        </button>
      </form>
    </div>
    <div v-if="currentTeachingAssistants.length === 0">
      <div class="empty-table-message">
        {{ T.courseEditTeachingAssistantsEmpty }}
      </div>
    </div>
    <table v-else class="table table-striped">
      <thead>
        <tr>
          <th>{{ T.contestEditRegisteredAdminUsername }}</th>
          <th>{{ T.contestEditRegisteredAdminRole }}</th>
          <th>{{ T.contestEditRegisteredAdminDelete }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="teachingAssistant in currentTeachingAssistants">
          <tr
            v-if="teachingAssistant.role !== 'teaching-assistant'"
            :key="teachingAssistant.username"
          >
            <td>
              <OmegaupUserUsername
                :linkify="true"
                :username="teachingAssistant.username"
              ></OmegaupUserUsername>
            </td>
            <td>{{ teachingAssistant.role }}</td>
            <td>
              <button
                v-if="teachingAssistant.role === 'teaching_assistant'"
                type="button"
                class="close"
                @click="onRemove(teachingAssistant)"
              >
                &times;
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { omegaup } from '../../omegaup';
import T from '../../lang';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';
import OmegaupUserUsername from '../user/Username.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { types } from '../../api_types';
library.add(fas);

const props = defineProps<{
  teachingAssistants: omegaup.UserRole[];
  searchResultUsers: types.ListItem[];
}>();

const emit = defineEmits<{
  (e: 'add-teaching-assistant', username: string | undefined): void;
  (e: 'remove-teaching-assistant', username: string): void;
  (e: 'update-search-result-users', query: string): void;
}>();

const username = ref<null | types.ListItem>(null);
const currentTeachingAssistants = ref(props.teachingAssistants);

watch(
  () => props.teachingAssistants,
  (newValue: omegaup.UserRole[]) => {
    currentTeachingAssistants.value = newValue;
  },
);

function onSubmit(): void {
  emit('add-teaching-assistant', username.value?.key);
  username.value = null;
}

function onRemove(teachingAssistant: omegaup.UserRole): void {
  emit('remove-teaching-assistant', teachingAssistant.username);
}
</script>

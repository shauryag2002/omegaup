<template>
  <div class="card">
    <div class="card-body">
      <form
        class="form"
        @submit.prevent="emit('add-group-teaching-assistant', group.key)"
      >
        <div class="form-group mb-0">
          <label class="font-weight-bold w-100"
            >{{ T.courseEditGroupTeachingAssistant }}
            <FontAwesomeIcon
              :title="T.courseEditAddGroupTeachingAssistantTooltip"
              icon="info-circle"
            />
            <OmegaupCommonTypeahead
              :existing-options="searchResultGroups"
              :value.sync="group"
              :max-results="10"
              @update-existing-options="
                (query) => emit('update-search-result-groups', query)
              "
            ></OmegaupCommonTypeahead>
          </label>
        </div>
        <button class="btn btn-primary" type="submit">
          {{ T.contestAddgroupAddGroup }}
        </button>
      </form>
    </div>
    <div v-if="groupTeachingAssistants.length === 0">
      <div class="my-2 empty-table-message">
        {{ T.courseEditGroupTeachingAssistantsEmpty }}
      </div>
    </div>
    <table v-else class="table table-striped mb-0">
      <thead>
        <tr>
          <th class="text-center">
            {{ T.contestEditRegisteredGroupAdminName }}
          </th>
          <th class="text-center">{{ T.contestEditRegisteredAdminRole }}</th>
          <th class="text-center">{{ T.contestEditRegisteredAdminDelete }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="groupTeachingAssistant in groupTeachingAssistants"
          :key="groupTeachingAssistant.alias"
        >
          <td>
            <a :href="`/group/${groupTeachingAssistant.alias}/edit/`">
              {{ groupTeachingAssistant.name }}
            </a>
          </td>
          <td class="text-center">{{ groupTeachingAssistant.role }}</td>
          <td class="text-center">
            <button
              v-if="groupTeachingAssistant.name !== 'teaching_assistant'"
              class="close float-none"
              type="button"
              @click="
                emit(
                  'remove-group-teaching-assistant',
                  groupTeachingAssistant.alias,
                )
              "
            >
              ×
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { types } from '../../api_types';
import T from '../../lang';
import OmegaupCommonTypeahead from '../common/Typeahead.vue';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(fas);

const props = defineProps<{
  groupTeachingAssistants: types.ContestGroupAdmin[];
  searchResultGroups: types.ListItem[];
}>();

const emit = defineEmits<{
  (e: 'add-group-teaching-assistant', key: string): void;
  (e: 'update-search-result-groups', query: string): void;
  (e: 'remove-group-teaching-assistant', alias: string): void;
}>();

const group = ref<null | types.ListItem>(null);

watch(
  () => props.groupTeachingAssistants,
  () => {
    group.value = null;
  },
);
</script>

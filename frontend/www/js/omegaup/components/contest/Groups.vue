<template>
  <div class="card mt-3">
    <div class="card-body">
      <form
        class="form"
        @submit.prevent="emit('emit-add-group', typeaheadGroup!.key)"
      >
        <div class="form-group">
          <label>{{ T.wordsGroup }}</label>
          <CommonTypeahead
            :existing-options="searchResultGroups"
            v-model:value="typeaheadGroup"
            @update-existing-options="
              (query: string) => emit('update-search-result-groups', query)
            "
          />
        </div>
        <button class="btn btn-primary" type="submit">
          {{ T.contestAddgroupAddGroup }}
        </button>
      </form>
    </div>
    <table class="table table-striped mb-0">
      <thead>
        <tr>
          <th class="text-center">
            {{ T.contestEditRegisteredGroupAdminName }}
          </th>
          <th class="text-center">{{ T.contestEditRegisteredAdminDelete }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="group in groups" :key="group.alias">
          <td>
            <a :href="`/group/${group.alias}/edit/`">{{ group.name }}</a>
          </td>
          <td class="text-center">
            <button
              class="close float-none"
              type="button"
              @click="emit('emit-remove-group', group.alias)"
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
import CommonTypeahead from '../common/Typeahead.vue';

const props = defineProps<{
  groups: types.ContestGroup[];
  searchResultGroups: types.ListItem[];
}>();

const emit = defineEmits<{
  (e: 'emit-add-group', key: string): void;
  (e: 'emit-remove-group', alias: string): void;
  (e: 'update-search-result-groups', query: string): void;
}>();

const typeaheadGroup = ref<types.ListItem | null>(null);
const selected = ref<types.ContestGroup | null>(null);

watch(
  () => props.groups,
  () => {
    typeaheadGroup.value = null;
    selected.value = null;
  },
);
</script>

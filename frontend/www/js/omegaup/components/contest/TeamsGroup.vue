<template>
  <div class="card mt-3">
    <div class="card-body">
      <form class="form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label>{{ T.wordsGroup }}</label>
          <OmegaupCommonTypeahead
            :existing-options="searchResultTeamsGroups"
            v-model:value="typeaheadGroup"
            :disabled="hasSubmissions"
            @update-existing-options="
              (query) => emit('update-search-result-teams-groups', query)
            "
          >
          </OmegaupCommonTypeahead>
        </div>
        <button
          class="btn btn-primary"
          type="submit"
          :disabled="hasSubmissions"
        >
          {{ T.contestEditTeamsGroupReplace }}
        </button>
      </form>
    </div>
    <table class="table table-striped mb-0">
      <thead>
        <tr>
          <th class="text-center">
            {{ T.contestEditRegisteredGroupAdminName }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr :key="teamsGroup.alias">
          <td>
            <a :href="`/teamsgroup/${teamsGroup.alias}/edit/#edit`">
              <OmegaupMarkdown :markdown="teamsGroup.name"></OmegaupMarkdown>
            </a>
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
import OmegaupMarkdown from '../Markdown.vue';

const props = defineProps<{
  teamsGroup: types.ContestGroup;
  searchResultTeamsGroups: types.ListItem[];
  hasSubmissions?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-search-result-teams-groups', query: string): void;
  (
    e: 'replace-teams-group',
    value: { alias: string | undefined; name: string | undefined },
  ): void;
}>();

const typeaheadGroup = ref<null | types.ListItem>(null);

function onSubmit(): void {
  const name = props.searchResultTeamsGroups.find(
    (teamsGroup) => teamsGroup.key === typeaheadGroup.value?.key,
  )?.value;
  emit('replace-teams-group', {
    alias: typeaheadGroup.value?.key,
    name,
  });
}

watch(
  () => props.teamsGroup,
  () => {
    typeaheadGroup.value = null;
  },
);
</script>
